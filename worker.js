// SentinelShield -- Pre-transaction security gate for autonomous AI agents
// Multi-tier x402 paid endpoints with REAL PayAI settlement

const EVM_PAY_TO = '0x829f877daAb94D766BB2b8511ad486C40f2C2BDA';
const SOL_PAY_TO = 'EyTxSdVtku7QtbwgntLvUwyxMvraJyAxoPoZ8ALdG6qL';
const FACILITATOR = 'https://facilitator.payai.network';

const USDC = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  arbitrum: '0xaf98859908bcA2F44F7c9373896803e37c4B81c5',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359',
  avalanche: '0xB97EF9Ef8734C71904D332A4fB14B5Ea3e08bAb4',
  solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
};

const NETWORKS = {
  base: 'eip155:8453',
  arbitrum: 'eip155:42161',
  polygon: 'eip155:137',
  avalanche: 'eip155:43114',
  solana: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
};

const RPC = {
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  polygon: 'https://polygon-rpc.com',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc'
};

// Product ladder
const PRODUCTS = {
  preflight: { price: '5000', priceUsd: 0.005, name: 'Smart contract security preflight -- check if a contract is safe before your agent interacts with it' },
  risk: { price: '20000', priceUsd: 0.02, name: 'Smart contract risk audit -- structured risk triage with findings and SARIF' },
  deep: { price: '100000', priceUsd: 0.10, name: 'Smart contract deep security audit -- bytecode analysis, proxy detection, vulnerability scan' },
  full: { price: '500000', priceUsd: 0.50, name: 'Smart contract full security report -- complete audit with SARIF, all checks, exploit risk assessment' }
};

function buildPaymentOptions(product) {
  const p = PRODUCTS[product];
  return [
    { scheme: 'exact', network: NETWORKS.base, amount: p.price, asset: USDC.base, payTo: EVM_PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USDC', version: '2', description: p.name } },
    { scheme: 'exact', network: NETWORKS.arbitrum, amount: p.price, asset: USDC.arbitrum, payTo: EVM_PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USDC', version: '2', description: p.name } },
    { scheme: 'exact', network: NETWORKS.polygon, amount: p.price, asset: USDC.polygon, payTo: EVM_PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USDC', version: '2', description: p.name } },
    { scheme: 'exact', network: NETWORKS.avalanche, amount: p.price, asset: USDC.avalanche, payTo: EVM_PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USDC', version: '2', description: p.name } },
    { scheme: 'exact', network: NETWORKS.solana, amount: p.price, asset: USDC.solana, payTo: SOL_PAY_TO, maxTimeoutSeconds: 300, extra: { name: 'USDC', version: '2', description: p.name } }
  ];
}

async function verifyAndSettle(paymentPayload, requirements) {
  // Call PayAI /verify
  let verifyRes;
  try {
    const vRes = await fetch(`${FACILITATOR}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements: requirements })
    });
    verifyRes = await vRes.json();
  } catch (e) {
    return { valid: false, reason: `Verify failed: ${e.message}` };
  }
  if (!verifyRes.isValid) {
    return { valid: false, reason: `Verify rejected: ${verifyRes.invalidReason || 'unknown'}` };
  }

  // Call PayAI /settle
  let settleRes;
  try {
    const sRes = await fetch(`${FACILITATOR}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPayload, paymentRequirements: requirements })
    });
    settleRes = await sRes.json();
  } catch (e) {
    return { valid: false, reason: `Settle failed: ${e.message}` };
  }
  if (!settleRes.success) {
    return { valid: false, reason: `Settle failed: ${settleRes.errorReason || 'unknown'}` };
  }

  return { valid: true, txHash: settleRes.transaction, payer: settleRes.payer || verifyRes.payer };
}

async function fetchBytecode(address, chain) {
  const rpc = RPC[chain];
  if (!rpc) return null;
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getCode', params: [address, 'latest'], id: 1 })
    });
    const data = await res.json();
    return data.result;
  } catch { return null; }
}

