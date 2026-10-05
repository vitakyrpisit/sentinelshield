/**
 * SentinelShield Production Server — OFFICIAL x402 v2 PAYMENT MIDDLEWARE EDITION.
 *
 * CRITICAL FIX (per operator final patch 2026-10-05):
 *   Previous version used manual handlePaidSentinelRequest() which called a local
 *   facilitator stub returning 501/UNBROADCAST. NO real settlement happened.
 *
 * Now uses official paymentMiddleware from @x402/express which:
 *   1. Returns 402 + PAYMENT-REQUIRED header (official v2 wire protocol)
 *   2. Calls facilitator /verify (real on-chain signature + balance check)
 *   3. Calls facilitator /settle (real Base Mainnet broadcast → real txHash)
 *   4. ONLY THEN calls route handler (SentinelShield analysis)
 *
 * The route handler runs ONLY after confirmed settlement.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { HTTPFacilitatorClient } from '@x402/core/http';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { declareDiscoveryExtension } from '@x402/extensions/bazaar';
import { analyzeContractRisk } from './src/services/sentinelShieldCore';
import { fetchLiveOnChainStatus } from './src/services/baseRpc';
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// ═══ IMMUTABLE PRODUCTION CONFIG ═══════════════════════════════════════
const PAY_TO = '0x829f877daAb94D766BB2b8511ad486C40f2C2BDA';
const NETWORK = 'eip155:8453'; // Base Mainnet
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PRICE = '$9.50';
const PRICE_ATOMIC = '9500000';

// Facilitator: PayAI (keyless, supports Base Mainnet eip155:8453 exact)
// Verified via GET /supported: v2 | exact | eip155:8453 ✓
// No API key needed. No CDP account required.
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';

console.log('═══════════════════════════════════════════════════════');
console.log('  SentinelShield — OFFICIAL x402 v2 Production Server');
console.log('═══════════════════════════════════════════════════════');
console.log(`  PAY_TO:       ${PAY_TO}`);
console.log(`  NETWORK:      ${NETWORK} (Base Mainnet)`);
console.log(`  USDC:         ${USDC_BASE}`);
console.log(`  PRICE:        ${PRICE} (${PRICE_ATOMIC} atomic)`);
console.log(`  FACILITATOR:  ${FACILITATOR_URL}`);
console.log(`  MIDDLEWARE:   paymentMiddleware (@x402/express)`);
console.log('═══════════════════════════════════════════════════════');

// ═══ OFFICIAL x402 v2 RESOURCE SERVER ═════════════════════════════════
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme(),
);

// ═══ BAZAAR DISCOVERY EXTENSION ══════════════════════════════════════
const bazaarExtension = declareDiscoveryExtension({
  bodyType: 'json',
  input: { chain: 'base', contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  inputSchema: {
    type: 'object',
    properties: {
      chain: { type: 'string', enum: ['base', 'ethereum'], default: 'base' },
      contractAddress: {
        type: 'string',
        description: 'EVM contract address to audit (0x + 40 hex)',
        pattern: '^0x[a-fA-F0-9]{40}$',
      },
    },
    required: ['contractAddress'],
  },
  output: {
    example: {
      riskLevel: 'LOW',
      overallScore: 94,
      summary: 'SentinelShield audited target. Bytecode verified on Base L2.',
      exploitability: 'NONE',
      findings: [],
    },
    schema: {
      type: 'object',
      properties: {
        riskLevel: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SECURE'] },
        overallScore: { type: 'number', minimum: 0, maximum: 100 },
        summary: { type: 'string' },
        exploitability: { type: 'string' },
        findings: { type: 'array' },
        sarif: { type: 'object' },
      },
      required: ['riskLevel', 'overallScore', 'summary'],
    },
  },
});

// ═══ EXPRESS APP ════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3030;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '5mb' }));

// ── 1. FREE HEALTH ENDPOINT (no payment required) ──────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'sentinelshield',
    network: 'base',
    payment: 'x402',
    price: '9.50 USDC',
    facilitator: FACILITATOR_URL,
    middleware: 'paymentMiddleware (@x402/express)',
  });
});

// ── 2. DISCOVERY MANIFEST ────────────────────────────────────────────
app.get('/.well-known/x402-manifest.json', (_req: Request, res: Response) => {
  res.status(200).json({
    version: '2.0',
    service: 'SentinelShield Contract Risk Triage',
    description: 'Deterministic security audit, AST static vulnerability triage, and SARIF report generation.',
    pricing: {
      amount: PRICE_ATOMIC,
      amountUSDC: 9.50,
      token: 'USDC',
      tokenAddress: USDC_BASE,
      network: NETWORK,
      scheme: 'exact',
    },
    payTo: PAY_TO,
    facilitator: FACILITATOR_URL,
    endpoint: '/sentinelshield',
    healthEndpoint: '/health',
    latencyExpectedMs: 1250,
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: { type: 'string', description: 'EVM address (0x...)' },
        chain: { type: 'string', enum: ['base', 'ethereum'], default: 'base' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        riskLevel: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SECURE'] },
        overallScore: { type: 'number' },
        summary: { type: 'string' },
        exploitability: { type: 'string' },
        findings: { type: 'array' },
        sarif: { type: 'object' },
      },
    },
  });
});

// ── 3. OFFICIAL x402 v2 PAYMENT MIDDLEWARE ──────────────────────────
// This REPLACES the manual handlePaidSentinelRequest().
// The middleware handles:
//   - 402 response with PAYMENT-REQUIRED header (official v2)
//   - facilitator /verify (real EIP-712 signature + on-chain balance check)
//   - facilitator /settle (real Base Mainnet broadcast → real txHash)
//   - Only calls route handler AFTER confirmed settlement
app.use(
  paymentMiddleware(
    {
      'POST /sentinelshield': {
        accepts: [
          {
            scheme: 'exact',
            price: PRICE,
            network: NETWORK,
            payTo: PAY_TO,
            extra: { asset: USDC_BASE, name: 'USDC', version: '2', description: 'SentinelShield Contract Risk Triage & SARIF Vulnerability Matrix' },
          },
        ],
        description:
          'Smart Contract Security Risk Analysis. Input: EVM contract address. Output: risk level, findings, SARIF report, exploitability assessment. Returns structured JSON with deterministic vulnerability matrices.',
        resource: process.env.PUBLIC_URL || `http://21.0.20.49:81/sentinelshield?XTransformPort=3030`,
        mimeType: 'application/json',
        serviceName: 'SentinelShield',
        tags: ['security', 'audit', 'smart-contract', 'risk', 'sarif', 'base', 'evm'],
        extensions: {
          bazaar: bazaarExtension,
        },
      },
    },
    resourceServer,
  ),
);

// ── 4. PAID ROUTE HANDLER (runs ONLY after middleware confirms settlement) ──
app.post('/sentinelshield', async (req: Request, res: Response) => {
  // At this point, paymentMiddleware has ALREADY:
  //   1. Verified the payment signature via facilitator
  //   2. Settled the payment via facilitator (real Base Mainnet tx)
  //   3. Confirmed the txHash
  // We can now safely execute SentinelShield analysis.

  const input = req.body || {};
  const outcome = await analyzeContractRisk(input);

  // The settlement txHash is available in response headers set by middleware
  // (x402-settlement header or similar, depending on @x402/express version)

  res.status(200).json({
    success: true,
    service: 'SentinelShield Contract Risk Triage',
    payment: {
      status: 'SETTLED',
      network: NETWORK,
      payTo: PAY_TO,
      amountUSDC: 9.50,
      token: 'USDC',
      // txHash is provided by the middleware after facilitator settle
      // It's in the response headers, not in our body
      middlewareConfirmed: true,
    },
    outcome,
  });
});

// ── 5. LIVE ON-CHAIN STATUS (free) ──────────────────────────────────
app.get('/api/onchain/status', async (req: Request, res: Response) => {
  const network = (req.query.network as string) === 'base-sepolia' ? 'base-sepolia' : 'base-mainnet';
  try {
    const status = await fetchLiveOnChainStatus(PAY_TO, network as any);
    res.status(200).json(status);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'RPC Error' });
  }
});

// ── 6. RUNTIME TX VERIFIER (free, for evidence checking) ────────────
app.post('/api/verify/tx', async (req: Request, res: Response) => {
  const { txHash, network = 'base-mainnet' } = req.body;
  if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x') || txHash.length !== 66) {
    return res.status(400).json({
      error: 'Invalid transaction hash format. Must be full 66-character hex hash starting with 0x.',
    });
  }

  const targetChain = network === 'base-sepolia' ? baseSepolia : base;
  const publicRpc = createPublicClient({
    chain: targetChain,
    transport: http(network === 'base-sepolia' ? 'https://sepolia.base.org' : 'https://mainnet.base.org'),
  });

  try {
    const [tx, receipt] = await Promise.all([
      publicRpc.getTransaction({ hash: txHash as `0x${string}` }),
      publicRpc.getTransactionReceipt({ hash: txHash as `0x${string}` }),
    ]);

    const isSuccess = receipt.status === 'success';

    // Check for USDC Transfer event
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const usdcTransferLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === USDC_BASE.toLowerCase() &&
        log.topics[0] === transferTopic,
    );

    let transferFrom = '';
    let transferTo = '';
    let transferAmount = '0';
    if (usdcTransferLog) {
      transferFrom = '0x' + (usdcTransferLog.topics[1] || '').slice(26).toLowerCase();
      transferTo = '0x' + (usdcTransferLog.topics[2] || '').slice(26).toLowerCase();
      transferAmount = BigInt(usdcTransferLog.data || '0x0').toString();
    }

    res.status(200).json({
      txHash,
      network: targetChain.id === 8453 ? 'eip155:8453' : 'eip155:84532',
      blockNumber: Number(receipt.blockNumber),
      status: isSuccess ? 'confirmed' : 'failed',
      from: tx.from,
      to: tx.to,
      gasUsed: receipt.gasUsed.toString(),
      verification: 'RPC_VERIFIED',
      usdcTransfer: usdcTransferLog
        ? {
            found: true,
            from: transferFrom,
            to: transferTo,
            amountAtomic: transferAmount,
            amountUSDC: Number(transferAmount) / 1e6,
            toMatchesPayTo: transferTo === PAY_TO.toLowerCase(),
            amountMatches: BigInt(transferAmount) >= BigInt(PRICE_ATOMIC),
          }
        : { found: false },
      payoutAddressChecked: PAY_TO,
    });
  } catch (err: any) {
    res.status(404).json({
      error: 'Transaction not found on chain or pending confirmation',
      details: err?.message,
    });
  }
});

// ── 7. START SERVER ─────────────────────────────────────────────────
async function startServer() {
  if (!isProduction) {
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      // Vite not available — serve static
    }
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (existsSync(distPath)) {
      app.use(express.static(distPath));
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n[SentinelShield] ✓ Production server on port ${PORT}`);
    console.log(`[SentinelShield] payTo: ${PAY_TO}`);
    console.log(`[SentinelShield] facilitator: ${FACILITATOR_URL}`);
    console.log(`[SentinelShield] middleware: paymentMiddleware (@x402/express v2)`);
    console.log(`[SentinelShield] NO local facilitator stub. NO 501/503. Official flow only.\n`);
  });
}

startServer();
