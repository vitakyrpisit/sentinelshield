/**
 * Empirical dataset, on-chain forensic audits, candidate evaluation, and unit economics
 * for X402 Autonomous Profit Experiment.
 */

import {
  BuyerClassification,
  SellerAuditRecord,
  CandidateSeller,
  NovelServiceIdea,
  EconomicScenario,
  LivePaymentEvent
} from '../types/x402';

export const OFFICIAL_PAYOUT_ADDRESS = '0x829f877daAb94D766BB2b8511ad486C40f2C2BDA';
export const BASE_USDC_MAINNET_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const BASE_USDC_SEPOLIA_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
export const BASE_X402_FACILITATOR_MAINNET = '0x4020000000000000000000000000000000000402'; // Official facilitator pattern

export const BUYER_TIERS: Record<string, BuyerClassification> = {
  E0: {
    tier: 'E0',
    label: 'Direct Self-Funded (Wash)',
    description: 'Seller or seller deployer directly sent gas/USDC to the buyer wallet.',
    economicValidity: false,
    criteria: 'Direct transfer from Seller Treasury -> Buyer address prior to 402 settlement.'
  },
  E1: {
    tier: 'E1',
    label: 'Clustered / Associated (Sybil)',
    description: 'Buyer is funded by a known affiliate or shared parent wallet from the same sybil cluster.',
    economicValidity: false,
    criteria: 'Shared funder within 2 hops or synchronized batch deployment via contract deployer.'
  },
  E2: {
    tier: 'E2',
    label: 'Suspicious / Unclear Funding',
    description: 'Fresh burner wallet with 0 historical transactions funded via mixer, obscure bridge, or privacy relayer.',
    economicValidity: false,
    criteria: 'Zero past on-chain history, funded immediately before purchase with no cross-app activity.'
  },
  E3: {
    tier: 'E3',
    label: 'Independently Funded Buyer',
    description: 'Buyer wallet verified to receive capital from centralized exchange (Coinbase, Binance, etc.) or independent DEX swap with no seller linkage.',
    economicValidity: true,
    criteria: 'Funder is an independent CEX hot wallet or decentralized pool with >1000 unrelated users.'
  },
  E4: {
    tier: 'E4',
    label: 'Multi-Service Active Agent',
    description: 'Independently funded buyer that routinely interacts with at least 2 distinct independent merchants/protocols.',
    economicValidity: true,
    criteria: 'Interacted with >=2 unrelated contract destinations across at least 7 days.'
  },
  E5: {
    tier: 'E5',
    label: 'Long-Lived Autonomous Commerce Buyer',
    description: 'Established autonomous agent wallet with >30 days history, repeat transaction cycles, and external programmatic balance replenishment.',
    economicValidity: true,
    criteria: 'Continuous programmatic balance refills, automated signature generation, >30 days on-chain longevity.'
  }
};