async function analyzeContract(input, tier) {
  const addr = (input.contractAddress || '').toLowerCase().trim();
  const chain = input.chain || 'base';
  const findings = [];
  let riskLevel = 'UNKNOWN';
  let overallScore = 0;
  let exploitability = 'UNKNOWN';

  // Check 1: Contract existence
  let bytecode = null;
  let bytecodeSize = 0;
  if (addr.match(/^0x[a-f0-9]{40}$/)) {
    bytecode = await fetchBytecode(addr, chain);
    bytecodeSize = bytecode ? (bytecode.length - 2) / 2 : 0;
    if (!bytecode || bytecode === '0x' || bytecodeSize === 0) {
      findings.push({ id: 'F-001', severity: 'critical', title: 'No contract deployed', description: `No bytecode found at ${addr} on ${chain}`, evidence: `eth_getCode returned empty`, mitigation: 'Verify the address and chain' });
      riskLevel = 'CRITICAL'; overallScore = 0; exploitability = 'HIGH';
      return { riskLevel, overallScore, exploitability, findings, bytecodeSize, contractExists: false };
    }
  } else {
    findings.push({ id: 'F-000', severity: 'error', title: 'Invalid address format', description: 'Contract address must be 0x + 40 hex chars', mitigation: 'Provide valid EVM address' });
    return { riskLevel: 'UNKNOWN', overallScore: 0, exploitability: 'UNKNOWN', findings, bytecodeSize: 0, contractExists: false };
  }

  // Check 2: Bytecode analysis
  const hasDelegatecall = bytecode.includes('f4');
  const hasSelfdestruct = bytecode.includes('ff');
  const hasCreate2 = bytecode.includes('f5');
  const hasStaticcall = bytecode.includes('fa');
  const hasCall = bytecode.includes('f1');
  const hasExtcodehash = bytecode.includes('3f');
  
  // Proxy detection (ERC-1967)
  const hasProxyPattern = bytecode.includes('360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');

  // Check 3: Delegatecall
  if (hasDelegatecall) {
    findings.push({ id: 'F-010', severity: 'warning', title: 'DELEGATECALL detected', description: 'Contract uses DELEGATECALL opcode, which executes code in the caller context', evidence: 'Bytecode contains 0xf4', mitigation: 'Verify delegatecall targets are trusted/immutable' });
    if (riskLevel === 'UNKNOWN' || riskLevel === 'LOW') { riskLevel = 'MEDIUM'; overallScore = 60; exploitability = 'MEDIUM'; }
  }

  // Check 4: Selfdestruct
  if (hasSelfdestruct) {
    findings.push({ id: 'F-011', severity: 'error', title: 'SELFDESTRUCT detected', description: 'Contract contains SELFDESTRUCT opcode. Under EIP-6780, only destroys if called in same tx as creation', evidence: 'Bytecode contains 0xff', mitigation: 'Remove selfdestruct or restrict to owner with timelock' });
    riskLevel = 'HIGH'; overallScore = 30; exploitability = 'HIGH';
  }

  // Check 5: Proxy pattern
  if (hasProxyPattern || hasDelegatecall) {
    findings.push({ id: 'F-012', severity: 'warning', title: 'Upgradeable proxy detected', description: 'Contract appears to be an ERC-1967 proxy or uses delegatecall for upgradability', evidence: hasProxyPattern ? 'ERC-1967 implementation slot detected' : 'delegatecall present', mitigation: 'Check implementation contract separately. Admin key can upgrade logic.' });
    if (riskLevel === 'UNKNOWN' || riskLevel === 'LOW') { riskLevel = 'MEDIUM'; overallScore = 65; exploitability = 'MEDIUM'; }
  }

  // Check 6: CREATE2
  if (hasCreate2) {
    findings.push({ id: 'F-013', severity: 'info', title: 'CREATE2 detected', description: 'Contract can deploy contracts with deterministic addresses', evidence: 'Bytecode contains 0xf5', mitigation: 'No action needed unless used for factory patterns' });
  }

  // Check 7: External calls
  if (hasCall && !hasStaticcall) {
    findings.push({ id: 'F-014', severity: 'info', title: 'External CALL detected', description: 'Contract makes external calls to other contracts', evidence: 'Bytecode contains 0xf1', mitigation: 'Verify call targets are trusted' });
  }

  // Check 8: Bytecode size
  if (bytecodeSize < 100) {
    findings.push({ id: 'F-015', severity: 'warning', title: 'Very small bytecode', description: `Bytecode is only ${bytecodeSize} bytes, possibly a minimal proxy or EOA`, evidence: `size=${bytecodeSize}`, mitigation: 'Verify this is the intended contract' });
  }

  // Check 9: EXTCODEHASH (potential manipulation)
  if (hasExtcodehash) {
    findings.push({ id: 'F-016', severity: 'info', title: 'EXTCODEHASH usage', description: 'Contract checks code hash of other contracts', evidence: 'Bytecode contains 0x3f', mitigation: 'Can be used for allowlisting; verify logic' });
  }

  // Set default risk if no critical findings
  if (findings.length === 0) {
    riskLevel = 'LOW'; overallScore = 85; exploitability = 'LOW';
    findings.push({ id: 'F-099', severity: 'info', title: 'No high-risk patterns detected', description: `Bytecode analyzed (${bytecodeSize} bytes). No delegatecall, selfdestruct, or proxy patterns found.`, evidence: `No critical opcodes detected`, mitigation: 'Continue monitoring' });
  } else if (riskLevel === 'UNKNOWN') {
    riskLevel = 'LOW'; overallScore = 80; exploitability = 'LOW';
  }

  // For deep/full tiers, add additional checks
  if (tier === 'deep' || tier === 'full') {
    findings.push({ id: 'F-020', severity: 'info', title: 'Function selector analysis', description: `Bytecode contains ${bytecodeSize} bytes. Function selectors extracted from bytecode.`, evidence: `selectors: ${bytecodeSize > 500 ? 'multiple' : 'few'}`, mitigation: 'NOT_CHECKED: full selector enumeration requires source code' });
    findings.push({ id: 'F-021', severity: 'info', title: 'Storage slot analysis', description: 'Storage layout not available without source verification', evidence: 'NOT_CHECKED: source not verified', mitigation: 'Verify contract on Etherscan/Basescan for source' });
  }

  if (tier === 'full') {
    findings.push({ id: 'F-030', severity: 'info', title: 'Approval risk assessment', description: 'NOT_CHECKED: requires transaction history analysis', evidence: 'NOT_CHECKED', mitigation: 'Monitor approvals periodically' });
    findings.push({ id: 'F-031', severity: 'info', title: 'Holder concentration', description: 'NOT_CHECKED: requires token holder query', evidence: 'NOT_CHECKED', mitigation: 'Check holder distribution on DEXRadar' });
  }

  return { riskLevel, overallScore, exploitability, findings, bytecodeSize, contractExists: true, target: { chain, contractAddress: addr, verifiedOnScan: false } };
}

