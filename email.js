import nodemailer from 'nodemailer';

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing ${key} in .env`);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export async function sendVerificationEmail(to, code) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your Jj Up email address',
    text: `Your Jj Up verification code is ${code}. It expires in 10 minutes. If you did not create a Jj Up account, you can ignore this email.`,
    html: `
      <div style="margin:0;background:#f2f5f7;padding:32px 12px;font-family:Arial,sans-serif;color:#0f1d2b">
        <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #d9e1e8;border-radius:16px;padding:32px">
          <div style="font-size:24px;font-weight:700;color:#1f5fd6">Jj Up</div>
          <h1 style="font-size:22px;margin:24px 0 12px">Verify your email address</h1>
          <p style="line-height:1.6">Use the verification code below to finish creating your Jj Up account.</p>
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;background:#f2f5f7;border-radius:10px;padding:18px;text-align:center">${code}</div>
          <p style="line-height:1.6">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
          <p style="font-size:12px;color:#5a6b7b">If you did not request this email, you can safely ignore it.</p>
        </div>
      </div>`
  });
}