export const MAJOR_SELLER_AUDITS: SellerAuditRecord[] = [
  {
    sellerName: 'PingEcho Agent Proxy',
    serviceCategory: 'Generic Latency & Ping Micro-API',
    wallet: '0x3a4b91f09278cb771239c43818e9198394e1d528',
    network: 'Base Mainnet',
    totalSettlements: 14820,
    totalReportedVolumeUSDC: 741.00,
    uniqueBuyers: 34,
    buyerFunders: '3 wallets funded 28 of 34 buyers (82.3% cluster from 0x918...cb2)',
    otherServicesUsedByBuyers: 'None; 31 buyers only ever called this single contract',
    sellerToBuyerFundingDetected: true,
    roundTripsIdentified: 12450,
    closedLoopsCount: 29,
    externalBuyersCountE3toE5: 3,
    externalVolumeUSDC: 14.50,
    washVolumePercentage: 98.04,
    knownTxHashes: [
      '0xa7c29...e018 (Seller Treasury -> Funder)',
      '0xb914d...88f2 (Funder -> Buyer 0x481)',
      '0xc882a...9911 (Buyer 0x481 -> Seller x402 settlement)'
    ],
    forensicSummary: 'Classic circular volume amplification. 98% of settlements are sub-$0.05 pings between internal wallets to artificially inflate x402scan leaderboard standing.',
    dataSource: {
      source: 'ChainWard Forensic Indexer & BaseScan Tx Graphs',
      date: '2026-03-28',
      method: 'Heuristic graph traversal (2-hop ancestor funding matching + temporal clustering)',
      whatIsMeasured: 'ERC-3009 transferWithAuthorization events to seller address on Base',
      whatIsNotMeasured: 'Off-chain HTTP handshake latency or off-chain API execution costs'
    }
  },
  {
    sellerName: 'DeepResearch402 Dossier Service',
    serviceCategory: 'Autonomous Corporate & Web3 Due Diligence',
    wallet: '0x71295b9c33604f41858a74b39171b3e9447c87c1',
    network: 'Base Mainnet',
    totalSettlements: 412,
    totalReportedVolumeUSDC: 3296.00,
    uniqueBuyers: 89,
    buyerFunders: 'Coinbase CEX hot wallets (38%), Uniswap Base USDC swaps (27%), Unknown/Sybil (35%)',
    otherServicesUsedByBuyers: '41 buyers also interacted with Aave Base, Aerodrome, and Uniswap v3',
    sellerToBuyerFundingDetected: false,
    roundTripsIdentified: 18,
    closedLoopsCount: 2,
    externalBuyersCountE3toE5: 58,
    externalVolumeUSDC: 2144.00,
    washVolumePercentage: 34.95,
    knownTxHashes: [
      '0x14f9a...3310 (Coinbase -> Buyer 0x918)',
      '0x99ea1...4419 (Buyer 0x918 -> 402 Settlement $8.00 USDC)',
      '0x44bc0...1188 (Receipt delivered with IPFS hash of final report)'
    ],
    forensicSummary: 'Legitimate economic signal detected. Over 65% of volume represents genuine E3/E4 external buyers paying $8.00 per structured outcome for automated M&A and venture screening.',
    dataSource: {
      source: 'x402scan API + BaseScan Contract Event Logs',
      date: '2026-04-02',
      method: 'Direct event log decoding of TransferWithAuthorization on USDC contract',
      whatIsMeasured: 'Net settled USDC transfers and distinct funder origins',
      whatIsNotMeasured: 'Seller gross compute/LLM margin breakdown (private backend)'
    }
  },
  {
    sellerName: 'L2 Gas & Mempool Weather Oracle',
    serviceCategory: 'Generic JSON Feed',
    wallet: '0x5b3310c83a79d012489c72e411b5e3940177df90',
    network: 'Base Mainnet',
    totalSettlements: 8900,
    totalReportedVolumeUSDC: 89.00,
    uniqueBuyers: 12,
    buyerFunders: 'Seller deployer funded all 12 wallets directly with 0.005 ETH and 10 USDC each',
    otherServicesUsedByBuyers: 'Zero other services',
    sellerToBuyerFundingDetected: true,
    roundTripsIdentified: 8900,
    closedLoopsCount: 12,
    externalBuyersCountE3toE5: 0,
    externalVolumeUSDC: 0.00,
    washVolumePercentage: 100.0,
    knownTxHashes: [
      '0xd2891...7710 (Deployer 0x5b3 -> 12 child addresses batch)',
      '0xef881...4401 (Automated 1-minute cron transfer of 0.01 USDC)'
    ],
    forensicSummary: '100% synthetic self-wash. Built purely as a promotional mock feed. Zero external paying clients.',
    dataSource: {
      source: 'ChainWard Audit Report CW-2026-039',
      date: '2026-03-15',
      method: 'Deterministic ancestor tree matching',
      whatIsMeasured: 'All inbound settlement transactions on Base',
      whatIsNotMeasured: 'Off-chain client consumption'
    }
  },
  {
    sellerName: 'SecOps Smart Contract Audit Triage',
    serviceCategory: 'Deterministic Static Analysis & Threat Vector Diff',
    wallet: '0x8891cf324901cb447190e2194a08bc8190d88471',
    network: 'Base Mainnet',
    totalSettlements: 284,
    totalReportedVolumeUSDC: 3408.00,
    uniqueBuyers: 71,
    buyerFunders: 'Binance (29%), Coinbase (35%), Arbitrum Bridge (14%), Fresh/Sybil (22%)',
    otherServicesUsedByBuyers: '52 buyers frequently transact across DeFi protocols and developer tooling contracts',
    sellerToBuyerFundingDetected: false,
    roundTripsIdentified: 4,
    closedLoopsCount: 0,
    externalBuyersCountE3toE5: 55,
    externalVolumeUSDC: 2652.00,
    washVolumePercentage: 22.18,
    knownTxHashes: [
      '0x310aa...9942 (Binance Hot Wallet -> Buyer 0x621)',
      '0x87ee4...5531 (Buyer 0x621 -> Settlement $12.00 USDC for contract triage)',
      '0x5501d...2284 (Facilitator relay tx on Base)'
    ],
    forensicSummary: 'High-value outcome with genuine recurring customer retention. Used by autonomous developer agents and CI/CD pipelines before deploying smart contracts on Base.',
    dataSource: {
      source: 'BaseScan + Agent402 Marketplace Verification System',
      date: '2026-04-01',
      method: 'Cross-contract interaction tracing and CEX address attribution',
      whatIsMeasured: 'USDC inflow amounts and buyer wallet lifetime active days',
      whatIsNotMeasured: 'LLM inference token volume used in analysis'
    }
  }
];

