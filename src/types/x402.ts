/**
 * Core type definitions for X402 Autonomous Profit Experiment & Real Revenue Test.
 * Strictly distinguishes empirical claims from verifiable on-chain evidence.
 */

export type EvidenceStatus =
  | 'CLAIMED'
  | 'OBSERVED'
  | 'RPC_VERIFIED'
  | 'TX_VERIFIED'
  | 'EXTERNALITY_VERIFIED'
  | 'OUR_REVENUE'
  | 'OUR_PROFIT';

export type BuyerTier = 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'UNKNOWN';

export type ExternalityStatus =
  | 'UNKNOWN'
  | 'POSSIBLY_INDEPENDENT'
  | 'INDEPENDENT_VERIFIED'
  | 'SELF_FUNDED'
  | 'CIRCULAR';

export interface BuyerClassification {
  tier: BuyerTier;
  label: string;
  description: string;
  economicValidity: boolean;
  criteria: string;
}

export interface SellerAuditRecord {
  sellerName: string;
  serviceCategory: string;
  wallet: string;
  network: string;
  totalSettlements: number;
  totalReportedVolumeUSDC: number;
  uniqueBuyers: number;
  buyerFunders: string;
  otherServicesUsedByBuyers: string;
  sellerToBuyerFundingDetected: boolean;
  roundTripsIdentified: number;
  closedLoopsCount: number;
  externalBuyersCountE3toE5: number;
  externalVolumeUSDC: number;
  washVolumePercentage: number;
  knownTxHashes: string[];
  forensicSummary: string;
  evidenceStatus?: EvidenceStatus;
  dataSource: {
    source: string;
    date: string;
    method: string;
    whatIsMeasured: string;
    whatIsNotMeasured: string;
  };
}

export interface CandidateSeller {
  id: string;
  service: string;
  price: string;
  priceUSD: number;
  input: string;
  output: string;
  whoBuys: string;
  whyBuy: string;
  buyerType: string;
  buyFrequency: string;
  repeatRate: string;
  dataCost: number;
  llmCost: number;
  computeCost: number;
  rpcCost: number;
  hostingCost: number;
  otherCost: number;
  grossMarginPct: number;
  netMarginPct: number;
  netPerOrderUSD: number;
  zeroCapitalFeasible: boolean;
  zeroCapitalRationale: string;
  scores: {
    evidence: number;
    externalDemand: number;
    autonomy: number;
    zeroCapital: number;
    payoutAutomation: number;
    netMargin: number;
    scalability: number;
    competition: number;
    risk: number;
    total: number;
  };
}

export interface NovelServiceIdea {
  id: string;
  name: string;
  input: string;
  output: string;
  priceUSDC: number;
  dataSources: string;
  automation: string;
  marginalCostUSD: number;
  expectedNetUSD: number;
  netMarginPct: number;
  whoPays: string;
  whyAnAgentPays: string;
  discoveryChannel: string;
  competitors: string;
  legalRisk: string;
  a4a5Feasibility: 'A4 High' | 'A4/A5 Feasible' | 'A5 Experimental';
  isTop2: boolean;
  rank?: number;
}

export interface EconomicScenario {
  name: 'CONSERVATIVE' | 'BASE' | 'STRONG';
  ordersPerDay: number;
  averageTicketUSDC: number;
  grossPerDayUSDC: number;
  variableCostPerDayUSD: number;
  fixedCostPerDayUSD: number;
  netPerDayUSD: number;
  netPerMonthUSD: number;
  nature: 'MODELLED ASSUMPTION' | 'EMPIRICAL BENCHMARK';
  notes: string;
}

export interface LivePaymentEvent {
  id: string;
  timestamp: string;
  network: 'base-mainnet' | 'base-sepolia';
  buyerWallet: string;
  sellerWallet: string;
  amountUSDC: number;
  txHash: string;
  buyerTier: BuyerTier;
  serviceDelivered: string;
  costToProduceUSD: number;
  netProfitUSD: number;
  evidenceStatus?: EvidenceStatus;
  externalityStatus?: ExternalityStatus;
  sourceVerificationStatus?: string;
  isExternalRevenue: boolean;
  funderSource: string;
}

export interface SentinelShieldInput {
  chain?: 'base' | 'ethereum';
  contractAddress?: string;
  bytecode?: string;
  sourceCode?: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  level: 'error' | 'warning' | 'note';
  title: string;
  description: string;
  exploitVector: string;
  mitigation: string;
  cvssScore: number;
}

export interface SentinelShieldOutput {
  service: 'SentinelShield Contract Risk Triage';
  version: '2.0.0';
  target: {
    chain: string;
    contractAddress?: string;
    verifiedOnScan: boolean;
  };
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SECURE';
  overallScore: number; // 0-100 (100 = safest)
  summary: string;
  exploitability: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  findings: Finding[];
  metrics: {
    reentrancyProtected: boolean;
    flashLoanDrainVulnerable: boolean;
    unauthorizedUpgradeVector: boolean;
    uncheckedArithmetic: boolean;
  };
  sarif: {
    $schema: string;
    version: string;
    runs: {
      tool: {
        driver: {
          name: string;
          version: string;
          rules: { id: string; name: string; shortDescription: { text: string } }[];
        };
      };
      results: {
        ruleId: string;
        level: string;
        message: { text: string };
      }[];
    }[];
  };
  generatedAt: string;
  sha256Checksum: string;
}

export interface PaymentRequirementResponse {
  error: string;
  message: string;
  paymentRequirements: {
    version: string;
    scheme: 'exact';
    network: 'eip155:8453' | 'eip155:84532';
    chainId: number;
    token: 'USDC';
    tokenAddress: string;
    amount: string; // Atomic (e.g. 9500000)
    amountUSD: number; // 9.50
    payTo: string;
    facilitator: string;
    resource: string;
    description: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
    eip712Domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: string;
    };
    types: {
      TransferWithAuthorization: { name: string; type: string }[];
    };
  };
}
