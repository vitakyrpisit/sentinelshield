import React, { useState } from 'react';
import { NOVEL_SERVICE_IDEAS } from '../data/empiricalData';
import { NovelServiceIdea } from '../types/x402';
import { Sparkles, Star, ShieldCheck, Cpu, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';

export const NovelConcepts: React.FC = () => {
  const [selectedIdea, setSelectedIdea] = useState<NovelServiceIdea>(NOVEL_SERVICE_IDEAS[0]);

  const top2Ideas = NOVEL_SERVICE_IDEAS.filter((i) => i.isTop2);
  const otherIdeas = NOVEL_SERVICE_IDEAS.filter((i) => !i.isTop2);

  return (
    <div className="space-y-8">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Section 6 &amp; 7: New Autonomous Service Architectures</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          5 Novel Outcome Services &amp; The Selected Top 2
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Constructed from verified on-chain demand signals. Each service delivers a high-leverage structured outcome that autonomous buyer agents cannot easily produce themselves, pricing at $4.50–$18.00 with &gt;98% net margins.
        </p>
      </div>

      {/* TOP 2 HIGHLIGHT SECTION */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              The Selected Top 2 Production Services (Section 7)
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-semibold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800">
            Optimal Risk-Adjusted Profitability
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Selected not because of historical volume hype, but based on the optimal convergence of: 
          <strong className="text-white"> External Demand (E3-E5) + High Ticket ($7.00–$9.50) + High Net Margin (&gt;98%) + Repeatability + Zero Start Capital + Full Machine Autonomy + Low Legal Risk</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {top2Ideas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                selectedIdea.id === idea.id
                  ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-500/20 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  TOP #{idea.rank} SELECTION
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ${idea.priceUSDC.toFixed(2)} USDC
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">{idea.name}</h4>
              
              <div className="space-y-2 text-xs font-mono mb-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Marginal Unit Cost:</span>
                  <span className="text-slate-200">${idea.marginalCostUSD.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Expected Net Profit:</span>
                  <span className="text-emerald-400 font-bold">+${idea.expectedNetUSD.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Autonomy Feasibility:</span>
                  <span className="text-indigo-300">{idea.a4a5Feasibility}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-slate-100 font-sans block mb-1">Why External Agents Pay:</strong>
                <p className="font-sans leading-relaxed text-slate-400">{idea.whyAnAgentPays}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED IDEA INSPECTOR (FULL SCHEMA FROM SECTION 6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>Detailed Architectural Dossier</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-semibold">{selectedIdea.id.toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{selectedIdea.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Unit Price:</span>
            <div className="text-xl font-bold font-mono text-emerald-400">${selectedIdea.priceUSDC.toFixed(2)} USDC</div>
          </div>
        </div>

        {/* 14 Schema Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">1. Machine Input</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.input}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">2. Structured Output</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.output}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">3. Data Sources &amp; Ingestion</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.dataSources}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">4. Degree of Full Automation</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.automation}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">5. Marginal Cost &amp; Expected Net</span>
            <p className="text-slate-200 text-xs font-sans">
              Marginal Cost: <span className="text-slate-100 font-mono">${selectedIdea.marginalCostUSD.toFixed(2)}</span> · Expected Net: <span className="text-emerald-400 font-mono font-bold">${selectedIdea.expectedNetUSD.toFixed(2)}</span> ({selectedIdea.netMarginPct}% margin)
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">6. Who Pays (Buyer Agent Archetype)</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.whoPays}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">7. Why an Autonomous Agent Pays</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.whyAnAgentPays}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">8. Autonomous Discovery Channel</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.discoveryChannel}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">9. Existing Competitors &amp; Moat</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.competitors}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] block">10. Legal, Compliance &amp; Operational Risk</span>
            <p className="text-slate-200 text-xs font-sans">{selectedIdea.legalRisk}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 md:col-span-2">
            <span className="text-slate-400 uppercase text-[10px] block">11. A4 / A5 Feasibility Assessment</span>
            <p className="text-slate-200 text-xs font-sans">
              Rating: <span className="text-indigo-400 font-bold">{selectedIdea.a4a5Feasibility}</span>. Completely feasible without human intervention post-deployment; machine handles the 402 handshake, EIP-712 recovery, deterministic outcome execution, and settlement confirmation.
            </p>
          </div>

        </div>

      </div>

      {/* ALL 5 IDEAS QUICK SELECTOR TABS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <span className="text-xs font-semibold text-slate-400 font-mono uppercase block mb-3">
          Explore All 5 Evaluated Ideas:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {NOVEL_SERVICE_IDEAS.map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedIdea.id === idea.id
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>IDEA #{index + 1}</span>
                <span className="font-bold text-emerald-400">${idea.priceUSDC.toFixed(2)}</span>
              </div>
              <div className="text-xs font-semibold truncate text-slate-200">{idea.name.split(':')[0]}</div>
              <div className="text-[10px] text-slate-400 mt-1">{idea.isTop2 ? '⭐ Selected Top 2' : 'Alternative'}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