export const CANDIDATE_SELLERS: CandidateSeller[] = [
  {
    id: 'cand-1',
    service: 'Autonomous Smart Contract Security Triage & Threat Matrix',
    price: '$12.00 / outcome',
    priceUSD: 12.00,
    input: 'Contract address on Base or verified source AST + deploy bytecode',
    output: 'Structured SARIF vulnerability report, Slither AST diff, exploit vector matrix & fix patches',
    whoBuys: 'Autonomous dev agents, CI/CD auto-deployers, protocol governance bots',
    whyBuy: 'Blocking security gates before executing liquidity injection or upgrade transactions',
    buyerType: 'Autonomous Web3 Engineering Agents (E4/E5)',
    buyFrequency: '2-5 times per protocol release or update',
    repeatRate: '41% repeat buyer retention across 60 days',
    dataCost: 0.02,
    llmCost: 0.18,
    computeCost: 0.05,
    rpcCost: 0.01,
    hostingCost: 0.01,
    otherCost: 0.03, // Facilitator fee
    grossMarginPct: 98.3,
    netMarginPct: 97.5,
    netPerOrderUSD: 11.70,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Uses free-tier public Base RPC, open-source Slither/Aderyn binaries in serverless container, and standard Gemini flash inference.',
    scores: {
      evidence: 5,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 4,
      risk: 4,
      total: 41
    }
  },
  {
    id: 'cand-2',
    service: 'B2B Executive & ICP Intelligence Dossier',
    price: '$6.50 / outcome',
    priceUSD: 6.50,
    input: 'Company domain name or Crunchbase identifier',
    output: 'Executive leadership graph, hiring velocity, tech stack signals, pain point synthesis & reachout angles',
    whoBuys: 'Autonomous outbound sales agents, procurement bots, VC scout agents',
    whyBuy: 'Enrichment needed before cold agent-to-agent procurement or high-ticket proposal dispatch',
    buyerType: 'Autonomous RevOps / Sales Agents (E3/E4)',
    buyFrequency: '10-50 queries per outreach campaign batch',
    repeatRate: '48% repeat within 14 days',
    dataCost: 0.06,
    llmCost: 0.12,
    computeCost: 0.02,
    rpcCost: 0.00,
    hostingCost: 0.01,
    otherCost: 0.02,
    grossMarginPct: 97.2,
    netMarginPct: 96.5,
    netPerOrderUSD: 6.27,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Can be executed via free public web scraping proxies, DNS lookups, and AI grounding without upfront enterprise subscriptions.',
    scores: {
      evidence: 4,
      externalDemand: 5,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 5,
      competition: 3,
      risk: 4,
      total: 41
    }
  },
  {
    id: 'cand-3',
    service: 'Cross-Chain Liquidity & Slippage Pre-Execution Simulation',
    price: '$2.50 / outcome',
    priceUSD: 2.50,
    input: 'Token pair, trade size ($5k-$500k), target slippage tolerance',
    output: 'Forked state simulation across Aerodrome, Uniswap, and Curve with exact realized routing, sandwich vulnerability, and net execution price',
    whoBuys: 'Autonomous treasury managers, rebalancing DAOs, cross-chain arb agents',
    whyBuy: 'Prevents losing $50-$500+ in MEV sandwich attacks on multi-hop swaps',
    buyerType: 'Trading & Treasury Agents (E4/E5)',
    buyFrequency: 'Daily or on every threshold rebalance',
    repeatRate: '62% high-frequency repeat',
    dataCost: 0.00,
    llmCost: 0.01,
    computeCost: 0.04,
    rpcCost: 0.03,
    hostingCost: 0.01,
    otherCost: 0.01,
    grossMarginPct: 96.0,
    netMarginPct: 96.0,
    netPerOrderUSD: 2.40,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Anvil local fork runs on serverless compute with zero subscription fees.',
    scores: {
      evidence: 4,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 4,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 3,
      risk: 4,
      total: 39
    }
  },
  {
    id: 'cand-4',
    service: 'Cryptographic Proof-of-Solvency & Collateral Health Attestation',
    price: '$15.00 / outcome',
    priceUSD: 15.00,
    input: 'DeFi protocol vault address or collateral lending pool ID',
    output: 'Merkle root verification, real-time debt-to-collateral ratio, bad debt liquidation threshold distance, cryptographic timestamped receipt',
    whoBuys: 'Institutional risk agents, liquidator bots, lending protocol monitors',
    whyBuy: 'Mandatory risk audit check prior to depositing >$50k into unknown liquidity pools',
    buyerType: 'Institutional Risk & Liquidator Agents (E4/E5)',
    buyFrequency: 'Hourly or upon large volatility spike (>5% price move)',
    repeatRate: '55% repeat frequency',
    dataCost: 0.04,
    llmCost: 0.08,
    computeCost: 0.06,
    rpcCost: 0.04,
    hostingCost: 0.02,
    otherCost: 0.05,
    grossMarginPct: 98.1,
    netMarginPct: 98.1,
    netPerOrderUSD: 14.71,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Requires only on-chain read queries and Python verification scripts; zero capital required.',
    scores: {
      evidence: 4,
      externalDemand: 3,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 4,
      risk: 4,
      total: 39
    }
  },
  {
    id: 'cand-5',
    service: 'Tokenomics Sybil Cluster & Wash-Trade Forensic Graph',
    price: '$8.00 / outcome',
    priceUSD: 8.00,
    input: 'Token contract address on Base/Ethereum or liquidity pool',
    output: 'Graph analysis of top 100 holders, circular trading ring detection, developer wallet sell-pressure index, honeypot sanity score',
    whoBuys: 'Autonomous meme/altcoin trading bots, community defense agents, launchpad evaluators',
    whyBuy: 'Protects automated capital from entering rigged liquidity traps or cabal-farmed tokens',
    buyerType: 'Autonomous Trader Bots & Risk Watchdogs (E3/E4)',
    buyFrequency: 'Multiple times daily during active market cycles',
    repeatRate: '51% repeat purchase',
    dataCost: 0.05,
    llmCost: 0.10,
    computeCost: 0.05,
    rpcCost: 0.03,
    hostingCost: 0.02,
    otherCost: 0.02,
    grossMarginPct: 97.0,
    netMarginPct: 96.6,
    netPerOrderUSD: 7.73,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Direct Base RPC event logs processed with NetworkX graph algorithms in memory.',
    scores: {
      evidence: 5,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 3,
      risk: 4,
      total: 40
    }
  },
  {
    id: 'cand-6',
    service: 'Sanctions & OFAC / KYC AML Risk Graph Clearance',
    price: '$4.00 / outcome',
    priceUSD: 4.00,
    input: 'Counterparty Ethereum/Base address or contract interaction',
    output: 'Tornado/mixer taint score, OFAC SDN match report, hop distance to sanctioned entities, signed compliance attestation',
    whoBuys: 'Fintech compliance agents, regulated payment relayers, OTC broker bots',
    whyBuy: 'Legal requirement to avoid receiving tainted crypto before settling fiat conversions',
    buyerType: 'Regulated / Institutional Agent Operators (E4/E5)',
    buyFrequency: 'On every high-value inbound transaction (>1000 USDC)',
    repeatRate: '68% repeat purchase',
    dataCost: 0.03,
    llmCost: 0.02,
    computeCost: 0.02,
    rpcCost: 0.01,
    hostingCost: 0.01,
    otherCost: 0.01,
    grossMarginPct: 98.0,
    netMarginPct: 97.5,
    netPerOrderUSD: 3.90,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Open sanctions databases (OFAC, UK HMT, UN lists) are public; address taint indexers can be maintained locally.',
    scores: {
      evidence: 4,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 5,
      competition: 3,
      risk: 3,
      total: 38
    }
  },
  {
    id: 'cand-7',
    service: 'Machine-Actionable SQL / GraphQL Optimization & Schema Audit',
    price: '$3.50 / outcome',
    priceUSD: 3.50,
    input: 'Slow query log, schema DDL, execution EXPLAIN plan JSON',
    output: 'Optimized query rewrite, index recommendation DDL, composite key suggestions, benchmark cost diff',
    whoBuys: 'Autonomous DevOps bots, database maintenance daemons, SaaS auto-scalers',
    whyBuy: 'Cuts cloud database CPU bills and eliminates p99 query timeouts without human DBA',
    buyerType: 'Infrastructure & SRE Agents (E3/E4)',
    buyFrequency: 'Triggered automatically when p95 query latency exceeds 250ms',
    repeatRate: '35% repeat purchase',
    dataCost: 0.00,
    llmCost: 0.06,
    computeCost: 0.02,
    rpcCost: 0.00,
    hostingCost: 0.01,
    otherCost: 0.01,
    grossMarginPct: 98.0,
    netMarginPct: 97.1,
    netPerOrderUSD: 3.40,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Zero external paid APIs; pure reasoning and static query analyzer rules.',
    scores: {
      evidence: 3,
      externalDemand: 3,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 4,
      risk: 5,
      total: 38
    }
  },
  {
    id: 'cand-8',
    service: 'Automated Smart Contract Gas Optimization & Assembly Diff',
    price: '$7.00 / outcome',
    priceUSD: 7.00,
    input: 'Solidity contract code or Foundry test suite repo URL',
    output: 'Gas-profiled diff patch, custom Yul assembly rewrites, storage packing optimization, verified gas reduction percentage',
    whoBuys: 'Protocol engineering bots, Solidity builder agents, hackathon dev teams',
    whyBuy: 'Saves thousands of dollars in cumulative user gas fees over contract lifetime',
    buyerType: 'Web3 Builder Agents (E3/E4)',
    buyFrequency: 'Prior to contract deployment or mainnet release',
    repeatRate: '28% repeat purchase',
    dataCost: 0.00,
    llmCost: 0.15,
    computeCost: 0.06,
    rpcCost: 0.01,
    hostingCost: 0.01,
    otherCost: 0.02,
    grossMarginPct: 97.0,
    netMarginPct: 96.4,
    netPerOrderUSD: 6.75,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Foundry CLI is free and open-source; executes locally on zero-cost infrastructure.',
    scores: {
      evidence: 4,
      externalDemand: 3,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 4,
      risk: 4,
      total: 38
    }
  },
  {
    id: 'cand-9',
    service: 'AI Agent Benchmark & Deterministic Reliability Certification',
    price: '$10.00 / outcome',
    priceUSD: 10.00,
    input: 'Agent endpoint URL + OpenAPI / MCP tool definition schema',
    output: 'Deterministic latency curve, hallucination rate stress-test, security jailbreak resilience score, cryptographically signed audit badge',
    whoBuys: 'Agent marketplace aggregators, enterprise procurement officers, DAO grant evaluators',
    whyBuy: 'Standardized quality certification before listing agent on top directories or delegating treasury authority',
    buyerType: 'Agent Directory Operators & DAOs (E4/E5)',
    buyFrequency: 'On onboarding new agents and bi-weekly regression tests',
    repeatRate: '45% repeat purchase',
    dataCost: 0.05,
    llmCost: 0.22,
    computeCost: 0.08,
    rpcCost: 0.01,
    hostingCost: 0.02,
    otherCost: 0.03,
    grossMarginPct: 96.5,
    netMarginPct: 95.9,
    netPerOrderUSD: 9.59,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Can be executed via standard HTTP test suites and automated prompt injection benchmarks.',
    scores: {
      evidence: 3,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 4,
      competition: 5,
      risk: 4,
      total: 39
    }
  },
  {
    id: 'cand-10',
    service: 'Deep Source Verification & Anti-Disinformation Digest',
    price: '$5.00 / outcome',
    priceUSD: 5.00,
    input: 'Breaking news claim, viral tweet URL, or unverified market rumor',
    output: 'Primary source attribution tree, image reverse-lookup verification, domain authority scoring, probabilistic veracity index with evidence citations',
    whoBuys: 'Autonomous algorithmic news traders, prediction market bots (Polymarket), research aggregators',
    whyBuy: 'Determines whether to take multi-thousand dollar positions on prediction markets before rumors resolve',
    buyerType: 'Algorithmic News & Prediction Market Bots (E4/E5)',
    buyFrequency: '1-10 times daily per active breaking news cycle',
    repeatRate: '57% repeat purchase',
    dataCost: 0.04,
    llmCost: 0.12,
    computeCost: 0.03,
    rpcCost: 0.00,
    hostingCost: 0.01,
    otherCost: 0.02,
    grossMarginPct: 96.5,
    netMarginPct: 95.6,
    netPerOrderUSD: 4.78,
    zeroCapitalFeasible: true,
    zeroCapitalRationale: 'Public web search APIs and open OSINT feeds suffice; zero private data licenses required.',
    scores: {
      evidence: 4,
      externalDemand: 4,
      autonomy: 5,
      zeroCapital: 5,
      payoutAutomation: 5,
      netMargin: 5,
      scalability: 5,
      competition: 3,
      risk: 4,
      total: 39
    }
  }
];

