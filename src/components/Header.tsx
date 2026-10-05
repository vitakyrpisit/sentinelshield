import React, { useState } from 'react';
import { OFFICIAL_PAYOUT_ADDRESS } from '../data/empiricalData';
import { Check, Copy, ExternalLink, ShieldCheck, Download, Terminal } from 'lucide-react';
import { downloadProjectZip } from '../utils/exportBundle';

interface HeaderProps {
  activeNetwork: 'base-mainnet' | 'base-sepolia';
  onNetworkChange: (network: 'base-mainnet' | 'base-sepolia') => void;
  onExportReport: () => void;
  onOpenTestHarness: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNetwork,
  onNetworkChange,
  onExportReport,
  onOpenTestHarness
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OFFICIAL_PAYOUT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
              402
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">X402 EXPERIMENT</span>
                <span aria-hidden="true">·</span>
                <span>Base L2 USDC Standard</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Audit
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Autonomous Profit Experiment & Empirical Workbench
              </h1>
            </div>
          </div>

          {/* Target Address & Network Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Payout Address Box */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Payout (Receive-Only):</span>
              <span className="font-mono text-indigo-300 font-medium">
                {OFFICIAL_PAYOUT_ADDRESS.slice(0, 6)}...{OFFICIAL_PAYOUT_ADDRESS.slice(-4)}
              </span>
              <button
                onClick={handleCopy}
                title="Copy full receive-only payout address"
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`https://${activeNetwork === 'base-sepolia' ? 'sepolia.' : ''}basescan.org/address/${OFFICIAL_PAYOUT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                title="View on BaseScan"
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Network Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
              <button
                onClick={() => onNetworkChange('base-mainnet')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeNetwork === 'base-mainnet'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Base Mainnet
              </button>
              <button
                onClick={() => onNetworkChange('base-sepolia')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeNetwork === 'base-sepolia'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Base Sepolia
              </button>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => downloadProjectZip()}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-600 hover:bg-amber-500 text-white font-mono transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download complete project code and report archive (.zip)"
            >
              <Download className="w-3.5 h-3.5" />
              Архив (.ZIP)
            </button>

            <button
              onClick={onOpenTestHarness}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Run 402 Test
            </button>

            <button
              onClick={onExportReport}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Отчет (.MD)
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
