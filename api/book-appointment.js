/**
 * POST /api/book-appointment
 * Body: { name, email, phone, company, service, slotISO, slotTime24, message }
 *
 * 1. Authenticates with Odoo
 * 2. Finds or creates res.partner
 * 3. Creates calendar.event (appointment)
 * 4. Sends confirmation email to client + internal notification via Brevo
 */

const pad = n => String(n).padStart(2, '0');

function slotDisplay(slotISO, slotTime24) {
  const [yr, mo, dy] = slotISO.split('-').map(Number);
  const [hh, mm]     = slotTime24.split(':').map(Number);
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dow  = new Date(Date.UTC(yr, mo - 1, dy)).getUTCDay();
  const h12  = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  return `${DAYS[dow]}, ${MONTHS[mo - 1]} ${dy}, ${yr} · ${h12}:${pad(mm)} ${ampm} SGT`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, company, service, slotISO, slotTime24, message } = req.body || {};
  if (!email)      return res.status(400).json({ error: 'email is required' });
  if (!slotISO)    return res.status(400).json({ error: 'slotISO is required' });
  if (!slotTime24) return res.status(400).json({ error: 'slotTime24 is required' });

  const ODOO_URL     = process.env.ODOO_URL;
  const ODOO_DB      = process.env.ODOO_DB;
  const ODOO_USER    = process.env.ODOO_USER;
  const ODOO_API_KEY = process.env.ODOO_API_KEY;
  const APPT_TYPE_ID = parseInt(process.env.ODOO_APPT_TYPE_ID || '2', 10);
  const BREVO_KEY    = process.env.BREVO_API_KEY;

  if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY) {
    return res.status(500).json({ error: 'Odoo environment variables not configured' });
  }

  const SERVICE_LABELS = {
    'AI Automations & Agents': 'AI Automations & Agents',
    'Odoo ERP Implementation': 'Odoo ERP Implementation',
    'Both — Full Package':     'Both — Full Package (ERP + AI)',
    odoo: 'Odoo ERP Implementation',
    ai:   'AI Automations & Agents',
    both: 'Both — Full Package (ERP + AI)',
  };
  const serviceLabel = SERVICE_LABELS[service] || service || 'Not specified';
  const slot         = slotDisplay(slotISO, slotTime24);
  const firstName    = name ? name.split(' ')[0] : 'there';

  /* ─── 1. Odoo: create calendar event ─────────────────────────── */
  try {
    // Authenticate
    const authR = await fetch(`${ODOO_URL}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: 1,
        params: { db: ODOO_DB, login: ODOO_USER, password: ODOO_API_KEY }
      })
    });
    const authData = await authR.json();
    if (!authData.result || authData.result.uid === false) {
      return res.status(401).json({ error: 'Odoo authentication failed' });
    }
    const setCookie = authR.headers.get('set-cookie') || '';
    const sessionId = (setCookie.match(/session_id=([^;,\s]+)/)?.[1])
                      || authData.result?.session_id || '';

    const rpc = (id, model, method, args, kwargs = {}) =>
      fetch(`${ODOO_URL}/web/dataset/call_kw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `session_id=${sessionId}` },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', id,
          params: { model, method, args, kwargs } })
      }).then(r => r.json());

    // Find or create res.partner
    const searchR = await rpc(2, 'res.partner', 'search_read',
      [[['email', '=', email]]], { fields: ['id', 'name'], limit: 1 });
    let partnerId;
    if (searchR.result?.length) {
      partnerId = searchR.result[0].id;
    } else {
      const cpR = await rpc(3, 'res.partner', 'create', [{
        name: name || email, email, phone: phone || '', type: 'contact'
      }]);
      if (cpR.error) throw new Error(cpR.error.data?.message || 'Partner creation failed');
      partnerId = cpR.result;
    }

    // UTC start/stop — SGT is UTC+8, 1-hour slot
    const [yr, mo, dy] = slotISO.split('-').map(Number);
    const [hh, mm]     = slotTime24.split(':').map(Number);
    const startUTC = new Date(Date.UTC(yr, mo - 1, dy, hh - 8, mm));
    const stopUTC  = new Date(startUTC.getTime() + 60 * 60 * 1000);
    const fmtUTC = d =>
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ` +
      `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;

    // Create calendar.event
    const evtR = await rpc(4, 'calendar.event', 'create', [{
      name:                `Demo — ${name || email} × TechNext`,
      start:               fmtUTC(startUTC),
      stop:                fmtUTC(stopUTC),
      appointment_type_id: APPT_TYPE_ID,
      partner_ids:         [[4, partnerId]],
      description:         `Service: ${serviceLabel}\nPhone: ${phone || '—'}\nEmail: ${email}${message ? `\nNote: ${message}` : ''}`,
      user_id:             2
    }]);
    if (evtR.error) throw new Error(evtR.error.data?.message || 'Calendar event creation failed');

  } catch (err) {
    console.error('Odoo booking error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  /* ─── 2. Emails via Brevo (fire-and-forget, non-blocking) ────── */
  if (BREVO_KEY) {
    const purple = '#2563EB'; const purpleDeep = '#4338CA'; const purpleXl = '#EFF6FF';
    const green  = '#059669'; const bg = '#F5F7FF'; const white = '#FFFFFF';
    const text   = '#1F2937'; const muted = '#6B7280'; const border = '#E5E7EB';
    const dark   = '#111827'; const f = "'Plus Jakarta Sans',Arial,sans-serif";

    const confirmHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:${bg};font-family:${f};}</style></head>
<body style="background:${bg};padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,.1);">
  <tr><td style="background:linear-gradient(135deg,${purple},${purpleDeep});padding:32px 40px 28px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,.6);text-transform:uppercase;">TechNext Asia</p>
    <p style="margin:0;font-family:'Caveat',Georgia,cursive;font-size:36px;font-weight:700;color:#fff;line-height:1.1;">Demo Confirmed ✓</p>
  </td></tr>
  <tr><td style="background:${green};padding:11px 40px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">Your slot is confirmed — see you soon, ${firstName}!</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 24px;font-size:14px;color:${muted};line-height:1.7;">Hi ${name || 'there'}, thank you for booking a free demo with TechNext Asia.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="background:${purpleXl};border:1.5px solid #DBEAFE;border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${purple};text-transform:uppercase;letter-spacing:3px;">Your Scheduled Demo</p>
        <p style="margin:0 0 6px;font-family:'Caveat',Georgia,cursive;font-size:26px;font-weight:700;color:${text};">${slot}</p>
        <p style="margin:0;font-size:12px;color:${muted};">1 hour &nbsp;·&nbsp; Singapore Time (SGT) &nbsp;·&nbsp; Video Call</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border-top:1px solid ${border};">
      ${[['Service',serviceLabel],['Name',name||'—'],['Company',company||'—']].map(([l,v])=>`
      <tr><td style="padding:10px 0;border-bottom:1px solid ${border};width:35%;font-size:11px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:1.5px;">${l}</td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${border};font-size:14px;font-weight:600;color:${text};">${v}</td></tr>`).join('')}
    </table>
    <p style="margin:0 0 28px;font-size:13px;color:${muted};line-height:1.7;">Have questions? Reply to this email or write to <a href="mailto:hello@technext.asia" style="color:${purple};font-weight:700;text-decoration:none;">hello@technext.asia</a>.</p>
    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${text};">Talk to you soon,</p>
    <p style="margin:0;font-size:13px;color:${muted};">The TechNext Asia Team</p>
  </td></tr>
  <tr><td style="background:${dark};padding:20px 40px;text-align:center;">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,.4);">TechNext Asia &nbsp;·&nbsp; hello@technext.asia &nbsp;·&nbsp; Odoo Partner</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    const notifyHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="background:${bg};padding:32px 16px;font-family:${f};">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:${white};border-radius:16px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,${purple},${purpleDeep});padding:24px 32px;">
    <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,.6);text-transform:uppercase;">TechNext Asia — Internal</p>
    <p style="margin:0;font-family:'Caveat',Georgia,cursive;font-size:28px;font-weight:700;color:#fff;">New Demo Booking 🎉</p>
  </td></tr>
  <tr><td style="background:${green};padding:11px 32px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">${slot}</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${border};">
      ${[['Name',name||'—'],['Email',`<a href="mailto:${email}" style="color:${purple};font-weight:700;text-decoration:none;">${email}</a>`],
         ['Phone',phone||'—'],['Company',company||'—'],['Service',serviceLabel],
         ...(message?[['Note',message]]:[])
        ].map(([l,v])=>`
      <tr><td style="padding:10px 0;border-bottom:1px solid ${border};width:30%;font-size:11px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:1.5px;">${l}</td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${border};font-size:14px;font-weight:600;color:${text};">${v}</td></tr>`).join('')}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:${muted};line-height:1.7;">
      Please send the video call link to <a href="mailto:${email}" style="color:${purple};font-weight:700;text-decoration:none;">${email}</a> before the session.
    </p>
  </td></tr>
  <tr><td style="background:${bg};padding:16px 32px;text-align:center;border-top:1px solid ${border};">
    <p style="margin:0;font-size:11px;color:${muted};">TechNext Asia · Internal booking notification</p>
  </td></tr>
</table>
</body></html>`;

    const sendEmail = (to, toName, subject, html) =>
      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
        body: JSON.stringify({
          sender: { name: 'TechNext Asia', email: 'hello@technext.asia' },
          to: [{ email: to, name: toName }],
          subject, htmlContent: html
        })
      });

    Promise.all([
      sendEmail(email, name || email, `Demo Confirmed — ${slot}`, confirmHtml),
      sendEmail('hello@technext.asia', 'TechNext Team', `New Booking: ${name || email} — ${slot}`, notifyHtml)
    ]).catch(err => console.error('Email error (non-fatal):', err.message));
  }

  return res.status(200).json({ success: true, slot });
}