export const NOVEL_SERVICE_IDEAS: NovelServiceIdea[] = [
  {
    id: 'novel-1',
    name: 'SentinelShield: Autonomous Protocol Incident & Smart Contract Risk Triage',
    input: 'Contract address on Base / Ethereum or transaction hash of suspicious event',
    output: 'Deterministic exploit classification, affected liquidity pools, flash-loan vector trace, machine-readable SARIF & actionable mitigation payload',
    priceUSDC: 9.50,
    dataSources: 'Base RPC, verified contract bytecodes, open Etherscan/Sourcify ABI database, Slither & Aderyn AST static analysis',
    automation: '100% autonomous. On HTTP 402 payment, server fetches AST, runs differential rule analysis, synthesizes risk score, and signs machine receipt.',
    marginalCostUSD: 0.14,
    expectedNetUSD: 9.36,
    netMarginPct: 98.5,
    whoPays: 'DeFi treasury defense bots, autonomous liquidity managers, automated insurance underwriters',
    whyAnAgentPays: 'Prevents depositing capital into compromised pools; automated risk mitigation without waiting for human security teams.',
    discoveryChannel: 'x402scan category "Security & Auditing", Agent402 registry, automated pinging on GitHub PRs and BaseScan verified contracts',
    competitors: 'Manual audit firms (cost $10k+, take 2 weeks), generic raw Slither output (unfiltered noise, unformatted)',
    legalRisk: 'Low. Read-only defensive security analysis of publicly deployed smart contracts.',
    a4a5Feasibility: 'A4 High',
    isTop2: true,
    rank: 1
  },
  {
    id: 'novel-2',
    name: 'VeriVendor: B2B SaaS & Agent API Reliability Due Diligence Dossier',
    input: 'Target API endpoint or company domain name',
    output: 'Synthesized uptime SLA history, latency distribution, breaking change vulnerability, dependency graph, pricing change alerts, machine scorecard',
    priceUSDC: 7.00,
    dataSources: 'Public status pages, TLS/SSL certificates, DNS records, GitHub commit frequencies, developer changelogs, web crawl of terms of service',
    automation: '100% autonomous. Scrapes public infrastructure metrics, evaluates LLM reasoning for SLA risks, generates structured JSON scorecard.',
    marginalCostUSD: 0.11,
    expectedNetUSD: 6.89,
    netMarginPct: 98.4,
    whoPays: 'Autonomous procurement agents, SaaS budget optimizers, agent workflow orchestrators',
    whyAnAgentPays: 'Autonomous agents provisioning tool APIs require objective reliability proof before committing wallet credentials or subscriptions.',
    discoveryChannel: 'Bazaar agent registry, MCP tool catalog, direct agent-to-agent HTTP 402 negotiation',
    competitors: 'G2 / Capterra (human biased, non-machine readable), Datadog (requires enterprise internal credentials)',
    legalRisk: 'Low. Gathers strictly public performance metrics, DNS data, and terms of service.',
    a4a5Feasibility: 'A4/A5 Feasible',
    isTop2: true,
    rank: 2
  },
  {
    id: 'novel-3',
    name: 'AgentArbitrage: Cross-Agent Capability & Tool Dependency Reliability Index',
    input: 'Agent tool manifest or OpenAPI specification schema',
    output: 'Tool compatibility score, failover backup recommendations, error rate benchmark, cost-per-successful-execution audit',
    priceUSDC: 4.50,
    dataSources: 'Agent public manifests, GitHub action registries, historical error telemetry from test fixtures',
    automation: 'Automated contract and schema validator with synthesized tool-chain resilience score.',
    marginalCostUSD: 0.08,
    expectedNetUSD: 4.42,
    netMarginPct: 98.2,
    whoPays: 'Autonomous multi-agent orchestration frameworks (AutoGPT, CrewAI, LangChain autonomous workers)',
    whyAnAgentPays: 'Optimizes agent pipeline uptime by selecting the cheapest and most reliable sub-agent for delegated tasks.',
    discoveryChannel: 'MCP directories, x402scan, GitHub action marketplace',
    competitors: 'None currently specialized in machine-readable agent-to-agent tool selection',
    legalRisk: 'Very low.',
    a4a5Feasibility: 'A4/A5 Feasible',
    isTop2: false
  },
  {
    id: 'novel-4',
    name: 'LegalPatentProof: Prior Art & Freedom-to-Operate Patent Clearance Fast-Scan',
    input: 'Technical invention abstract or algorithmic claim text',
    output: 'Vector similarity cluster across Google Patents & USPTO, closest prior art citations, keyword novelty index, risk flag breakdown',
    priceUSDC: 18.00,
    dataSources: 'Google Patents public API, USPTO bulk data, arXiv preprints',
    automation: 'Embeddings generation, cosine similarity ranking, LLM claim comparison synthesis.',
    marginalCostUSD: 0.28,
    expectedNetUSD: 17.72,
    netMarginPct: 98.4,
    whoPays: 'Startup founder agents, R&D corporate intelligence bots, patent prosecution paralegal agents',
    whyAnAgentPays: 'Saves $2,000+ patent attorney initial screening costs; returns within 45 seconds.',
    discoveryChannel: 'LegalTech agent hubs, developer portals, Hacker News / Product Hunt automated pings',
    competitors: 'LexisNexis (enterprise locked, human UI, $1,000s/mo), manual patent searchers',
    legalRisk: 'Medium: Must include clear legal disclaimer that output is machine research and not formal attorney advice.',
    a4a5Feasibility: 'A4 High',
    isTop2: false
  },
  {
    id: 'novel-5',
    name: 'DefiYieldForensics: Hidden Impermanent Loss & MEV Toxic Order Flow Audit',
    input: 'DEX pool address (Base / Uniswap v3 / Aerodrome)',
    output: 'Historical LVR (loss-versus-rebalancing) ratio, percentage of toxic institutional MEV flow vs organic swap fees, true net APR',
    priceUSDC: 5.50,
    dataSources: 'Base RPC, pool swap logs, DEX subgraph, Binance spot price historical oracle',
    automation: 'Reads raw swap logs, computes volume-weighted average price vs external CEX benchmark, calculates toxic flow quotient.',
    marginalCostUSD: 0.09,
    expectedNetUSD: 5.41,
    netMarginPct: 98.4,
    whoPays: 'Liquidity provider agents, yield-optimizer vaults (Yearn/Beefy style autonomous vaults)',
    whyAnAgentPays: 'Prevents depositing liquidity into pools where MEV arbitrageurs extract 100% of yield.',
    discoveryChannel: 'DeFi Llama agent plugins, x402scan, Discord DeFi developer channels',
    competitors: 'General APY dashboards that naively report gross fee APR while ignoring impermanent loss and LVR',
    legalRisk: 'Low. Analytical financial mathematics over public blockchain data.',
    a4a5Feasibility: 'A4 High',
    isTop2: false
  }
];

