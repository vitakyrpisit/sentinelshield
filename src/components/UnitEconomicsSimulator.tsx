import React, { useState } from 'react';
import { ECONOMIC_SCENARIOS } from '../data/empiricalData';
import { EconomicScenario } from '../types/x402';
import { Calculator, TrendingUp, Sliders, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const UnitEconomicsSimulator: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'CONSERVATIVE' | 'BASE' | 'STRONG'>('BASE');
  const [ticketPrice, setTicketPrice] = useState<number>(8.25);
  const [ordersPerDay, setOrdersPerDay] = useState<number>(10);
  const [variableCostPerOrder, setVariableCostPerOrder] = useState<number>(0.125); // LLM + RPC + compute + facilitator
  const [fixedMonthlyCost, setFixedMonthlyCost] = useState<number>(10.00); // Serverless base + domain

  // Calculated metrics
  const grossDaily = ticketPrice * ordersPerDay;
  const variableDaily = variableCostPerOrder * ordersPerDay;
  const fixedDaily = fixedMonthlyCost / 30;
  const netDaily = grossDaily - variableDaily - fixedDaily;
  const netMonthly = netDaily * 30;
  const netMarginPct = ((netDaily / (grossDaily || 1)) * 100);

  const applyPreset = (preset: 'CONSERVATIVE' | 'BASE' | 'STRONG') => {
    setSelectedPreset(preset);
    if (preset === 'CONSERVATIVE') {
      setTicketPrice(8.25);
      setOrdersPerDay(2);
      setVariableCostPerOrder(0.125);
      setFixedMonthlyCost(10.00);
    } else if (preset === 'BASE') {
      setTicketPrice(8.25);
      setOrdersPerDay(10);
      setVariableCostPerOrder(0.125);
      setFixedMonthlyCost(10.00);
    } else {
      setTicketPrice(8.25);
      setOrdersPerDay(35);
      setVariableCostPerOrder(0.125);
      setFixedMonthlyCost(15.00);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          <span>Section 13, 16 &amp; 17: Financial Forensics &amp; Projections</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Unit Economics, Scenario Modeling &amp; Outcome Value Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Real net profit requires subtracting all infrastructure deductions (Inference, RPC, Hosting, Compute, Facilitator relay fees). All scenarios below are explicitly tagged: <span className="text-amber-400 font-mono font-semibold">[MODELLED ASSUMPTION]</span> vs <span className="text-emerald-400 font-mono font-semibold">[ON-CHAIN FACT]</span>.
        </p>
      </div>

      {/* THREE SCENARIOS COMPARISON CARDS (SECTION 16) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ECONOMIC_SCENARIOS.map((sc) => (
          <div
            key={sc.name}
            onClick={() => applyPreset(sc.name)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === sc.name
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {sc.name} SCENARIO
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                [{sc.nature}]
              </span>
            </div>

            <div className="my-3">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Projected Net Monthly</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                +${sc.netPerMonthUSD.toFixed(2)}
              </div>
              <div className="text-xs font-mono text-slate-300 mt-0.5">
                +${sc.netPerDayUSD.toFixed(2)} net / day ({sc.ordersPerDay} orders/day @ ${sc.averageTicketUSDC.toFixed(2)})
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
              {sc.notes}
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE DYNAMIC SIMULATOR SLIDERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Dynamic Variable &amp; Fixed Economics Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Interactive Parametric Modeling
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Average Ticket */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Average Outcome Ticket:</span>
              <span className="text-white font-bold">${ticketPrice.toFixed(2)} USDC</span>
            </div>
            <input
              type="range"
              min="1.00"
              max="25.00"
              step="0.25"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>$1.00 (Micro)</span>
              <span>$8.25 (Avg)</span>
              <span>$25.00 (Enterprise)</span>
            </div>
          </div>

          {/* Orders Per Day */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Paid External Orders / Day:</span>
              <span className="text-white font-bold">{ordersPerDay} orders</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={ordersPerDay}
              onChange={(e) => setOrdersPerDay(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1 (Conservative)</span>
              <span>15 (Base)</span>
              <span>50 (Strong)</span>
            </div>
          </div>

          {/* Variable Cost per Order */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Variable Marginal Cost / Order:</span>
              <span className="text-rose-400 font-bold">${variableCostPerOrder.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.50"
              step="0.01"
              value={variableCostPerOrder}
              onChange={(e) => setVariableCostPerOrder(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>$0.02 (Fast)</span>
              <span>$0.125 (Deep)</span>
              <span>$0.50 (Heavy AST)</span>
            </div>
          </div>

        </div>

        {/* Live Simulation Results Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Gross Revenue / Day</div>
            <div className="text-lg font-bold text-white mt-1">${grossDaily.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">${(grossDaily * 30).toFixed(2)} / mo</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Total Costs / Day</div>
            <div className="text-lg font-bold text-rose-400 mt-1">-${(variableDaily + fixedDaily).toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">Var: ${variableDaily.toFixed(2)} · Fix: ${fixedDaily.toFixed(2)}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Net Realized / Day</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">+${netDaily.toFixed(2)}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">{netMarginPct.toFixed(1)}% margin</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Net Realized / Month</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">+${netMonthly.toFixed(2)}</div>
            <div className="text-[10px] text-indigo-300">Sustainable Run-Rate</div>
          </div>
        </div>

      </div>

      {/* SECTION 17: OUTCOME VS TECHNOLOGY VERIFICATION MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Section 17: What Is the Customer Actually Buying?</span>
        </div>
        <h3 className="text-base font-bold text-white tracking-tight mb-2">
          De-commoditization Audit: Outcome vs. Raw Technical Pass-Through
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-3xl">
          Autonomous buyer agents will not pay for what they can do themselves for free (e.g. querying a public RPC or pinging an API). They pay exclusively for <strong className="text-white">completed, risk-reducing, decision-ready outcomes</strong>.
        </p>

        <div className="overflow-x-auto border border-slate-800 rounded-lg text-xs font-mono">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Service Domain</th>
                <th className="py-2.5 px-3 text-rose-400">NOT Buying (Raw Tech)</th>
                <th className="py-2.5 px-3 text-emerald-400">ACTUALLY Buying (Real Outcome)</th>
                <th className="py-2.5 px-3">Price Disparity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Smart Contract Security</td>
                <td className="py-2.5 px-3 text-rose-300">"Raw Slither static analysis JSON dump"</td>
                <td className="py-2.5 px-3 text-emerald-300">"Validated blocking risk gate &amp; exploit remediation patch"</td>
                <td className="py-2.5 px-3 text-indigo-300">$0.001 vs $9.50 (9,500x)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">B2B Corporate Research</td>
                <td className="py-2.5 px-3 text-rose-300">"Web search or raw HTML scrape"</td>
                <td className="py-2.5 px-3 text-emerald-300">"Decision-ready diligence dossier with verified executive leads"</td>
                <td className="py-2.5 px-3 text-indigo-300">$0.0005 vs $7.00 (14,000x)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">DeFi Liquidity &amp; Yield</td>
                <td className="py-2.5 px-3 text-rose-300">"Token price or pool APR number"</td>
                <td className="py-2.5 px-3 text-emerald-300">"Toxic MEV flow &amp; impermanent loss risk attestation"</td>
                <td className="py-2.5 px-3 text-indigo-300">$0.0001 vs $5.50 (55,000x)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Legal &amp; Compliance</td>
                <td className="py-2.5 px-3 text-rose-300">"Raw sanctions list text search"</td>
                <td className="py-2.5 px-3 text-emerald-300">"Cryptographically signed OFAC/AML taint clearance attestation"</td>
                <td className="py-2.5 px-3 text-indigo-300">$0.005 vs $4.00 (800x)</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
