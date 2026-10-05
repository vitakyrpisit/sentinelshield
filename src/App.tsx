/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { LiveOnChainTracker } from './components/LiveOnChainTracker';
import { WashVolumeForensics } from './components/WashVolumeForensics';
import { CandidatesDirectory } from './components/CandidatesDirectory';
import { NovelConcepts } from './components/NovelConcepts';
import { TestnetWorkbench } from './components/TestnetWorkbench';
import { UnitEconomicsSimulator } from './components/UnitEconomicsSimulator';
import { AutonomousLoopAudit } from './components/AutonomousLoopAudit';
import { ExecutiveVerdictReport } from './components/ExecutiveVerdictReport';
import { RealRevenueHarness } from './components/RealRevenueHarness';
import { OnChainWalletStatus } from './services/baseRpc';
import { LivePaymentEvent } from './types/x402';
import { OFFICIAL_PAYOUT_ADDRESS } from './data/empiricalData';
import { 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Award, 
  Calculator, 
  Cpu, 
  Activity, 
  Sparkles,
  ExternalLink,
  Target,
  ChevronRight
} from 'lucide-react';

type ActiveTab = 
  | 'mission'
  | 'verdict'
  | 'forensics'
  | 'candidates'
  | 'novel'
  | 'testnet'
  | 'economics'
  | 'autonomy'
  | 'scanner';

export default function App() {
  const [activeNetwork, setActiveNetwork] = useState<'base-mainnet' | 'base-sepolia'>('base-mainnet');
  const [activeTab, setActiveTab] = useState<ActiveTab>('mission');
  const [walletStatus, setWalletStatus] = useState<OnChainWalletStatus | null>(null);

  const handleExportReport = () => {
    setActiveTab('verdict');
    // Scroll smoothly to report
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleOpenTestHarness = () => {
    setActiveTab('testnet');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* Top Header */}
      <Header
        activeNetwork={activeNetwork}
        onNetworkChange={setActiveNetwork}
        onExportReport={handleExportReport}
        onOpenTestHarness={handleOpenTestHarness}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Metric Summary Strip */}
        <MetricCards
          walletStatus={walletStatus}
          onOpenLiveScanner={() => setActiveTab('scanner')}
        />

        {/* Primary Navigation Tabs */}
        <div className="mb-6 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs font-mono scrollbar-none">
            
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'mission'
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400/50'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>🎯 Real Revenue Mission (10-Test Suite)</span>
            </button>

            <button
              onClick={() => setActiveTab('verdict')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'verdict'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>1. Verdict &amp; Report (Sec 18–21)</span>
            </button>

            <button
              onClick={() => setActiveTab('forensics')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'forensics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Wash Volume &amp; E0–E5 (Sec 1–2)</span>
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'candidates'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Top 10 Candidates (Sec 3–5)</span>
            </button>

            <button
              onClick={() => setActiveTab('novel')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'novel'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4. Top 2 &amp; 5 Ideas (Sec 6–7)</span>
            </button>

            <button
              onClick={() => setActiveTab('testnet')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'testnet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>5. Testnet &amp; Mainnet Cycle (Sec 8–12)</span>
            </button>

            <button
              onClick={() => setActiveTab('economics')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'economics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>6. Unit Economics &amp; Scenarios (Sec 13, 16–17)</span>
            </button>

            <button
              onClick={() => setActiveTab('autonomy')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'autonomy'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>7. A4/A5 Autonomy &amp; Manifest (Sec 14–15)</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>8. Live Base RPC Scanner</span>
            </button>

          </div>
        </div>

        {/* Dynamic Tab Panes */}
        <div className="transition-opacity duration-200">
          {activeTab === 'mission' && (
            <RealRevenueHarness />
          )}

          {activeTab === 'verdict' && (
            <ExecutiveVerdictReport
              walletStatus={walletStatus}
              onOpenTestHarness={handleOpenTestHarness}
            />
          )}

          {activeTab === 'forensics' && (
            <WashVolumeForensics />
          )}

          {activeTab === 'candidates' && (
            <CandidatesDirectory />
          )}

          {activeTab === 'novel' && (
            <NovelConcepts />
          )}

          {activeTab === 'testnet' && (
            <TestnetWorkbench
              network={activeNetwork}
              onPaymentRecorded={(p) => {
                // If payment recorded on mainnet, we can update status
              }}
            />
          )}

          {activeTab === 'economics' && (
            <UnitEconomicsSimulator />
          )}

          {activeTab === 'autonomy' && (
            <AutonomousLoopAudit />
          )}

          {activeTab === 'scanner' && (
            <LiveOnChainTracker
              network={activeNetwork}
              onStatusUpdated={setWalletStatus}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">x402 Autonomous Profit Experiment</span>
            <span aria-hidden="true">·</span>
            <span>Base L2 USDC Protocol</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Receive-Only Wallet: {OFFICIAL_PAYOUT_ADDRESS.slice(0, 10)}...</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://basescan.org/address/${OFFICIAL_PAYOUT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              BaseScan Explorer <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <span>Zero Operator Keys Exposed</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
