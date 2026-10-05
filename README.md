# SentinelShield

Pre-transaction security gate for autonomous AI agents.

Check any smart contract before your agent approves, transfers, swaps, or signs a transaction.

## Endpoints

| Endpoint | Price | Description |
|---|---|---|
| `POST /api/contract-audit` | $0.005 | Basic existence + bytecode check |
| `POST /api/contract-risk` | $0.02 | Risk triage with findings |
| `POST /api/contract-deep-audit` | $0.10 | Deep analysis + proxy/delegatecall detection |
| `POST /api/contract-full-audit` | $0.50 | Full report + SARIF |

## Payment

x402 v2 protocol. USDC on Base, Arbitrum, Polygon, Avalanche, Solana.

No API key. No account. Pay per call.

## Quick Start

```bash
# Check if a contract is safe (unpaid = 402)
curl -X POST https://sentinelshield.vitakyrpisit.workers.dev/api/contract-audit \
  -H "Content-Type: application/json" \
  -d '{"chain":"base","contractAddress":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"}'

# Response: 402 Payment Required with payment requirements
# Pay via x402 client, then retry with PAYMENT-SIGNATURE header
```

## Integration Example (Agent)

```javascript
// Before your agent approves/swaps/transfers, check the contract:
const response = await fetch('https://sentinelshield.vitakyrpisit.workers.dev/api/contract-audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chain: 'base', contractAddress: targetAddress })
});

if (response.status === 402) {
  // Parse payment requirements
  const requirements = await response.json();
  // Sign EIP-3009 payment, retry with PAYMENT-SIGNATURE header
  // After payment: get risk analysis result
  const result = await response.json();
  if (result.outcome.riskLevel === 'CRITICAL' || result.outcome.riskLevel === 'HIGH') {
    // STOP — do not interact with this contract
    return { safe: false, risk: result.outcome };
  }
  // SAFE to proceed
  return { safe: true, risk: result.outcome };
}
```

## Discovery

- `GET /` — landing page
- `GET /health` — free health check
- `GET /openapi.json` — OpenAPI 3.0 spec
- `GET /llms.txt` — LLM-readable docs
- `GET /.well-known/x402` — x402 discovery manifest

## Operator Payout

- EVM (Base/Arbitrum/Polygon/Avalanche): `0x829f877daAb94D766BB2b8511ad486C40f2C2BDA`
- Solana: `EyTxSdVtku7QtbwgntLvUwyxMvraJyAxoPoZ8ALdG6qL`
