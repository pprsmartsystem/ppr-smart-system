export function settlementInitiatedEmail({ name, amount, settlementDate, reference, walletBalance }) {
  const fmt = (v) => `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = new Date(settlementDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  });
  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });

  const rows = [
    ['Transaction Type', 'T+1 Bank Settlement'],
    ['Status', '<span style="background:#fef3c7;color:#92400e;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;">Processing</span>'],
    ['Reference ID', `<span style="font-family:monospace;color:#4f46e5;font-size:13px;">${reference}</span>`],
    ['Initiated On', now],
    ['Settlement Date', `<strong style="color:#047857;">${fmtDate}</strong>`],
    ['Remaining Balance', fmt(walletBalance)],
  ].map(([k, v]) => `
    <tr>
      <td style="padding:12px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:45%;">${k}</td>
      <td style="padding:12px 16px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">${v}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#1d4ed8 100%);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
    <p style="color:#a5b4fc;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">PPR SMART SYSTEM</p>
    <div style="width:56px;height:56px;background:#f59e0b;border-radius:50%;margin:0 auto 14px;line-height:56px;text-align:center;font-size:26px;">⏳</div>
    <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 6px;">Settlement Initiated</h1>
    <p style="color:#a5b4fc;font-size:12px;margin:0;">T+1 Bank Settlement — Auto-generated notification</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:32px 36px;">
    <p style="color:#374151;font-size:15px;margin:0 0 8px;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Your settlement request has been successfully initiated. The amount will be credited to your registered bank account on the next working day.
    </p>

    <!-- Amount -->
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Settlement Amount</p>
      <p style="color:#b45309;font-size:38px;font-weight:800;margin:0;">${fmt(amount)}</p>
      <p style="color:#d97706;font-size:12px;margin:8px 0 0;">Expected credit by <strong>${fmtDate}</strong></p>
    </div>

    <!-- Details table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:12px 16px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;">Settlement Details</td>
      </tr>
      ${rows}
    </table>

    <!-- Info note -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin-bottom:16px;">
      <p style="color:#1e40af;font-size:12px;line-height:1.6;margin:0;">
        📋 <strong>Note:</strong> Settlement follows T+1 model. Weekends and public holidays are excluded. Amount has been deducted from your wallet immediately.
      </p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
      <p style="color:#166534;font-size:12px;line-height:1.6;margin:0;">
        🔒 Your bank account details are secured with KYC verification. If you did not initiate this, contact us at
        <a href="mailto:support@pprsmartsystem.com" style="color:#15803d;font-weight:600;">support@pprsmartsystem.com</a>
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0;">This is an auto-generated email. Please do not reply.</p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0f172a;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
    <p style="color:#64748b;font-size:12px;margin:0 0 4px;">© ${new Date().getFullYear()} PPR Smart System. All rights reserved.</p>
    <p style="margin:0;font-size:11px;">
      <a href="https://www.pprsmart.com" style="color:#6366f1;text-decoration:none;">www.pprsmart.com</a>
      &nbsp;·&nbsp;
      <a href="mailto:support@pprsmartsystem.com" style="color:#6366f1;text-decoration:none;">support@pprsmartsystem.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
