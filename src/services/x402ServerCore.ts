/**
 * Production x402 HTTP Resource Server Core.
 * Implements RFC 9110 HTTP 402 + EIP-712 ERC-3009 Exact EVM Payment Scheme on Base Mainnet.
 */

import { verifyTypedData, isAddressEqual, hexToBytes } from 'viem';
import { analyzeContractRisk } from './sentinelShieldCore';
import { SentinelShieldInput, PaymentRequirementResponse, SentinelShieldOutput } from '../types/x402';
import { executeSettlement, verifyOnChainSettlementTx, SettlementExecutionResult } from './x402Facilitator';

export const PRODUCTION_PAY_TO = '0x829f877daAb94D766BB2b8511ad486C40f2C2BDA';
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_USDC_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const BASE_USDC_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
export const FACILITATOR_MAINNET = '0x4020000000000000000000000000000000000402';

export const SENTINEL_PRICE_USDC = 9.50;
export const SENTINEL_PRICE_ATOMIC = '9500000'; // 6 decimals

// In-memory replay protection cache (nonces)
const usedNonces = new Set<string>();

export interface PaymentAuthorizationPayload {
  scheme?: string;
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  chainId?: number;
  tokenAddress?: string;
  v?: number;
  r?: string;
  s?: string;
  signature?: string;
}

export function generatePaymentRequirements(
  network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453',
  resourceUri: string = '/sentinelshield'
): PaymentRequirementResponse {
  const chainId = network === 'eip155:8453' ? BASE_MAINNET_CHAIN_ID : BASE_SEPOLIA_CHAIN_ID;
  const tokenAddress = network === 'eip155:8453' ? BASE_USDC_MAINNET : BASE_USDC_SEPOLIA;
  const now = Math.floor(Date.now() / 1000);

  // Generate dynamic 32-byte session nonce challenge
  const randomBytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  }
  const nonce = '0x' + Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    error: 'Payment Required',
    message: 'Access to SentinelShield Contract Risk Triage requires x402 payment authorization.',
    paymentRequirements: {
      version: '1.0',
      scheme: 'exact',
      network,
      chainId,
      token: 'USDC',
      tokenAddress,
      amount: SENTINEL_PRICE_ATOMIC,
      amountUSD: SENTINEL_PRICE_USDC,
      payTo: PRODUCTION_PAY_TO,
      facilitator: FACILITATOR_MAINNET,
      resource: resourceUri,
      description: 'SentinelShield Contract Risk Triage & SARIF Vulnerability Matrix',
      validAfter: now - 120, // 2 minutes grace
      validBefore: now + 3600, // 1 hour validity
      nonce,
      eip712Domain: {
        name: 'USD Coin',
        version: '2',
        chainId,
        verifyingContract: tokenAddress
      },
      types: {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      }
    }
  };
}

export interface VerificationResult {
  valid: boolean;
  status: number;
  reason?: string;
  signer?: string;
  authorization?: PaymentAuthorizationPayload;
}

export async function verifyPaymentAuthorization(
  auth: any,
  expectedNetwork: 'eip155:8453' | 'eip155:84532' = 'eip155:8453'
): Promise<VerificationResult> {
  if (!auth || typeof auth !== 'object') {
    return { valid: false, status: 402, reason: 'Missing or empty payment authorization payload' };
  }

  // TEST 4: Invalid payment payload checks
  if (!auth.from || !auth.to || !auth.value || !auth.nonce) {
    return { valid: false, status: 400, reason: 'Malformed payment payload: missing required EIP-712 fields (from, to, value, nonce)' };
  }

  // TEST 7: Wrong Recipient Check
  try {
    if (!isAddressEqual(auth.to as `0x${string}`, PRODUCTION_PAY_TO as `0x${string}`)) {
      return {
        valid: false,
        status: 400,
        reason: `Payment rejected: invalid recipient. Expected payTo ${PRODUCTION_PAY_TO}, received ${auth.to}`
      };
    }
  } catch {
    return { valid: false, status: 400, reason: 'Invalid recipient address format' };
  }

  // TEST 8: Wrong Amount Check
  try {
    const valueBig = BigInt(auth.value);
    const requiredBig = BigInt(SENTINEL_PRICE_ATOMIC);
    if (valueBig < requiredBig) {
      return {
        valid: false,
        status: 400,
        reason: `Payment rejected: insufficient amount. Required ${SENTINEL_PRICE_ATOMIC} ($9.50 USDC), received ${auth.value}`
      };
    }
  } catch {
    return { valid: false, status: 400, reason: 'Malformed payment value format' };
  }

  // TEST 9: Wrong Network Check
  const expectedChainId = expectedNetwork === 'eip155:8453' ? BASE_MAINNET_CHAIN_ID : BASE_SEPOLIA_CHAIN_ID;
  if (auth.chainId && Number(auth.chainId) !== expectedChainId) {
    return {
      valid: false,
      status: 400,
      reason: `Payment rejected: wrong network. Target endpoint requires chainId ${expectedChainId} (${expectedNetwork}), received ${auth.chainId}`
    };
  }

  // Time window checks
  const now = Math.floor(Date.now() / 1000);
  if (auth.validBefore && Number(auth.validBefore) < now) {
    return { valid: false, status: 400, reason: 'Payment authorization has expired (validBefore < now)' };
  }

  // TEST 6: Replay / Double-Spend Protection
  const nonceKey = `${auth.from.toLowerCase()}-${auth.nonce.toLowerCase()}`;
  if (usedNonces.has(nonceKey)) {
    return {
      valid: false,
      status: 400,
      reason: 'Payment rejected: nonce has already been settled (Replay Protection Triggered)'
    };
  }

  // Signature check: must be provided
  const sig = auth.signature || (auth.r && auth.s && auth.v ? `${auth.r}${auth.s.replace('0x', '')}${Number(auth.v).toString(16).padStart(2, '0')}` : null);
  if (!sig || typeof sig !== 'string' || sig.length < 65) {
    return { valid: false, status: 400, reason: 'Invalid or missing cryptographic signature' };
  }

  // Real EIP-712 typed signature verification using viem
  const tokenAddress = expectedNetwork === 'eip155:8453' ? BASE_USDC_MAINNET : BASE_USDC_SEPOLIA;
  try {
    const verified = await verifyTypedData({
      address: auth.from as `0x${string}`,
      domain: {
        name: 'USD Coin',
        version: '2',
        chainId: BigInt(expectedChainId),
        verifyingContract: tokenAddress as `0x${string}`
      },
      types: {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      },
      primaryType: 'TransferWithAuthorization',
      message: {
        from: auth.from as `0x${string}`,
        to: PRODUCTION_PAY_TO as `0x${string}`,
        value: BigInt(auth.value),
        validAfter: BigInt(auth.validAfter || 0),
        validBefore: BigInt(auth.validBefore || now + 3600),
        nonce: auth.nonce as `0x${string}`
      },
      signature: sig as `0x${string}`
    });

    if (!verified) {
      return { valid: false, status: 400, reason: 'EIP-712 signature verification failed: recovered signer does not match from address' };
    }
  } catch (err: any) {
    // If signature bytes are invalid
    return { valid: false, status: 400, reason: `EIP-712 signature validation error: ${err?.message || 'Malformed signature'}` };
  }

  // Mark nonce as spent
  usedNonces.add(nonceKey);

  return {
    valid: true,
    status: 200,
    signer: auth.from,
    authorization: auth
  };
}