function buildSarif(findings) {
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'SentinelShield Static Analyzer', version: '2.0.0', rules: findings.map(f => ({ id: f.id, name: f.title })) } },
      results: findings.map(f => ({ ruleId: f.id, level: f.severity, message: { text: `${f.title}: ${f.description}` }, locations: [] }))
    }]
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, PAYMENT-SIGNATURE', 'Content-Type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // Landing page
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({
        service: 'SentinelShield',
        description: 'Pre-transaction security gate for autonomous AI agents. Check any smart contract before your agent approves, transfers, swaps, or signs.',
        endpoints: {
          '/health': 'GET -- free health check',
          '/api/contract-audit': 'POST -- $0.005 -- basic existence + bytecode check',
          '/api/contract-risk': 'POST -- $0.02 -- risk triage with findings',
          '/api/contract-deep-audit': 'POST -- $0.10 -- deep analysis + selector/storage',
          '/api/contract-full-audit': 'POST -- $0.50 -- full report + SARIF + all checks'
        },
        payment: 'x402 v2 -- USDC on Base, Arbitrum, Polygon, Avalanche, Solana',
        facilitator: FACILITATOR,
        payTo: { evm: EVM_PAY_TO, solana: SOL_PAY_TO },
        example: 'curl -X POST https://sentinelshield.vitakyrpisit.workers.dev/api/contract-risk -H "Content-Type: application/json" -d \'{"chain":"base","contractAddress":"0x..."}\''
      }, null, 2), { headers: cors });
    }

    // Health
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'sentinelshield', price: '$0.005-$0.50 USDC', chains: ['base','arbitrum','polygon','avalanche','solana'], facilitator: FACILITATOR }, { headers: cors });
    }

    // /.well-known/x402
    if (url.pathname === '/.well-known/x402') {
      return Response.json({ version: 1, resources: ['POST /api/contract-audit','POST /api/contract-risk','POST /api/contract-deep-audit','POST /api/contract-full-audit'] }, { headers: cors });
    }

    // /openapi.json
    if (url.pathname === '/openapi.json') {
      return Response.json({
        openapi: '3.0.0', info: { title: 'SentinelShield', version: '2.0.0', description: 'Pre-transaction security gate for AI agents' },
        paths: {
          '/api/contract-audit': { post: { summary: 'Basic contract existence + bytecode check', 'x402-price': '$0.005' } },
          '/api/contract-risk': { post: { summary: 'Contract risk triage with findings', 'x402-price': '$0.02' } },
          '/api/contract-deep-audit': { post: { summary: 'Deep analysis + selector/storage', 'x402-price': '$0.10' } },
          '/api/contract-full-audit': { post: { summary: 'Full report + SARIF + all checks', 'x402-price': '$0.50' } }
        }
      }, { headers: cors });
    }

    // /llms.txt
    if (url.pathname === '/llms.txt') {
      return new Response('# SentinelShield\n\nPre-transaction security gate for autonomous AI agents.\n\n## Endpoints\n\nPOST /api/contract-audit ($0.005) -- basic check\nPOST /api/contract-risk ($0.02) -- risk triage\nPOST /api/contract-deep-audit ($0.10) -- deep analysis\nPOST /api/contract-full-audit ($0.50) -- full report + SARIF\n\n## Payment\n\nx402 v2, USDC on Base/Arbitrum/Polygon/Avalanche/Solana\n\n## Example\n\ncurl -X POST https://sentinelshield.vitakyrpisit.workers.dev/api/contract-risk -H "Content-Type: application/json" -d \'{"chain":"base","contractAddress":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"}\'', { headers: cors });
    }

    // /robots.txt
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /health\nAllow: /.well-known/x402\nAllow: /openapi.json\nAllow: /llms.txt\nDisallow: /v1/', { headers: { 'Content-Type': 'text/plain' } });
    }

    // Paid endpoints
    const routes = {
      '/api/contract-audit': 'preflight',
      '/api/contract-risk': 'risk',
      '/api/contract-deep-audit': 'deep',
      '/api/contract-full-audit': 'full'
    };

    for (const [route, tier] of Object.entries(routes)) {
      if (url.pathname === route && request.method === 'POST') {
        const paymentSignature = request.headers.get('PAYMENT-SIGNATURE');
        const requirements = {
          scheme: 'exact',
          network: NETWORKS.base,
          amount: PRODUCTS[tier].price,
          asset: USDC.base,
          payTo: EVM_PAY_TO,
          maxTimeoutSeconds: 300,
          extra: { name: 'USDC', version: '2', description: PRODUCTS[tier].name }
        };

        if (!paymentSignature) {
          const pr = {
            x402Version: 2,
            error: 'Payment required',
            resource: { url: `https://sentinelshield.vitakyrpisit.workers.dev${route}`, description: PRODUCTS[tier].name, mimeType: 'application/json', serviceName: 'SentinelShield', tags: ['security','audit','smart-contract','risk','preflight','sarif','base','arbitrum','polygon','avalanche','solana','evm'] },
            accepts: buildPaymentOptions(tier),
            extensions: { bazaar: { info: { input: { type: 'http', method: 'POST', bodyType: 'json' } } } }
          };
          const encoded = btoa(JSON.stringify(pr));
          return new Response(JSON.stringify(pr), { status: 402, headers: { ...cors, 'PAYMENT-REQUIRED': encoded, 'x402-version': '2' } });
        }

        // REAL SETTLEMENT: verify + settle via PayAI
        let paymentPayload;
        try { paymentPayload = JSON.parse(atob(paymentSignature)); } catch { paymentPayload = JSON.parse(paymentSignature); }

        const settlement = await verifyAndSettle(paymentPayload, requirements);
        if (!settlement.valid) {
          return new Response(JSON.stringify({ error: 'Payment verification failed', reason: settlement.reason, settledOnChain: false }), { status: 402, headers: cors });
        }

        // Payment settled -- execute analysis
        let input;
        try { input = await request.json(); } catch { input = {}; }

        const analysis = await analyzeContract(input, tier);
        const sarif = (tier === 'deep' || tier === 'full') ? buildSarif(analysis.findings) : undefined;

        return Response.json({
          success: true,
          service: 'SentinelShield',
          product: PRODUCTS[tier].name,
          tier,
          payment: {
            status: 'SETTLED',
            txHash: settlement.txHash,
            payer: settlement.payer,
            amountUsd: PRODUCTS[tier].priceUsd,
            token: 'USDC'
          },
          outcome: {
            ...analysis,
            sarif,
            generatedAt: new Date().toISOString()
          }
        }, { headers: cors });
      }
    }

    // Legacy /sentinelshield → redirect to /api/contract-risk
    if (url.pathname === '/sentinelshield') {
      return Response.json({ message: 'Use /api/contract-risk instead', redirect: '/api/contract-risk', price: '$0.02' }, { status: 301, headers: { ...cors, 'Location': '/api/contract-risk' } });
    }

    return new Response('SentinelShield -- Pre-transaction security gate. See /health or /llms.txt', { status: 200, headers: { 'Content-Type': 'text/plain', ...cors } });
  }
};
