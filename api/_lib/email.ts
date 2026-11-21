// Email delivery through Resend's HTTP API (no SDK needed).

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.EMAIL_FROM);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface Attachment {
  filename: string;
  /** Base64-encoded file contents. */
  content: string;
}

interface Message {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
  /** Milliseconds to wait for Resend. Larger for emails carrying attachments. */
  timeout?: number;
}

export async function sendEmail({ to, subject, text, html, replyTo, attachments, timeout = 10_000 }: Message): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject: subject.replace(/[\r\n]+/g, ' '),
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments?.length ? { attachments } : {}),
    }),
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend failed (${response.status}): ${detail.slice(0, 200)}`);
  }
}

export function htmlRows(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5b6b6f;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#10262d;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return `<table style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;border-collapse:collapse">${cells}</table>`;
}

/** Several titled tables, one after another, for longer submissions. */
export function htmlSections(sections: { title: string; rows: [string, string][] }[]): string {
  return sections
    .map(
      ({ title, rows }) =>
        `<h3 style="font:600 13px/1.4 -apple-system,Segoe UI,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8b3a3a;margin:24px 0 8px">${escapeHtml(title)}</h3>` +
        htmlRows(rows),
    )
    .join('');
}
