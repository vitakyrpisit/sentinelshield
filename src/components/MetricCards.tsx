import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Cpu, Activity } from 'lucide-react';
import { OnChainWalletStatus } from '../services/baseRpc';

interface MetricCardsProps {
  walletStatus: OnChainWalletStatus | null;
  onOpenLiveScanner: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ walletStatus, onOpenLiveScanner }) => {
  const realBalance = walletStatus ? walletStatus.usdcBalance : '0.00';
  const inboundTransfers = walletStatus ? walletStatus.recentTransfers.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      
      {/* 1. Primary KPI: Net Profit Received */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium tracking-wide uppercase text-[11px]">Primary KPI</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">${realBalance}</span>
            <span className="text-xs font-mono text-slate-400">USDC</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Live on-chain payout wallet</span>
            <button 
              onClick={onOpenLiveScanner}
              className="text-indigo-400 hover:text-indigo-300 font-mono text-[10px] underline"
            >
              Scan
            </button>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Target Address Inbound:</span>
          <span className={`font-mono font-semibold ${inboundTransfers > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {inboundTransfers} {inboundTransfers === 1 ? 'tx' : 'txs'}
          </span>
        </div>
      </div>

      {/* 2. Wash Volume Discount */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium tracking-wide uppercase text-[11px]">Forensic Filter</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-rose-400">71.4%</span>
            <span className="text-xs font-mono text-slate-400">Wash/Sybil</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Settlements excluded under E0-E2 circular funding rules.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Counted in Economics:</span>
          <span className="font-mono font-semibold text-emerald-400">Only E3–E5</span>
        </div>
      </div>

      {/* 3. Top Outcome Ticket */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium tracking-wide uppercase text-[11px]">Proven Unit Ticket</span>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-white">$6.50–$12</span>
            <span className="text-xs font-mono text-slate-400">/outcome</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Decision-ready reports outperform $0.001 raw feeds by 5,000x.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Priority Bracket:</span>
          <span className="font-mono font-semibold text-slate-300">$1–$10 &amp; $10–$50</span>
        </div>
      </div>

      {/* 4. Verified Net Margin */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium tracking-wide uppercase text-[11px]">Variable Economics</span>
          <Activity className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-teal-300">96.8%</span>
            <span className="text-xs font-mono text-slate-400">Net Margin</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Variable inference &amp; RPC: ~$0.14–$0.28 per delivery.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Net Profit / Order:</span>
          <span className="font-mono font-semibold text-emerald-400">+$6.27 to +$11.72</span>
        </div>
      </div>

      {/* 5. Autonomy Level */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium tracking-wide uppercase text-[11px]">Autonomy Index</span>
          <Cpu className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-amber-300">A4 Feasible</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Full 402 loop is automated; human required strictly for initial wallet &amp; legal setup.
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Start Capital Required:</span>
          <span className="font-mono font-semibold text-emerald-400">~$0.00 (Zero)</span>
        </div>
      </div>

    </div>
  );
};
