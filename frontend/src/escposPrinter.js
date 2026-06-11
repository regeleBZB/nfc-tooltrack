

const VENDOR_ID  = 0x0416;
const PRODUCT_ID = 0x5011;

const PAPER_WIDTH = 32;         
const CHUNK_SIZE  = 64;          


class EscPos {
  constructor() { this.bytes = []; }

  _push(...b) { for (const x of b) this.bytes.push(x & 0xff); return this; }

  init()        { return this._push(0x1b, 0x40); }                 // ESC @
  align(a)      { const n = a === 'center' ? 1 : a === 'right' ? 2 : 0;
                  return this._push(0x1b, 0x61, n); }               // ESC a n
  bold(on)      { return this._push(0x1b, 0x45, on ? 1 : 0); }      // ESC E n
  feed(n)       { return this._push(0x1b, 0x64, n); }              // ESC d n
  cut()         { return this._push(0x1d, 0x56, 0x00); }           // GS V 0 (full)

  text(s) {
    const clean = toAscii(s);
    for (let i = 0; i < clean.length; i++) this.bytes.push(clean.charCodeAt(i) & 0xff);
    return this;
  }
  line(s = '')  { return this.text(s)._push(0x0a); }                // text + LF

  done() { return new Uint8Array(this.bytes); }
}

function toAscii(s) {
  if (s == null) return '';
  return String(s)
    .replace(/[\u2014\u2013]/g, '-')   // em / en dash → hyphen
    .replace(/\u20b1/g, 'P')           // ₱ → P
    .replace(/[\u201c\u201d]/g, '"')   // curly double quotes
    .replace(/[\u2018\u2019]/g, "'")   // curly single quotes
    .replace(/[^\x20-\x7e]/g, '');     // strip anything else non-ASCII
}

function fmtDateTime(iso) {
  const d = iso ? new Date(iso) : new Date();
  const p = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

function resolveStudentName(tx) {
  if (tx.student && tx.student.name) return tx.student.name;
  if (tx.borrowerName) return tx.borrowerName;
  return 'Walk-in';
}

// Mirrors PrinterService.writeReceipt(EscPos, Transaction).
export function buildReceiptBytes(tx) {
  const p    = new EscPos();
  const EQ   = '='.repeat(PAPER_WIDTH);
  const DASH = '-'.repeat(PAPER_WIDTH);
  const { date, time } = fmtDateTime(tx.transactedAt);
  const type    = String(tx.type || '').toUpperCase();
  const student = resolveStudentName(tx);
  const items   = tx.items || [];

  p.init();

  p.align('center')
    .line(EQ)
    .line('AMT LAB - TOOL TRACKER')
    .line(EQ)
    .line('');

  p.align('left');
  p.bold(true).line('Receipt : ' + (tx.receiptNumber ?? '')).bold(false);
  p.line('Type    : ' + type);
  p.line('Student : ' + student);
  p.line('Date    : ' + date);
  p.line('Time    : ' + time);
  p.line(DASH);

  for (const item of items) {
    const tool  = item.tool || {};
    const price = item.priceSnapshot != null
      ? ` (P${Number(item.priceSnapshot).toFixed(2)})`
      : '';
    p.line('  ' + (tool.name || 'Unknown') + price);
    p.line('  Code: ' + (tool.toolCode || ''));
  }

  p.line(DASH);
  p.line('Total items: ' + items.length);

  if (type === 'BORROW') {
    p.line('');
    p.line('Please return tools after use.');
    p.line('');
    p.line('Signature: ____________________');
  }

  p.line('');
  p.align('center').line('Thank you!').line(EQ);


  p.align('left').feed(4).cut();

  return p.done();
}


function assertSupported() {
  if (typeof navigator === 'undefined' || !('usb' in navigator)) {
    throw new Error('WebUSB is not available. Open the kiosk in Chrome or Edge, served over HTTPS.');
  }
}

// Returns a previously-authorized printer without prompting, or null.
async function getAuthorizedDevice() {
  const devices = await navigator.usb.getDevices();
  return (
    devices.find((d) => d.vendorId === VENDOR_ID && d.productId === PRODUCT_ID) ||
    devices.find((d) => d.vendorId === VENDOR_ID) ||
    null
  );
}

function findBulkOut(device) {
  const config = device.configuration;
  for (const iface of config.interfaces) {
    for (const alt of iface.alternates) {
      for (const ep of alt.endpoints) {
        if (ep.direction === 'out' && ep.type === 'bulk') {
          return { interfaceNumber: iface.interfaceNumber, endpointNumber: ep.endpointNumber };
        }
      }
    }
  }
  // Fallback: POS-58 printers typically expose interface 0 / endpoint 1.
  return { interfaceNumber: 0, endpointNumber: 1 };
}

async function sendBytes(bytes) {
  assertSupported();
  if (!bytes || bytes.length === 0) return;

  const device = await getAuthorizedDevice();
  if (!device) {
    throw new Error('Printer not authorized yet. Tap "Connect printer" once to grant access.');
  }

  if (!device.opened) await device.open();
  if (device.configuration === null) {
    await device.selectConfiguration(device.configurations[0].configurationValue);
  }

  const { interfaceNumber, endpointNumber } = findBulkOut(device);
  await device.claimInterface(interfaceNumber);

  try {
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const slice  = bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, bytes.length));
      const result = await device.transferOut(endpointNumber, slice);
      if (result.status !== 'ok') {
        throw new Error('USB bulk transfer failed: ' + result.status);
      }
    }
  } finally {
    try { await device.releaseInterface(interfaceNumber); } catch (_) { /* ignore */ }
  }
}


export async function isPrinterConnected() {
  if (typeof navigator === 'undefined' || !('usb' in navigator)) return false;
  return !!(await getAuthorizedDevice());
}


export async function connectPrinter() {
  assertSupported();
  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: VENDOR_ID }],   // broad: tolerate units with a different PID
  });
  if (!device.opened) await device.open();   // confirm it opens
  return {
    name: device.productName || 'USB Thermal Printer',
    vendorId: device.vendorId,
    productId: device.productId,
  };
}

export async function printReceipt(tx) {
  await sendBytes(buildReceiptBytes(tx));
}


export async function printTest() {
  const p = new EscPos();
  p.init()
    .align('center')
    .bold(true).line('PRINTER OK').bold(false)
    .line('AMT LAB - TOOL TRACKER')
    .feed(4);
  await sendBytes(p.done());
}