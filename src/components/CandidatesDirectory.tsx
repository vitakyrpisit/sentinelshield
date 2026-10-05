import React, { useState } from 'react';
import { CANDIDATE_SELLERS } from '../data/empiricalData';
import { CandidateSeller } from '../types/x402';
import { CheckCircle2, DollarSign, Filter, Search, Award, Shield, FileText, ChevronRight } from 'lucide-react';

export const CandidatesDirectory: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSeller>(CANDIDATE_SELLERS[0]);
  const [filterPriceBracket, setFilterPriceBracket] = useState<'ALL' | 'SUB_10' | '10_PLUS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = CANDIDATE_SELLERS.filter((c) => {
    const matchesSearch = c.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.whoBuys.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.output.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterPriceBracket === 'SUB_10') return c.priceUSD < 10;
    if (filterPriceBracket === '10_PLUS') return c.priceUSD >= 10;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Anti-Commodity Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Section 3, 4 &amp; 5: Candidate Intelligence</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          10 Top Outcome Seller Candidates &amp; Zero-Capital Feasibility
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          We strictly follow the <span className="text-amber-400 font-semibold">"SELL OUTCOME, NOT RAW INPUT"</span> doctrine. Avoid commoditized $0.0001 search, weather, or raw LLM pass-throughs. Prioritize $1–$10 and $10–$50 decision-ready artifacts.
        </p>

        {/* Outcome vs Input Comparison Strip */}
        <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border-l-2 border-rose-500 pl-3">
            <span className="text-rose-400 font-mono uppercase text-[10px] block font-bold">Commoditized Raw Input (Avoid)</span>
            <span className="text-slate-300 font-medium">"GET /api/v1/search?q=XYZ" · $0.0005 / call</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Race to bottom. 0 customer loyalty, easily scraped or bypassed, near-zero economic moats.
            </p>
          </div>
          <div className="border-l-2 border-emerald-500 pl-3">
            <span className="text-emerald-400 font-mono uppercase text-[10px] block font-bold">Validated Outcome (Preferred)</span>
            <span className="text-slate-300 font-medium">"Decision-Ready Due Diligence Dossier" · $6.50–$12.00 / outcome</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Synthesis of multiple sources, automated AST/forensic reasoning, risk scoring, signed cryptographic delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, buyers, outputs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono w-full sm:w-auto">
          <button
            onClick={() => setFilterPriceBracket('ALL')}
            className={`px-3 py-1 rounded transition-colors ${
              filterPriceBracket === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All (10)
          </button>
          <button
            onClick={() => setFilterPriceBracket('SUB_10')}
            className={`px-3 py-1 rounded transition-colors ${
              filterPriceBracket === 'SUB_10' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            $1–$10 Priority (7)
          </button>
          <button
            onClick={() => setFilterPriceBracket('10_PLUS')}
            className={`px-3 py-1 rounded transition-colors ${
              filterPriceBracket === '10_PLUS' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            $10–$50 High-Ticket (3)
          </button>
        </div>
      </div>

      {/* Grid of Candidates + Detailed Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List: Candidates List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => setSelectedCandidate(cand)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedCandidate.id === cand.id
                  ? 'bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-emerald-400">{cand.price}</span>
                    <span className="text-[10px] font-mono text-slate-400">· Net Margin: {cand.netMarginPct}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate">{cand.service}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cand.whoBuys}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60">
                    {cand.scores.total}/45
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Net: +${cand.netPerOrderUSD.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail: Full 17-parameter breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
          {selectedCandidate && (
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span className="text-indigo-400 font-semibold">{selectedCandidate.id.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-bold">{selectedCandidate.price}</span>
                    <span aria-hidden="true">·</span>
                    <span>Net Profit / Order: +${selectedCandidate.netPerOrderUSD.toFixed(2)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedCandidate.service}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                  <div className="text-[10px] text-slate-400 font-mono">EVAL SCORE</div>
                  <div className="text-xl font-bold font-mono text-indigo-300">
                    {selectedCandidate.scores.total}<span className="text-xs text-slate-400">/45</span>
                  </div>
                </div>
              </div>

              {/* 17 Parameters Table */}
              <div className="space-y-3 text-xs">
                
                {/* Inputs & Outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Machine Input:</span>
                    <p className="text-slate-200 font-mono text-[11px] leading-relaxed">{selectedCandidate.input}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Machine-Readable Output:</span>
                    <p className="text-slate-200 font-mono text-[11px] leading-relaxed">{selectedCandidate.output}</p>
                  </div>
                </div>

                {/* Buyer Behavior */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Who Buys:</span>
                      <span className="text-slate-200 font-medium text-xs">{selectedCandidate.whoBuys}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Buyer Tier:</span>
                      <span className="text-indigo-300 font-mono text-xs">{selectedCandidate.buyerType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">Repeat Rate:</span>
                      <span className="text-emerald-400 font-mono text-xs">{selectedCandidate.repeatRate}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Why They Buy (Economic Incentive):</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{selectedCandidate.whyBuy}</p>
                  </div>
                </div>

                {/* Granular Cost Breakdown */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">
                      Granular Marginal Unit Cost (Per Execution):
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Total Cost: ${(
                        selectedCandidate.dataCost +
                        selectedCandidate.llmCost +
                        selectedCandidate.computeCost +
                        selectedCandidate.rpcCost +
                        selectedCandidate.hostingCost +
                        selectedCandidate.otherCost
                      ).toFixed(3)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">DATA</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.dataCost.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">LLM</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.llmCost.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">COMPUTE</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.computeCost.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">RPC</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.rpcCost.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">HOSTING</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.hostingCost.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">FACILITATOR</div>
                      <div className="text-xs font-semibold text-slate-200">${selectedCandidate.otherCost.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Gross Margin: <strong className="text-slate-200">{selectedCandidate.grossMarginPct}%</strong></span>
                    <span className="text-slate-400">Net Profit Margin: <strong className="text-emerald-400">{selectedCandidate.netMarginPct}%</strong></span>
                  </div>
                </div>

                {/* Zero-Capital Feasibility Question */}
                <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-200 text-xs font-mono">
                      Can We Build an Analogue with ~Zero Start Capital?
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      YES ({selectedCandidate.zeroCapitalFeasible ? 'CONFIRMED' : 'NO'})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {selectedCandidate.zeroCapitalRationale}
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
