/**
 * Complete project file bundler for offline distribution.
 * Packages all actual source code, tests, schemas, and reports into a genuine ZIP Blob
 * directly in browser memory using Vite ?raw imports.
 * Completely immune to proxy cookie checks and offline drops.
 */

import { createZipArchive, triggerDownload, ZipFileInput } from './zipGenerator';

// Use Vite's native ?raw loader to bundle the exact, live repository files
import reportMd from '../../REPORT.md?raw';
import finalEvidenceMd from '../../FINAL_EVIDENCE_REPORT.md?raw';
import serverTs from '../../server.ts?raw';
import testSuiteTs from '../../test-suite.ts?raw';
import facilitatorTs from '../services/x402Facilitator.ts?raw';
import serverCoreTs from '../services/x402ServerCore.ts?raw';
import sentinelShieldCoreTs from '../services/sentinelShieldCore.ts?raw';
import baseRpcTs from '../services/baseRpc.ts?raw';
import x402SimulatorTs from '../services/x402Simulator.ts?raw';
import typesTs from '../types/x402.ts?raw';
import empiricalDataTs from '../data/empiricalData.ts?raw';
import packageJson from '../../package.json?raw';
import metadataJson from '../../metadata.json?raw';
import tsconfigJson from '../../tsconfig.json?raw';
import viteConfigTs from '../../vite.config.ts?raw';

export function generateFullProjectZip(): Blob {
  const files: ZipFileInput[] = [
    { path: 'REPORT.md', content: reportMd },
    { path: 'FINAL_EVIDENCE_REPORT.md', content: finalEvidenceMd },
    { path: 'package.json', content: packageJson },
    { path: 'metadata.json', content: metadataJson },
    { path: 'server.ts', content: serverTs },
    { path: 'test-suite.ts', content: testSuiteTs },
    { path: 'tsconfig.json', content: tsconfigJson },
    { path: 'vite.config.ts', content: viteConfigTs },
    { path: 'src/types/x402.ts', content: typesTs },
    { path: 'src/data/empiricalData.ts', content: empiricalDataTs },
    { path: 'src/services/x402Facilitator.ts', content: facilitatorTs },
    { path: 'src/services/x402ServerCore.ts', content: serverCoreTs },
    { path: 'src/services/sentinelShieldCore.ts', content: sentinelShieldCoreTs },
    { path: 'src/services/baseRpc.ts', content: baseRpcTs },
    { path: 'src/services/x402Simulator.ts', content: x402SimulatorTs }
  ];

  return createZipArchive(files);
}

export function downloadProjectZip(): void {
  const blob = generateFullProjectZip();
  triggerDownload(blob, 'x402-autonomous-profit-experiment.zip');
}
