import React, { useState, useEffect } from 'react';
import { OnChainWalletStatus, fetchLiveOnChainStatus } from '../services/baseRpc';
import { OFFICIAL_PAYOUT_ADDRESS, BASE_USDC_MAINNET_ADDRESS, BASE_USDC_SEPOLIA_ADDRESS } from '../data/empiricalData';
import { RefreshCw, ExternalLink, CheckCircle2, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

interface LiveOnChainTrackerProps {
  network: 'base-mainnet' | 'base-sepolia';
  onStatusUpdated?: (status: OnChainWalletStatus) => void;
}

export const LiveOnChainTracker: React.FC<LiveOnChainTrackerProps> = ({ network, onStatusUpdated }) => {
  const [status, setStatus] = useState<OnChainWalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const res = await fetchLiveOnChainStatus(OFFICIAL_PAYOUT_ADDRESS, network);
      setStatus(res);
      setLastRefreshed(new Date().toLocaleTimeString());
      if (onStatusUpdated) {
        onStatusUpdated(res);
      }
    } catch (e) {
      console.error('Error fetching on-chain status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [network]);

  const usdcAddress = network === 'base-mainnet' ? BASE_USDC_MAINNET_ADDRESS : BASE_USDC_SEPOLIA_ADDRESS;
  const explorerUrl = `https://${network === 'base-sepolia' ? 'sepolia.' : ''}basescan.org`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-mono text-indigo-400 font-semibold uppercase tracking-wider">Base RPC Node Query</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">Section 9 &amp; 10 Verification</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Live On-Chain Payout Wallet Verifier
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {network}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-400 font-mono">
              Refreshed: {lastRefreshed}
            </span>
          )}
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Query RPC
          </button>
        </div>
      </div>

      {/* Target Address Card & Safety Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
        
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Receive-Only Target Address</div>
          <div className="font-mono text-xs text-indigo-300 font-semibold break-all">
            {OFFICIAL_PAYOUT_ADDRESS}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Receive-only. Operator private keys &amp; seeds strictly protected.</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">USDC ERC-20 Contract</div>
          <div className="font-mono text-xs text-slate-300 font-medium break-all">
            {usdcAddress}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Decimals: 6</span>
            <a
              href={`${explorerUrl}/token/${usdcAddress}?a=${OFFICIAL_PAYOUT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-[11px]"
            >
              BaseScan Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Latest Block &amp; Latency</div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-white">
              #{status ? status.blockNumber.toLocaleString() : 'Connecting...'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Direct JSON-RPC via eth_call &amp; eth_getLogs</span>
          </div>
        </div>

      </div>

      {/* Live Balances Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        
        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>USDC Settlement Balance</span>
            <span className="font-mono text-[10px] text-emerald-400">ERC-20</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">
              {status ? status.usdcBalance : '0.00'}
            </span>
            <span className="text-sm font-mono text-indigo-400">USDC</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {Number(status?.usdcBalance || 0) > 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed on-chain balance received!
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Awaiting initial external buyer settlement transfer.
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Native Base Gas Balance</span>
            <span className="font-mono text-[10px] text-slate-400">ETH</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-slate-200">
              {status ? status.ethBalance : '0.000000'}
            </span>
            <span className="text-sm font-mono text-slate-400">ETH</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>
              Receive-only payout account does not require ETH gas (facilitators sponsor gas under ERC-3009).
            </span>
          </div>
        </div>

      </div>

      {/* Target Address Event Logs Table */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            On-Chain Inbound Transfers to Payout Address
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {status?.recentTransfers.length || 0} transfers in block window
          </span>
        </div>

        {status && status.recentTransfers.length > 0 ? (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Tx Hash</th>
                  <th className="py-2.5 px-3">From (Payer)</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Block</th>
                  <th className="py-2.5 px-3">External Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {status.recentTransfers.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-indigo-400">
                      <a
                        href={`${explorerUrl}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                    </td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">
                      +{tx.amountUSDC.toFixed(2)} USDC
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      #{tx.blockNumber}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-400 text-[11px] font-sans">
                        ✓ On-Chain Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/60 text-center">
            <p className="text-xs text-slate-400">
              No inbound USDC transfers detected on-chain for <code className="text-indigo-300">{OFFICIAL_PAYOUT_ADDRESS}</code> yet in the queried block span.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Status for KPI #1 (First Real External Payment): <span className="text-amber-400 font-semibold">Awaiting 1st Payment</span>. Use the test harness below to execute testnet authorizations or deploy the production agent endpoint.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