export async function handlePaidSentinelRequest(
  input: SentinelShieldInput,
  authPayload?: any,
  network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453',
  clientTxHash?: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: any }> {
  // 1. If unpaid -> Return 402 with RFC WWW-Authenticate and requirements
  if (!authPayload) {
    const reqs = generatePaymentRequirements(network, '/sentinelshield');
    return {
      statusCode: 402,
      headers: {
        'Content-Type': 'application/json',
        'x402-version': '1.0',
        'WWW-Authenticate': `x402 token="USDC", network="${network}", amount="${SENTINEL_PRICE_ATOMIC}", payTo="${PRODUCTION_PAY_TO}", facilitator="${FACILITATOR_MAINNET}", scheme="exact"`
      },
      body: reqs
    };
  }

  // 2. Cryptographic and parameter verification
  const verifyRes = await verifyPaymentAuthorization(authPayload, network);
  if (!verifyRes.valid) {
    return {
      statusCode: verifyRes.status,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Payment Authorization Rejected',
        reason: verifyRes.reason,
        payToExpected: PRODUCTION_PAY_TO,
        requiredAmount: `${SENTINEL_PRICE_USDC} USDC`
      }
    };
  }

  // 3. Settlement pipeline: On-chain pre-flight check + Facilitator / Relayer broadcast
  // CRITICAL: verifyTypedData() != payment settlement! Real money must be transferred to payTo.
  const settlementRes = await executeSettlement(
    verifyRes.authorization!,
    network,
    clientTxHash || authPayload.txHash
  );

  if (!settlementRes.settled) {
    return {
      statusCode: 402,
      headers: {
        'Content-Type': 'application/json',
        'x402-settlement': 'unsettled',
        'WWW-Authenticate': `x402 token="USDC", network="${network}", amount="${SENTINEL_PRICE_ATOMIC}", payTo="${PRODUCTION_PAY_TO}", facilitator="${FACILITATOR_MAINNET}", scheme="exact"`
      },
      body: {
        error: 'Payment Settlement Incomplete',
        status: settlementRes.status,
        signatureVerified: true,
        settledOnChain: false,
        reason: settlementRes.reason || settlementRes.error,
        payer: verifyRes.signer,
        payToExpected: PRODUCTION_PAY_TO,
        requiredAmount: `${SENTINEL_PRICE_USDC} USDC`,
        ourRevenueCounted: false,
        details: settlementRes.details
      }
    };
  }

  // 4. ONLY execute SentinelShield analysis when settlement is confirmed on Base blockchain!
  const outcome: SentinelShieldOutput = await analyzeContractRisk(input);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'x402-settlement': 'confirmed',
      'x402-tx-hash': settlementRes.txHash || '',
      'x402-block-number': String(settlementRes.blockNumber || '')
    },
    body: {
      success: true,
      service: 'SentinelShield Contract Risk Triage',
      payment: {
        status: 'SETTLED_ON_CHAIN',
        txHash: settlementRes.txHash,
        blockNumber: settlementRes.blockNumber,
        gasUsed: settlementRes.gasUsed,
        amountUSDC: SENTINEL_PRICE_USDC,
        payTo: PRODUCTION_PAY_TO,
        network,
        signer: verifyRes.signer,
        verifiedOnRpc: true
      },
      outcome
    }
  };
}
