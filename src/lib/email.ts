const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL || 'no-reply@yourdomain.com';
const fromName = process.env.BREVO_FROM_NAME || 'Aieraa Food';
const resetTemplateId = process.env.BREVO_RESET_TEMPLATE_ID ? Number(process.env.BREVO_RESET_TEMPLATE_ID) : undefined;
const newOrderTemplateId = process.env.BREVO_NEW_ORDER_TEMPLATE_ID ? Number(process.env.BREVO_NEW_ORDER_TEMPLATE_ID) : undefined;

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  const htmlContent = `
    <p style="margin:0 0 12px">Hello,</p>
    <p style="margin:0 0 12px">We received a request to reset your password. Click the link below to set a new password. This link will expire in 1 hour.</p>
    <p style="margin:0 0 12px"><a href="${resetLink}">Reset your password</a></p>
    <p style="margin:0 0 12px">If you did not request this, you can safely ignore this email.</p>
  `;
  const textContent = `Hello,\n\nWe received a request to reset your password. Use the link below within 1 hour:\n${resetLink}\n\nIf you did not request this, ignore this email.`;

  const payload: Record<string, unknown> = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: to }],
    subject: 'Reset your password',
    htmlContent,
    textContent,
  };
  if (resetTemplateId && Number.isFinite(resetTemplateId)) {
    payload.templateId = resetTemplateId;
    payload.params = { resetLink };
    delete payload.htmlContent;
    delete payload.textContent;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${text}`);
  }
}


export async function sendNewOrderEmail(to: string[], order: {
  orderNumber: string;
  totalAmount: number;
  scheduledForDate: string | Date;
  universityName?: string | null;
  studentName?: string | null;
  items: Array<{ quantity: number; name: string; variant: string; price: number }>
}) {
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  const dateStr = typeof order.scheduledForDate === 'string' ? order.scheduledForDate : order.scheduledForDate.toISOString().slice(0, 10);
  const subject = `New order #${order.orderNumber} • ${dateStr}`;
  const itemsHtml = order.items.map(i => `<li>${i.quantity}× ${i.name} (${i.variant}) — ₹${(i.price * i.quantity).toFixed(0)}</li>`).join('');
  const htmlContent = `
    <p style="margin:0 0 12px"><strong>New order received</strong></p>
    <p style="margin:0 0 8px">Order: <strong>#${order.orderNumber}</strong></p>
    <p style="margin:0 0 8px">Scheduled for: <strong>${dateStr}</strong></p>
    ${order.universityName ? `<p style=\"margin:0 0 8px\">University: <strong>${order.universityName}</strong></p>` : ''}
    ${order.studentName ? `<p style=\"margin:0 0 8px\">Student: <strong>${order.studentName}</strong></p>` : ''}
    <ul style="margin:8px 0 12px; padding-left:16px">${itemsHtml}</ul>
    <p style="margin:0 0 8px">Total: <strong>₹${order.totalAmount.toFixed(0)}</strong></p>
  `;
  const textContent = `New order received
Order: #${order.orderNumber}
Scheduled for: ${dateStr}
${order.universityName ? `University: ${order.universityName}\n` : ''}${order.studentName ? `Student: ${order.studentName}\n` : ''}
Items:
${order.items.map(i => `- ${i.quantity}x ${i.name} (${i.variant}) — ₹${(i.price * i.quantity).toFixed(0)}`).join('\n')}
Total: ₹${order.totalAmount.toFixed(0)}`;

  const payload: Record<string, unknown> = {
    sender: { email: fromEmail, name: fromName },
    to: to.map(email => ({ email })),
    subject,
    htmlContent,
    textContent,
  };
  if (newOrderTemplateId && Number.isFinite(newOrderTemplateId)) {
    payload.templateId = newOrderTemplateId;
    payload.params = {
      orderNumber: order.orderNumber,
      scheduledForDate: dateStr,
      university: order.universityName,
      student: order.studentName,
      total: `₹${order.totalAmount.toFixed(0)}`,
      items: order.items.map(i => `${i.quantity}x ${i.name} (${i.variant}) — ₹${(i.price * i.quantity).toFixed(0)}`).join('\n')
    };
    delete payload.htmlContent;
    delete payload.textContent;
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${text}`);
  }
}

