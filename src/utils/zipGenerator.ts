/**
 * Pure client-side zero-dependency ZIP archive generator.
 * Creates genuine PKZIP 2.0 archives directly in browser memory.
 * Bypasses all server proxies, CDN caches, and cookie-check challenges.
 */

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
  path: string;
  content: string | Uint8Array;
}

export function createZipArchive(files: ZipFileInput[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    pathBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  let currentOffset = 0;
  const parts: Uint8Array[] = [];

  for (const file of files) {
    const pathBytes = encoder.encode(file.path.replace(/^\/+/, ''));
    const dataBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const fileCrc = crc32(dataBytes);

    // Local file header (30 bytes + filename + data)
    const header = new Uint8Array(30 + pathBytes.length);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method: 0 (Stored / no compression)
    view.setUint16(10, 0x4a21, true);    // Last mod file time (approx)
    view.setUint16(12, 0x5545, true);    // Last mod file date (approx)
    view.setUint32(14, fileCrc, true);   // CRC-32
    view.setUint32(18, dataBytes.length, true); // Compressed size
    view.setUint32(22, dataBytes.length, true); // Uncompressed size
    view.setUint16(26, pathBytes.length, true); // File name length
    view.setUint16(28, 0, true);         // Extra field length

    header.set(pathBytes, 30);

    parts.push(header);
    parts.push(dataBytes);

    fileRecords.push({
      pathBytes,
      dataBytes,
      crc: fileCrc,
      offset: currentOffset
    });

    currentOffset += header.length + dataBytes.length;
  }

  // Central directory
  const centralDirStart = currentOffset;
  let centralDirSize = 0;

  for (const rec of fileRecords) {
    // Central directory file header (46 bytes + filename)
    const cdHeader = new Uint8Array(46 + rec.pathBytes.length);
    const cdView = new DataView(cdHeader.buffer);

    cdView.setUint32(0, 0x02014b50, true); // Central directory signature
    cdView.setUint16(4, 20, true);         // Version made by
    cdView.setUint16(6, 20, true);         // Version needed to extract
    cdView.setUint16(8, 0, true);          // General purpose bit flag
    cdView.setUint16(10, 0, true);         // Compression method (0 = stored)
    cdView.setUint16(12, 0x4a21, true);    // Last mod file time
    cdView.setUint16(14, 0x5545, true);    // Last mod file date
    cdView.setUint32(16, rec.crc, true);   // CRC-32
    cdView.setUint32(20, rec.dataBytes.length, true); // Compressed size
    cdView.setUint32(24, rec.dataBytes.length, true); // Uncompressed size
    cdView.setUint16(28, rec.pathBytes.length, true); // File name length
    cdView.setUint16(30, 0, true);         // Extra field length
    cdView.setUint16(32, 0, true);         // File comment length
    cdView.setUint16(34, 0, true);         // Disk number start
    cdView.setUint16(36, 0, true);         // Internal file attributes
    cdView.setUint32(38, 0, true);         // External file attributes
    cdView.setUint32(42, rec.offset, true);// Relative offset of local header

    cdHeader.set(rec.pathBytes, 46);
    parts.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // End of central dir signature
  eocdView.setUint16(4, 0, true);          // Number of this disk
  eocdView.setUint16(6, 0, true);          // Disk where central directory starts
  eocdView.setUint16(8, fileRecords.length, true);  // Number of central directory records on this disk
  eocdView.setUint16(10, fileRecords.length, true); // Total number of central directory records
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, centralDirStart, true);    // Offset of start of central directory
  eocdView.setUint16(20, 0, true);         // ZIP comment length

  parts.push(eocd);

  return new Blob(parts as BlobPart[], { type: 'application/zip' });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
