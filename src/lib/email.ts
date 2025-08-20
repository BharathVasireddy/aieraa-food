const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@yourdomain.com';
const fromName = process.env.BREVO_FROM_NAME || 'Aieraa Food';

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  const htmlContent = `
    <p>Hello,</p>
    <p>We received a request to reset your password. Click the link below to set a new password. This link will expire in 1 hour.</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject: 'Reset your password',
      htmlContent,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${text}`);
  }
}


