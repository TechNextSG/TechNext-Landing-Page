/**
 * Vercel Serverless Function — /api/book
 *
 * Uses Odoo XML-RPC external API — the only method confirmed to work
 * with API key auth on Odoo SaaS 19.2.
 *
 * Verified credentials:
 *   host   : https://technext.odoo.com
 *   db     : technext
 *   user   : hello@technext.asia
 *   key    : process.env.ODOO_API_KEY  (uid returned = 14)
 *   appt   : "Initial Demo" id = 2  (short_code field not present in v19)
 *
 * Always returns HTTP 200 so the modal can show a result.
 */

const ODOO_API_KEY  = process.env.ODOO_API_KEY || '';
const ODOO_HOST     = 'https://technext.odoo.com';
const ODOO_DB       = 'technext';
const ODOO_USER     = 'hello@technext.asia';
const APPT_TYPE_ID  = 2;   // "Initial Demo" appointment type
const ATTENDEES     = [3];  // sky@technext.asia (Sky Nex, partner id=3) — always added

/* ── XML-RPC encoding ──────────────────────────────────────── */

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

/* ── XML-RPC response parser ───────────────────────────────── */

/** Extract all balanced <open>...</close> spans from xml starting at fromIdx */
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
      const nm  = mem.inner.match(/<name>([\s\S]*?)<\/name>/);
      const vs  = extractBalanced(mem.inner, '<value>', '</value>');
      if (nm && vs.length) obj[nm[1]] = parseVal(vs[0].inner.trim());
    }
    return obj;
  }
  return s; // bare string (no type tag)
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

/* ── time helper ───────────────────────────────────────────── */

function sgtToUtc(dateStr, time24) {
  /* SGT = UTC+8, so UTC = SGT - 8 h */
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi]    = time24.split(':').map(Number);
  const startMs    = Date.UTC(y, mo - 1, d, h, mi, 0) - 8 * 3600 * 1000;
  const fmt = ms   => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
  return { start: fmt(startMs), stop: fmt(startMs + 3600 * 1000) };
}

/* ── main handler ──────────────────────────────────────────── */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const {
    name    = '',
    email   = '',
    phone   = '',
    company = '',
    service = '',
    date    = '',      // YYYY-MM-DD (SGT)
    time12  = '',      // e.g. "9:00 AM"
    time24  = '09:00', // e.g. "09:00"
    message = '',
  } = req.body || {};

  if (!name || !email || !date)
    return res.status(400).json({ ok: false, error: 'name, email and date are required' });

  const { start, stop } = sgtToUtc(date, time24);

  const description = [
    `Service : ${service  || '-'}`,
    `Name    : ${name}`,
    `Email   : ${email}`,
    `Phone   : ${phone    || '-'}`,
    `Company : ${company  || '-'}`,
    `Slot    : ${date} ${time12} SGT`,
    `Message : ${message  || '-'}`,
  ].join('\n');

  let booked  = false;
  let eventId = null;

  try {
    /* 1. Authenticate — get uid */
    const uid = await xmlrpc('/xmlrpc/2/common', 'authenticate',
      [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
    if (!uid) throw new Error('Auth returned falsy uid — check ODOO_API_KEY env var');
    console.log(`[book] auth ok uid=${uid}`);

    /* 2. Create calendar.event linked to "Initial Demo" appointment type (id=2) */
    const result = await xmlrpc('/xmlrpc/2/object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'calendar.event', 'create',
      [[{
        name                : `TechNext Demo - ${name}`,
        start,
        stop,
        appointment_type_id : APPT_TYPE_ID,
        description,
        partner_ids         : ATTENDEES.map(id => [4, id, false]),
      }]],
      {},
    ]);

    // Odoo create returns [id] (array) via XML-RPC
    eventId = Array.isArray(result) ? result[0] : result;
    if (eventId) {
      booked = true;
      console.log(`[book] created event id=${eventId}`);
    }
  } catch (err) {
    console.error('[book] failed:', err.message);
  }

  return res.status(200).json({ ok: true, booked, id: eventId });
};