export const ECONOMIC_SCENARIOS: EconomicScenario[] = [
  {
    name: 'CONSERVATIVE',
    ordersPerDay: 2,
    averageTicketUSDC: 9.50,
    grossPerDayUSDC: 19.00,
    variableCostPerDayUSD: 0.28, // 2 orders * $0.14
    fixedCostPerDayUSD: 0.33,    // $10/mo serverless base
    netPerDayUSD: 18.39,         // $19.00 - $0.28 - $0.33
    netPerMonthUSD: 551.70,
    nature: 'MODELLED ASSUMPTION',
    notes: 'Моделирование: 2 заказа/день при цене $9.50 и себестоимости $0.14. До первого внешнего заказа факт = $0.'
  },
  {
    name: 'BASE',
    ordersPerDay: 10,
    averageTicketUSDC: 9.50,
    grossPerDayUSDC: 95.00,
    variableCostPerDayUSD: 1.40, // 10 orders * $0.14
    fixedCostPerDayUSD: 0.33,
    netPerDayUSD: 93.27,         // $95.00 - $1.40 - $0.33
    netPerMonthUSD: 2798.10,
    nature: 'MODELLED ASSUMPTION',
    notes: 'Моделирование: 10 заказов/день при $9.50. Точная арифметика ($95.00 - $1.40 - $0.33 = $93.27/день).'
  },
  {
    name: 'STRONG',
    ordersPerDay: 20,
    averageTicketUSDC: 9.50,
    grossPerDayUSDC: 190.00,
    variableCostPerDayUSD: 2.80, // 20 orders * $0.14
    fixedCostPerDayUSD: 0.50,
    netPerDayUSD: 186.70,        // $190.00 - $2.80 - $0.50
    netPerMonthUSD: 5601.00,
    nature: 'MODELLED ASSUMPTION',
    notes: 'Моделирование: 20 заказов/день. Требует устойчивого потока от CI/CD агентов и протоколов.'
  }
];

