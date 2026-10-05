/**
 * x402 Facilitator & EVM On-Chain Settlement Service.
 * Implements EIP-3009 transferWithAuthorization broadcast, pre-flight balance checking,
 * on-chain authorization state verification, and Base RPC receipt confirmation.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  isAddressEqual,
  decodeEventLog,
  parseAbiItem
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

export const BASE_MAINNET_RPC = 'https://mainnet.base.org';
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
export const USDC_MAINNET_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_SEPOLIA_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
export const PRODUCTION_PAY_TO = '0x829f877daAb94D766BB2b8511ad486C40f2C2BDA';

// USDC FiatTokenV2 EIP-3009 ABI fragments
export const USDC_EIP3009_ABI = [
  // balanceOf
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  // authorizationState(authorizer, nonce)
  {
    name: 'authorizationState',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'authorizer', type: 'address' },
      { name: 'nonce', type: 'bytes32' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  // transferWithAuthorization
  {
    name: 'transferWithAuthorization',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' }
    ],
    outputs: []
  },
  // Transfer event
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ]
  }
] as const;

export interface PreFlightCheckResult {
  ok: boolean;
  payerAddress: string;
  payerBalanceUSDC: string;
  hasSufficientBalance: boolean;
  nonceAlreadyUsedOnChain: boolean;
  error?: string;
}

export interface SettlementExecutionResult {
  settled: boolean;
  status: 'SETTLED_ON_CHAIN' | 'SETTLEMENT_FAILED' | 'INSUFFICIENT_BALANCE' | 'ALREADY_USED_ON_CHAIN' | 'UNBROADCAST';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
  reason?: string;
  details?: Record<string, any>;
}

/**
 * Creates public client for target network.
 */
export function getBasePublicClient(network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453') {
  const isMainnet = network === 'eip155:8453';
  return createPublicClient({
    chain: isMainnet ? base : baseSepolia,
    transport: http(isMainnet ? BASE_MAINNET_RPC : BASE_SEPOLIA_RPC)
  });
}

/**
 * 1. PRE-FLIGHT ON-CHAIN BALANCE & NONCE STATE VERIFICATION
 * Prior to executing settlement or delivering service, verify that:
 * - The payer actually holds sufficient USDC on-chain
 * - The nonce has not already been settled in the USDC contract
 */
export async function verifyOnChainPreFlight(
  authorizer: string,
  nonce: string,
  requiredAtomicValue: bigint,
  network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453'
): Promise<PreFlightCheckResult> {
  const publicClient = getBasePublicClient(network);
  const usdcAddress = network === 'eip155:8453' ? USDC_MAINNET_ADDRESS : USDC_SEPOLIA_ADDRESS;

  try {
    // 1. Read payer balance via RPC
    const balance = (await publicClient.readContract({
      address: usdcAddress as `0x${string}`,
      abi: USDC_EIP3009_ABI,
      functionName: 'balanceOf',
      args: [authorizer as `0x${string}`]
    })) as bigint;

    const balanceUSDC = (Number(balance) / 1e6).toFixed(2);
    const hasSufficientBalance = balance >= requiredAtomicValue;

    // 2. Read authorizationState(from, nonce) via RPC
    let nonceAlreadyUsedOnChain = false;
    try {
      nonceAlreadyUsedOnChain = (await publicClient.readContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_EIP3009_ABI,
        functionName: 'authorizationState',
        args: [authorizer as `0x${string}`, nonce as `0x${string}`]
      })) as boolean;
    } catch {
      // Some mocks or older contracts may not expose authorizationState
      nonceAlreadyUsedOnChain = false;
    }

    if (!hasSufficientBalance) {
      return {
        ok: false,
        payerAddress: authorizer,
        payerBalanceUSDC: balanceUSDC,
        hasSufficientBalance: false,
        nonceAlreadyUsedOnChain,
        error: `Insufficient on-chain USDC balance: payer has ${balanceUSDC} USDC, but ${Number(requiredAtomicValue) / 1e6} USDC is required.`
      };
    }

    if (nonceAlreadyUsedOnChain) {
      return {
        ok: false,
        payerAddress: authorizer,
        payerBalanceUSDC: balanceUSDC,
        hasSufficientBalance: true,
        nonceAlreadyUsedOnChain: true,
        error: `Payment nonce ${nonce} has already been executed on-chain (authorizationState is true).`
      };
    }

    return {
      ok: true,
      payerAddress: authorizer,
      payerBalanceUSDC: balanceUSDC,
      hasSufficientBalance: true,
      nonceAlreadyUsedOnChain: false
    };
  } catch (err: any) {
    // RPC connectivity failure
    return {
      ok: false,
      payerAddress: authorizer,
      payerBalanceUSDC: '0.00',
      hasSufficientBalance: false,
      nonceAlreadyUsedOnChain: false,
      error: `Failed to query Base RPC for on-chain payer balance: ${err?.message || 'RPC Timeout'}`
    };
  }
}

