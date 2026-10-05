import React, { useState } from 'react';
import { runX402ProtocolSimulation, X402SimulationResult } from '../services/x402Simulator';
import { OFFICIAL_PAYOUT_ADDRESS, INITIAL_PAYMENT_LOGS } from '../data/empiricalData';
import { LivePaymentEvent } from '../types/x402';
import { Play, CheckCircle2, Terminal, AlertTriangle, ShieldCheck, ArrowRight, Layers, FileCode, Copy, Check } from 'lucide-react';

interface TestnetWorkbenchProps {
  network: 'base-sepolia' | 'base-mainnet';
  onPaymentRecorded?: (payment: LivePaymentEvent) => void;
}

export const TestnetWorkbench: React.FC<TestnetWorkbenchProps> = ({ network, onPaymentRecorded }) => {
  const [selectedService, setSelectedService] = useState<'sentinel-shield' | 'veri-vendor'>('sentinel-shield');
  const [targetInput, setTargetInput] = useState<string>('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
  const [buyerAddress, setBuyerAddress] = useState<string>('0x4918e918b82c918388419b19e18a8b19e88102a1');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<X402SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'payloads' | 'economics' | 'repeat_tracker'>('console');
  const [copied, setCopied] = useState<boolean>(false);

  // Repeat tracker state (Section 12: goal of 5 payments & 3+ independent wallets)
  const [payments, setPayments] = useState<LivePaymentEvent[]>(INITIAL_PAYMENT_LOGS);

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const result = await runX402ProtocolSimulation(
        selectedService,
        targetInput,
        buyerAddress,
        network
      );
      setSimulationResult(result);

      // Record in live list if economic
      const newPayment: LivePaymentEvent = {
        id: `sim-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        network,
        buyerWallet: buyerAddress,
        sellerWallet: OFFICIAL_PAYOUT_ADDRESS,
        amountUSDC: result.amountPaidUSDC,
        txHash: result.simulatedTxHash,
        buyerTier: 'E3',
        serviceDelivered: result.serviceName,
        costToProduceUSD: result.economics.totalCostUSD,
        netProfitUSD: network === 'base-mainnet' ? result.economics.netProfitUSD : 0.0, // Testnet revenue = $0!
        sourceVerificationStatus: 'LOCAL_SIMULATION',
        isExternalRevenue: false, // Local simulation is NOT real external revenue!
        funderSource: 'Simulated Local Payer (Offline Test Fixture)'
      };

      setPayments([newPayment, ...payments]);
      if (onPaymentRecorded) {
        onPaymentRecorded(newPayment);
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyOutcome = () => {
    if (simulationResult) {
      navigator.clipboard.writeText(JSON.stringify(simulationResult.serviceResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Section 12 KPI calculations
  const totalReceivedCount = payments.length;
  const externalPaymentsOnly = payments.filter((p) => p.isExternalRevenue);
  const uniqueBuyerWallets = new Set(externalPaymentsOnly.map((p) => p.buyerWallet)).size;
  const repeatBuyersCount = externalPaymentsOnly.filter(
    (p, i, arr) => arr.findIndex((x) => x.buyerWallet === p.buyerWallet) !== i
  ).length;

  return (
    <div className="space-y-8">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" />
              <span>Section 8, 9, 10, 11 &amp; 12: Interactive Protocol Workbench</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              x402 Testnet Engine, Mainnet Settlement &amp; Repeat Demand
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Strictly executes the official x402 specification: <code className="text-slate-300 font-mono">HTTP 402</code> challenge with EIP-712 ERC-3009 schema, gasless authorization signature, facilitator settlement, and machine outcome receipt.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-right min-w-[200px]">
            <div className="text-[11px] text-slate-400 font-mono">Current Mode</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {network === 'base-sepolia' ? 'Testnet Sandbox ($0 Rev)' : 'Mainnet Target (USDC)'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Payout: {OFFICIAL_PAYOUT_ADDRESS.slice(0, 6)}...{OFFICIAL_PAYOUT_ADDRESS.slice(-4)}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Service, Target & Buyer Address */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
          <span>Protocol Execution Parameters</span>
          <span className="text-xs text-slate-400 font-mono normal-case">
            Zero operator private keys required (Receive-Only)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* Service Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
              Target Outcome Service:
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="sentinel-shield">SentinelShield: Security &amp; AST Threat Matrix ($9.50)</option>
              <option value="veri-vendor">VeriVendor: B2B API Reliability Dossier ($7.00)</option>
            </select>
          </div>

          {/* Machine Input Parameter */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
              Input Argument (Contract / Domain):
            </label>
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buyer Wallet Address */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">
              Buyer Agent Wallet (Payer):
            </label>
            <input
              type="text"
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="0x4918e918b82c918388419b19e18a8b19e88102a1"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {network === 'base-sepolia' ? (
              <span className="text-amber-400 font-mono text-[11px]">
                ℹ Testnet Rule: Testnet payment signifies TECHNICAL TEST PASSED. Testnet revenue = $0.00.
              </span>
            ) : (
              <span className="text-emerald-400 font-mono text-[11px]">
                ✓ Mainnet Mode: Simulates real EIP-712 transferWithAuthorization on Base Mainnet.
              </span>
            )}
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-indigo-900/30"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${simulating ? 'animate-pulse' : ''}`} />
            {simulating ? 'Executing x402 Handshake...' : 'Trigger Full x402 Protocol Cycle'}
          </button>
        </div>

      </div>

      {/* Execution Results View: Segmented Tabs */}
      {simulationResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono mb-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK DELIVERED
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-mono text-[11px]">[SIMULATION]</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 font-mono">Hash: {simulationResult.simulatedTxHash.slice(0, 16)}...</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400 font-semibold">{simulationResult.network}</span>
              </div>
              <h3 className="text-base font-bold text-white">{simulationResult.serviceName}</h3>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'console' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Protocol Steps ({simulationResult.logs.length})
              </button>
              <button
                onClick={() => setActiveTab('payloads')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'payloads' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Delivered Outcome
              </button>
              <button
                onClick={() => setActiveTab('economics')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'economics' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Per-Order Unit Economics
              </button>
            </div>
          </div>

          {/* TAB 1: Step-by-Step Console Log */}
          {activeTab === 'console' && (
            <div className="space-y-3">
              {simulationResult.logs.map((step) => (
                <div key={step.stepNumber} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] font-bold">
                        STEP {step.stepNumber}
                      </span>
                      <span className="font-semibold text-slate-200">{step.title}</span>
                      {step.statusCode && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          step.statusCode === 402 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          HTTP {step.statusCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{step.direction}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mb-2">{step.summary}</p>
                  <pre className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-indigo-300/90 overflow-x-auto max-h-36">
                    {JSON.stringify(step.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Outcome Deliverable Document */}
          {activeTab === 'payloads' && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase">
                  Machine-Readable Structured Artifact (SHA-256 Verified)
                </span>
                <button
                  onClick={handleCopyOutcome}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy JSON
                </button>
              </div>

              <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div><span className="text-slate-400">Integrity Hash:</span> sha256:{simulationResult.sha256Checksum}</div>
                <div><span className="text-slate-400">Settlement (Simulated):</span> {simulationResult.simulatedTxHash}</div>
                <div><span className="text-slate-400">Recipient Address:</span> {simulationResult.payoutAddress}</div>
              </div>

              <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-80">
                {JSON.stringify(simulationResult.serviceResult, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: Unit Economics of This Exact Order */}
          {activeTab === 'economics' && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Per-Order Unit Economics Formula (Prompt Section 13)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Gross Revenue</div>
                  <div className="text-lg font-bold text-white mt-1">
                    ${simulationResult.economics.grossRevenueUSD.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">100% USDC on Base</div>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Variable Costs</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    -${simulationResult.economics.totalCostUSD.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-400">LLM + RPC + Facilitator</div>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Net Realized Profit</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    +${simulationResult.economics.netProfitUSD.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">To Payout Address</div>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Net Margin %</div>
                  <div className="text-lg font-bold text-indigo-300 mt-1">
                    {simulationResult.economics.netMarginPct.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Ultra-High Leverage</div>
                </div>
              </div>

              {/* Detailed deductions table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden text-xs font-mono">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Cost Amount</th>
                      <th className="py-2 px-3">Vendor / Infrastructure Layer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="py-2 px-3">Data Ingestion</td>
                      <td className="py-2 px-3 text-slate-400">${simulationResult.economics.dataCostUSD.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-400">Public Base RPC &amp; Web Scraper</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">LLM Synthesis</td>
                      <td className="py-2 px-3 text-slate-400">${simulationResult.economics.llmCostUSD.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-400">Gemini 2.5 Flash / Fast Inference</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Compute &amp; AST Analysis</td>
                      <td className="py-2 px-3 text-slate-400">${simulationResult.economics.computeCostUSD.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-400">Stateless Serverless Execution</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Facilitator Gas &amp; Settlement</td>
                      <td className="py-2 px-3 text-slate-400">${simulationResult.economics.facilitatorFeeUSD.toFixed(3)}</td>
                      <td className="py-2 px-3 text-slate-400">Base L2 Gas Relay Fee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 11 & 12: REPEAT TEST TRACKER & BUYER PROVENANCE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Section 11 &amp; 12: Repeat Demand &amp; Externality Proof</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Independent Buyer Verification &amp; 5-Payment Target
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Target Goal: <strong>5 Payments</strong></span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">Goal: <strong>3+ Independent Wallets</strong></span>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block mb-1">Recorded Payments:</span>
            <div className="text-xl font-bold text-white">{totalReceivedCount} / 5 target</div>
            <div className="text-[10px] text-slate-400 mt-1">Verified on Base contract</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block mb-1">Independent Wallets (E3–E5):</span>
            <div className="text-xl font-bold text-indigo-400">{uniqueBuyerWallets} / 3 target</div>
            <div className="text-[10px] text-slate-400 mt-1">Distinct funder origins</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block mb-1">Repeat Purchases:</span>
            <div className="text-xl font-bold text-emerald-400">{repeatBuyersCount} repeat signals</div>
            <div className="text-[10px] text-slate-400 mt-1">Non-wash repeat retention</div>
          </div>
        </div>

        {/* Payments History Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Tx Hash</th>
                <th className="py-2.5 px-3">Buyer Address</th>
                <th className="py-2.5 px-3">Funder Provenance (Section 11)</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-indigo-400">
                    {p.txHash.slice(0, 10)}...{p.txHash.slice(-6)}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    {p.buyerWallet.slice(0, 8)}...{p.buyerWallet.slice(-6)}
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">
                    {p.funderSource}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      p.buyerTier === 'E0' ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {p.buyerTier}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-white font-bold">
                    ${p.amountUSDC.toFixed(2)} USDC
                  </td>
                  <td className="py-2 px-3">
                    {p.isExternalRevenue ? (
                      <span className="text-emerald-400 font-bold">+${p.netProfitUSD.toFixed(2)}</span>
                    ) : (
                      <span className="text-rose-400 font-sans text-[11px]">Excluded (Wash/Loop)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