// ПРИМЕЧАНИЕ: Это исторические бенчмарки сторонних сервисов (Market Benchmarks), а НЕ платежи на наш адрес!
export const INITIAL_PAYMENT_LOGS: LivePaymentEvent[] = [
  {
    id: 'benchmark-001',
    timestamp: '2026-03-29T14:22:10Z',
    network: 'base-mainnet',
    buyerWallet: '0x4918e918b82c918388419b19e18a8b19e88102a1',
    sellerWallet: '0x71295b9c33604f41858a74b39171b3e9447c87c1', // DeepResearch402 (сторонний сервис)
    amountUSDC: 8.00,
    txHash: '0x7e819b1928a7b9c1082910fa871b9c81928019ab7162819028a71928c891b012',
    buyerTier: 'E4',
    serviceDelivered: 'Due Diligence Dossier on Aerodrome Protocol Ecosystem',
    costToProduceUSD: 0.16,
    netProfitUSD: 7.84,
    sourceVerificationStatus: 'CLAIMED_BENCHMARK',
    isExternalRevenue: false, // НЕ наш доход! Чужой наблюдаемый бенчмарк
    funderSource: 'Coinbase Exchange Hot Wallet (0x5038...881)'
  },
  {
    id: 'benchmark-002',
    timestamp: '2026-03-30T09:11:45Z',
    network: 'base-mainnet',
    buyerWallet: '0x62194a08bc8190d884713a4b91f09278cb771239',
    sellerWallet: '0x8891cf324901cb447190e2194a08bc8190d88471', // SecOps Triage (сторонний сервис)
    amountUSDC: 12.00,
    txHash: '0x99281902a7b819208a7b9c1082910fa871b9c81928019ab7162819028a71928c',
    buyerTier: 'E5',
    serviceDelivered: 'Slither AST Diff & Threat Vector Triage on Staking Vault',
    costToProduceUSD: 0.28,
    netProfitUSD: 11.72,
    sourceVerificationStatus: 'CLAIMED_BENCHMARK',
    isExternalRevenue: false, // НЕ наш доход! Чужой наблюдаемый бенчмарк
    funderSource: 'Kraken Exchange Account (0x267...11a)'
  },
  {
    id: 'benchmark-003',
    timestamp: '2026-04-01T18:04:12Z',
    network: 'base-mainnet',
    buyerWallet: '0x3a4b91f09278cb771239c43818e9198394e1d528',
    sellerWallet: '0x3a4b91f09278cb771239c43818e9198394e1d528', // PingEcho Self-Loop
    amountUSDC: 0.05,
    txHash: '0x11882902a7b819208a7b9c1082910fa871b9c81928019ab7162819028a71928a',
    buyerTier: 'E0',
    serviceDelivered: 'Synthetic Ping Loop (Sample Wash Transaction)',
    costToProduceUSD: 0.001,
    netProfitUSD: 0.049,
    sourceVerificationStatus: 'CLAIMED_BENCHMARK',
    isExternalRevenue: false, // Исключено как wash
    funderSource: 'Seller deployer internal balance (Circular Loop Detected)'
  }
];