/**
 * 2. VERIFY A PRE-SETTLED ON-CHAIN TRANSACTION HASH
 * When an agent or external facilitator broadcasts transferWithAuthorization directly,
 * this function verifies that the transaction was mined on Base and transferred >= value to payTo.
 */
export async function verifyOnChainSettlementTx(
  txHash: string,
  expectedPayTo: string = PRODUCTION_PAY_TO,
  expectedMinimumAtomic: bigint = BigInt('9500000'),
  network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453'
): Promise<SettlementExecutionResult> {
  if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
    return {
      settled: false,
      status: 'SETTLEMENT_FAILED',
      error: 'Invalid transaction hash format'
    };
  }

  const publicClient = getBasePublicClient(network);
  const usdcAddress = network === 'eip155:8453' ? USDC_MAINNET_ADDRESS : USDC_SEPOLIA_ADDRESS;

  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (receipt.status !== 'success') {
      return {
        settled: false,
        status: 'SETTLEMENT_FAILED',
        txHash,
        blockNumber: Number(receipt.blockNumber),
        error: 'On-chain transaction execution reverted (status: failed)'
      };
    }

    // Inspect event logs for ERC-20 Transfer to expectedPayTo
    let confirmedTransferFound = false;
    let actualTransferredAmount = BigInt(0);

    for (const log of receipt.logs) {
      if (isAddressEqual(log.address, usdcAddress as `0x${string}`)) {
        try {
          const decoded = decodeEventLog({
            abi: USDC_EIP3009_ABI,
            eventName: 'Transfer',
            data: log.data,
            topics: log.topics
          });

          if (isAddressEqual(decoded.args.to, expectedPayTo as `0x${string}`)) {
            if (decoded.args.value >= expectedMinimumAtomic) {
              confirmedTransferFound = true;
              actualTransferredAmount = decoded.args.value;
              break;
            }
          }
        } catch {
          // Continue scanning logs
        }
      }
    }

    if (!confirmedTransferFound) {
      return {
        settled: false,
        status: 'SETTLEMENT_FAILED',
        txHash,
        blockNumber: Number(receipt.blockNumber),
        error: `Transaction confirmed in block #${receipt.blockNumber}, but no USDC Transfer event to ${expectedPayTo} for >= ${Number(expectedMinimumAtomic) / 1e6} USDC was found.`
      };
    }

    return {
      settled: true,
      status: 'SETTLED_ON_CHAIN',
      txHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      details: {
        amountTransferredUSDC: (Number(actualTransferredAmount) / 1e6).toFixed(2),
        payTo: expectedPayTo,
        network
      }
    };
  } catch (err: any) {
    return {
      settled: false,
      status: 'SETTLEMENT_FAILED',
      txHash,
      error: `Could not verify transaction on Base RPC: ${err?.message || 'Transaction not found or pending'}`
    };
  }
}

/**
 * 3. EXECUTE SETTLEMENT VIA FACILITATOR OR DIRECT RELAYER
 * Submits the signed transferWithAuthorization payload to:
 * 1) External Facilitator API if FACILITATOR_URL is configured
 * 2) Direct Relayer wallet if SETTLEMENT_RELAYER_KEY is configured
 * 3) If neither is available, honestly reports that settlement was not broadcast!
 */
