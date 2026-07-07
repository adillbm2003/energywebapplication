/**
 * Lightweight email delivery helper.
 *
 * Sends real email via SMTP when BOTH of these are true:
 *   1. `nodemailer` is installed (optional dependency — not required to boot), and
 *   2. SMTP is configured via env: SMTP_HOST (+ optional SMTP_PORT / SMTP_USER /
 *      SMTP_PASS / SMTP_SECURE / SMTP_FROM).
 *
 * Otherwise it logs the message to the console and returns `{ sent: false }`, so
 * local/dev runs work without a mail server and the app never crashes because a
 * mail provider isn't wired yet.
 *
 * To enable real delivery:  npm install nodemailer  and set the SMTP_* env vars.
 */

let transporterPromise = null;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
    } catch (e) {
      console.warn('[Mailer] `nodemailer` is not installed — emails will be logged only. Run `npm install nodemailer` to enable delivery.');
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587/STARTTLS
      auth: (process.env.SMTP_USER && process.env.SMTP_PASS)
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  })();
  return transporterPromise;
}

/**
 * Send an email. Never throws — delivery failures are logged and reported via the
 * returned object so callers can decide what to do (auth flows must not 500 just
 * because SMTP is down).
 *
 * @param {{to: string, subject: string, text?: string, html?: string}} msg
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || 'Bermuda Department of Energy <no-reply@energy.bm>';
  if (!isConfigured()) {
    console.log(`[Mailer] (not configured) Would send to ${to} | Subject: ${subject}\n${text || html || ''}`);
    return { sent: false, reason: 'SMTP not configured' };
  }
  try {
    const transporter = await getTransporter();
    if (!transporter) return { sent: false, reason: 'nodemailer not installed' };
    await transporter.sendMail({ from, to, subject, text, html });
    console.log(`[Mailer] Sent "${subject}" to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error(`[Mailer] Failed to send "${subject}" to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendMail, isConfigured };