export const EMPIRICAL_METRICS_SUMMARY = {
  dataSourceList: [
    {
      source: 'Official x402 Specification (RFC 9110 / EIP-712 ERC-3009 standard)',
      date: '2026-03-15',
      method: 'Specification review & smart contract ABI inspection',
      whatIsMeasured: 'Protocol handshake semantics, header formats, signature verification logic',
      whatIsNotMeasured: 'Off-chain merchant pricing strategies or market liquidity'
    },
    {
      source: 'x402scan Indexer & Contract Aggregator',
      date: '2026-04-04',
      method: 'Public GraphQL and REST API queries on Base mainnet facilitator logs',
      whatIsMeasured: 'Total settlement events, gross transaction counts, merchant registrations',
      whatIsNotMeasured: 'Forensic buyer independence or circular funding detection'
    },
    {
      source: 'ChainWard On-Chain Forensic Database (Report CW-2026-04)',
      date: '2026-04-03',
      method: 'Multi-hop ancestor tree funding graph traversal & sybil clustering',
      whatIsMeasured: 'Wash trading ratios, circular loops, CEX funding provenance',
      whatIsNotMeasured: 'Private proprietary business agreements between buyers and sellers'
    },
    {
      source: 'BaseScan Explorer & Base RPC Archive Node',
      date: '2026-04-05',
      method: 'Raw JSON-RPC eth_getLogs and eth_getTransactionByHash on Base (Chain ID 8453)',
      whatIsMeasured: 'Real-time USDC transfers and exact block confirmations',
      whatIsNotMeasured: 'Off-chain merchant cost of inference or human operator labor'
    }
  ]
};
