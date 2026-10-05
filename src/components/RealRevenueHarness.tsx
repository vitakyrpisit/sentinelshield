import React, { useState, useEffect } from 'react';
import { runAllTests, TestResultItem } from '../../test-suite';
import { PRODUCTION_PAY_TO, SENTINEL_PRICE_USDC, BASE_USDC_MAINNET } from '../services/x402ServerCore';
import { OnChainWalletStatus, fetchLiveOnChainStatus } from '../services/baseRpc';
import { 
  ShieldAlert, 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Download, 
  FileText, 
  ExternalLink,
  Layers,
  AlertTriangle
} from 'lucide-react';

export const RealRevenueHarness: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [suitePassed, setSuitePassed] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<OnChainWalletStatus | null>(null);
  const [scanning, setScanning] = useState(false);
  
  // Real tx verification input
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const executeTestSuite = async () => {
    setTesting(true);
    try {
      const { passed, results } = await runAllTests();
      setTestResults(results);
      setSuitePassed(passed);
    } catch (err) {
      console.error('Test suite error:', err);
    } finally {
      setTesting(false);
    }
  };

  const refreshLiveBalance = async () => {
    setScanning(true);
    try {
      const res = await fetchLiveOnChainStatus(PRODUCTION_PAY_TO, 'base-mainnet');
      setWalletStatus(res);
    } catch (err) {
      console.error('Balance query error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleVerifyTx = async () => {
    if (!verifyHash.startsWith('0x') || verifyHash.length !== 66) {
      alert('Please enter a full 66-character transaction hash starting with 0x.');
      return;
    }
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/verify/tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: verifyHash, network: 'base-mainnet' })
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err: any) {
      setVerifyResult({ error: err?.message || 'Verification failed' });
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    executeTestSuite();
    refreshLiveBalance();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Mission Directive & Zero-Illusion Warning */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/50 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Real Revenue Mission · Zero Substitution Rule</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Production SentinelShield Revenue Engine (Base Mainnet)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Target: <strong>1 real external independent payment of $9.50 USDC</strong> to receive-only payout address <code className="text-indigo-300 font-mono">{PRODUCTION_PAY_TO}</code>. No mock signatures, no synthetic hashes, no self-funding.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-right min-w-[200px]">
            <div className="text-[11px] text-slate-400 font-mono">Current Economic State</div>
            <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
              STATE A — NOT PROVEN
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Revenue: $0.00 USDC | Profit: $0.00
            </div>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block mb-1">Receive-Only Payout Address</span>
            <div className="text-xs font-bold text-indigo-300 truncate">{PRODUCTION_PAY_TO}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Private key: NOT REQUIRED</span>
              <a
                href={`https://basescan.org/address/${PRODUCTION_PAY_TO}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                BaseScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block mb-1">Base Mainnet Balance</span>
            <div className="text-sm font-bold text-white">
              {walletStatus ? `${walletStatus.usdcBalance} USDC` : 'Querying...'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Verified Inbound Txs: {walletStatus?.recentTransfers.length || 0}</span>
              <button onClick={refreshLiveBalance} disabled={scanning} className="text-indigo-400 hover:underline">
                Refresh
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block mb-1">SentinelShield Outcome Price</span>
            <div className="text-sm font-bold text-emerald-400">$9.50 USDC</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Atomic: 9500000 units on contract 0x8335...2913
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: 10-TEST AUTOMATED SUITE RUNNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" />
              <span>Automated Verification Suite (Tests 1–10)</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Production Specification &amp; Security Validation Matrix
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
              suitePassed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {suitePassed ? '✓ 10/10 TESTS PASS' : 'RUNNING CHECKS'}
            </span>
            <button
              onClick={executeTestSuite}
              disabled={testing}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Re-run Suite
            </button>
          </div>
        </div>

        {/* Tests Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg text-xs font-mono">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Test Requirement</th>
                <th className="py-2.5 px-3">Expected Behavior</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {testResults.map((t) => (
                <tr key={t.testNumber} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 font-bold">{t.testNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{t.name}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{t.expected}</td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate max-w-xs">{t.received}</td>
                  <td className="py-2.5 px-3">
                    {t.status === 'PASS' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: LIVE PRODUCTION ENDPOINTS & DISCOVERY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live HTTP Resource Endpoints
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-emerald-400 font-bold">GET /health</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">Free (HTTP 200)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mb-1.5">Zero payment challenge. Used for uptime monitoring and agent readiness checks.</p>
              <pre className="p-2 rounded bg-slate-900 text-slate-300 text-[10px]">
                {`curl -s https://SERVICE/health`}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-indigo-400 font-bold">POST /sentinelshield</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">x402 Protected ($9.50 USDC)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mb-1.5">Unpaid request triggers HTTP 402 with Exact EVM EIP-712 payment requirements.</p>
              <pre className="p-2 rounded bg-slate-900 text-slate-300 text-[10px]">
                {`curl -i -X POST https://SERVICE/sentinelshield \\
  -H "Content-Type: application/json" \\
  -d '{"chain":"base","contractAddress":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"}'`}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-purple-400 font-bold">GET /.well-known/x402-manifest.json</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">Discovery Standard</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mb-1.5">Machine-readable OpenAPI + x402 metadata for autonomous agent discovery.</p>
            </div>
          </div>
        </div>

        {/* SECTION: REAL ON-CHAIN TRANSACTION VERIFIER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              On-Chain Transaction Verifier (Base RPC)
            </h3>
          </div>

          <p className="text-xs text-slate-400 font-sans">
            Enter any full 66-character transaction hash to verify whether it settled on Base Mainnet, confirms USDC transfer to <code className="text-indigo-300">{PRODUCTION_PAY_TO}</code>, and qualifies as independent revenue:
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value.trim())}
              placeholder="0x... (full 66-character hex hash)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleVerifyTx}
              disabled={verifyLoading}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {verifyLoading ? 'Querying Base Archive RPC...' : 'Verify Transaction via Base RPC'}
            </button>
          </div>

          {verifyResult && (
            <div className={`p-3.5 rounded-lg border text-xs font-mono ${
              verifyResult.status === 'confirmed'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-200'
            }`}>
              <div className="font-bold mb-1">
                {verifyResult.status === 'confirmed' ? '✓ CONFIRMED ON-CHAIN' : 'VERIFICATION NOTICE'}
              </div>
              <pre className="text-[10px] overflow-x-auto">
                {JSON.stringify(verifyResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-slate-300 block mb-0.5 font-sans">Hard Stop Rule:</strong>
            No payment is counted as external revenue until confirmed via Base JSON-RPC archive node with transfer to {PRODUCTION_PAY_TO}.
          </div>
        </div>

      </div>

    </div>
  );
};
