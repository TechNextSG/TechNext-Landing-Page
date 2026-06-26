/**
 * Vercel Serverless Function — GET /api/availability?date=YYYY-MM-DD
 *
 * Returns the booked time slots (24-h, SGT) for a given SGT calendar date
 * by querying calendar.event records in Odoo.
 *
 * Response: { ok: true, date: "YYYY-MM-DD", bookedSlots: ["09:00","14:00"] }
 *
 * Fails open — if Odoo is unreachable, bookedSlots is [] so the calendar
 * still works (user might hit a double-booking, but UI never freezes).
 */

const ODOO_API_KEY  = process.env.ODOO_API_KEY || '';
const ODOO_HOST     = 'https://technext.odoo.com';
const ODOO_DB       = 'technext';
const ODOO_USER     = 'hello@technext.asia';
const APPT_TYPE_ID  = 2; // "Initial Demo"

/* ── XML-RPC helpers (same as book.js) ────────────────────── */

function xmlEsc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function encVal(v) {
  if (v === null || v === undefined) return '<value><boolean>0</boolean></value>';
  if (typeof v === 'boolean')        return `<value><boolean>${v ? 1 : 0}</boolean></value>`;
  if (Number.isInteger(v))           return `<value><int>${v}</int></value>`;
  if (typeof v === 'number')         return `<value><double>${v}</double></value>`;
  if (typeof v === 'string')         return `<value><string>${xmlEsc(v)}</string></value>`;
  if (Array.isArray(v))              return `<value><array><data>${v.map(encVal).join('')}</data></array></value>`;
  if (typeof v === 'object') {
    const m = Object.entries(v)
      .map(([k, val]) => `<member><name>${xmlEsc(k)}</name>${encVal(val)}</member>`)
      .join('');
    return `<value><struct>${m}</struct></value>`;
  }
  return `<value><string>${xmlEsc(String(v))}</string></value>`;
}

function buildXml(method, args) {
  const params = args.map(a => `<param>${encVal(a)}</param>`).join('');
  return `<?xml version="1.0" encoding="utf-8"?>`
    + `<methodCall><methodName>${method}</methodName>`
    + `<params>${params}</params></methodCall>`;
}

function extractBalanced(xml, open, close, fromIdx = 0) {
  const out = [];
  let pos = fromIdx;
  while (pos < xml.length) {
    const s = xml.indexOf(open, pos);
    if (s === -1) break;
    let depth = 1, i = s + open.length;
    while (i < xml.length && depth > 0) {
      const o = xml.indexOf(open,  i);
      const c = xml.indexOf(close, i);
      if (c === -1) { depth = -1; break; }
      if (o !== -1 && o < c) { depth++; i = o + open.length; }
      else                   { depth--; i = c + close.length; }
    }
    if (depth !== 0) break;
    out.push({ inner: xml.slice(s + open.length, i - close.length), end: i });
    pos = i;
  }
  return out;
}

function parseVal(s) {
  s = s.trim();
  let m;
  if ((m = s.match(/^<(?:int|i4)>(-?\d+)<\/(?:int|i4)>$/)))  return parseInt(m[1]);
  if ((m = s.match(/^<boolean>([01])<\/boolean>$/)))           return m[1] === '1';
  if ((m = s.match(/^<double>([\s\S]+?)<\/double>$/)))         return parseFloat(m[1]);
  if ((m = s.match(/^<string>([\s\S]*?)<\/string>$/)))         return m[1];
  if (s.startsWith('<array>')) {
    const dm = s.match(/<data>([\s\S]*)<\/data>/);
    if (!dm) return [];
    return extractBalanced(dm[1], '<value>', '</value>').map(r => parseVal(r.inner.trim()));
  }
  if (s.startsWith('<struct>')) {
    const obj = {};
    for (const mem of extractBalanced(s, '<member>', '</member>')) {
      const nm = mem.inner.match(/<name>([\s\S]*?)<\/name>/);
      const vs = extractBalanced(mem.inner, '<value>', '</value>');
      if (nm && vs.length) obj[nm[1]] = parseVal(vs[0].inner.trim());
    }
    return obj;
  }
  return s;
}

function parseXmlRpc(xml) {
  if (xml.includes('<fault>')) {
    const msg = xml.match(/<string>([\s\S]*?)<\/string>/)?.[1] || 'XML-RPC fault';
    throw new Error(msg.slice(0, 400));
  }
  const vs = extractBalanced(xml, '<value>', '</value>');
  if (!vs.length) throw new Error('Empty XML-RPC response');
  return parseVal(vs[0].inner.trim());
}

async function xmlrpc(path, method, args) {
  const res = await fetch(`${ODOO_HOST}${path}`, {
    method : 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    body   : buildXml(method, args),
    signal : AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseXmlRpc(await res.text());
}

/* ── handler ───────────────────────────────────────────────── */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ ok: false });

  const date = req.query.date; // YYYY-MM-DD (SGT)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || ''))
    return res.status(400).json({ ok: false, error: 'date must be YYYY-MM-DD' });

  // Cache availability for 60 s (short enough to feel live, long enough to avoid hammering Odoo)
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

  // Convert SGT day to UTC window
  const [y, mo, d] = date.split('-').map(Number);
  const sgtStartMs = Date.UTC(y, mo - 1, d, 0, 0, 0) - 8 * 3600 * 1000;
  const sgtEndMs   = sgtStartMs + 24 * 3600 * 1000;
  const fmt = ms   => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');

  try {
    const uid = await xmlrpc('/xmlrpc/2/common', 'authenticate',
      [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
    if (!uid) throw new Error('Auth failed');

    const events = await xmlrpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'calendar.event', 'search_read',
      [[
        ['start', '>=', fmt(sgtStartMs)],
        ['start', '<',  fmt(sgtEndMs)],
        ['appointment_type_id', '=', APPT_TYPE_ID],
      ]],
      { fields: ['id', 'start'], limit: 50 },
    ]);

    // Convert UTC start → SGT HH:MM
    const bookedSlots = (Array.isArray(events) ? events : []).map(ev => {
      const utcMs = new Date(ev.start.replace(' ', 'T') + 'Z').getTime();
      const sgt   = new Date(utcMs + 8 * 3600 * 1000);
      return String(sgt.getUTCHours()).padStart(2, '0')
           + ':' + String(sgt.getUTCMinutes()).padStart(2, '0');
    });

    console.log(`[availability] ${date} bookedSlots=${JSON.stringify(bookedSlots)}`);
    return res.status(200).json({ ok: true, date, bookedSlots });

  } catch (err) {
    console.error('[availability] failed:', err.message);
    // Fail open — show all slots available so calendar still works
    return res.status(200).json({ ok: true, date, bookedSlots: [] });
  }
};