export async function executeSettlement(
  authorization: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
    v?: number;
    r?: string;
    s?: string;
    signature?: string;
  },
  network: 'eip155:8453' | 'eip155:84532' = 'eip155:8453',
  clientProvidedTxHash?: string
): Promise<SettlementExecutionResult> {
  const requiredAmount = BigInt(authorization.value || '9500000');

  // Case A: Client provided a pre-settled on-chain transaction hash
  if (clientProvidedTxHash) {
    return await verifyOnChainSettlementTx(
      clientProvidedTxHash,
      authorization.to,
      requiredAmount,
      network
    );
  }

  // Pre-flight check: verify on-chain balance and authorization state
  const preFlight = await verifyOnChainPreFlight(
    authorization.from,
    authorization.nonce,
    requiredAmount,
    network
  );

  if (!preFlight.ok) {
    if (!preFlight.hasSufficientBalance) {
      return {
        settled: false,
        status: 'INSUFFICIENT_BALANCE',
        error: preFlight.error,
        reason: `Payer address ${authorization.from} has 0.00 USDC on Base. Required: ${Number(requiredAmount) / 1e6} USDC.`
      };
    }
    if (preFlight.nonceAlreadyUsedOnChain) {
      return {
        settled: false,
        status: 'ALREADY_USED_ON_CHAIN',
        error: preFlight.error,
        reason: 'Payment authorization nonce has already been consumed on-chain.'
      };
    }
    return {
      settled: false,
      status: 'SETTLEMENT_FAILED',
      error: preFlight.error
    };
  }

  // Case B: External Facilitator Service (e.g. Coinbase CDP / Agent402 Facilitator)
  const facilitatorUrl = process.env.FACILITATOR_URL || process.env.VITE_FACILITATOR_URL;
  if (facilitatorUrl) {
    try {
      const response = await fetch(`${facilitatorUrl.replace(/\/$/, '')}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme: 'exact',
          network,
          authorization
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.txHash || data.transactionHash) {
          const hash = data.txHash || data.transactionHash;
          // Verify on Base RPC
          return await verifyOnChainSettlementTx(hash, authorization.to, requiredAmount, network);
        }
      }
    } catch {
      // Fall through to next settlement method
    }
  }

  // Case C: Direct Settlement via Relayer Private Key
  const relayerKey = process.env.SETTLEMENT_RELAYER_KEY || process.env.OPERATOR_PRIVATE_KEY;
  if (relayerKey && relayerKey.startsWith('0x') && relayerKey.length === 66) {
    try {
      const isMainnet = network === 'eip155:8453';
      const targetChain = isMainnet ? base : baseSepolia;
      const account = privateKeyToAccount(relayerKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: targetChain,
        transport: http(isMainnet ? BASE_MAINNET_RPC : BASE_SEPOLIA_RPC)
      });
      const publicClient = getBasePublicClient(network);
      const usdcAddress = isMainnet ? USDC_MAINNET_ADDRESS : USDC_SEPOLIA_ADDRESS;

      // Unpack v, r, s
      let v = authorization.v;
      let r = authorization.r;
      let s = authorization.s;

      if ((!v || !r || !s) && authorization.signature) {
        const sig = authorization.signature.replace('0x', '');
        if (sig.length >= 130) {
          r = '0x' + sig.slice(0, 64);
          s = '0x' + sig.slice(64, 128);
          v = parseInt(sig.slice(128, 130), 16);
          if (v < 27) v += 27;
        }
      }

      if (v && r && s) {
        const hash = await walletClient.writeContract({
          address: usdcAddress as `0x${string}`,
          abi: USDC_EIP3009_ABI,
          functionName: 'transferWithAuthorization',
          args: [
            authorization.from as `0x${string}`,
            authorization.to as `0x${string}`,
            BigInt(authorization.value),
            BigInt(authorization.validAfter),
            BigInt(authorization.validBefore),
            authorization.nonce as `0x${string}`,
            Number(v),
            r as `0x${string}`,
            s as `0x${string}`
          ]
        });

        // Await confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === 'success') {
          return {
            settled: true,
            status: 'SETTLED_ON_CHAIN',
            txHash: hash,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: receipt.gasUsed.toString(),
            details: {
              relayer: account.address,
              amountTransferredUSDC: (Number(requiredAmount) / 1e6).toFixed(2),
              network
            }
          };
        }
      }
    } catch (err: any) {
      return {
        settled: false,
        status: 'SETTLEMENT_FAILED',
        error: `Relayer broadcast reverted: ${err?.message || 'Execution error'}`
      };
    }
  }

  // Case D: NO SETTLEMENT BROADCAST OCCURRED
  // This is the critical honest path:
  // The signature was verified, but the transaction was NOT submitted to Base!
  return {
    settled: false,
    status: 'UNBROADCAST',
    error: 'Payment authorization verified cryptographically, but on-chain settlement was not broadcast to Base blockchain.',
    reason: `Neither an external Facilitator (/settle) nor a funded Relayer broadcasted the transferWithAuthorization transaction. Target payout wallet ${authorization.to} has not received funds.`
  };
}
