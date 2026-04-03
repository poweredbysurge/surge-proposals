// Vercel serverless function — fires proposal approval email via Resend
// POST /api/notify
// Body: { name, company, date, retainer, proposal, fee }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, date, retainer, proposal, fee } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#080808;padding:24px 32px;border-radius:12px 12px 0 0;">
        <span style="font-family:sans-serif;font-size:22px;font-weight:900;color:#dee535;letter-spacing:0.06em;">SURGE</span>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Proposal Approved</h2>
        <p style="margin:0 0 28px;color:#6b7280;font-size:14px;">A client has signed and approved a Surge proposal.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 0;color:#6b7280;width:140px;">Signed by</td>
            <td style="padding:12px 0;font-weight:600;color:#111;">${name}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 0;color:#6b7280;">Company</td>
            <td style="padding:12px 0;color:#111;">${company || 'N/A'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 0;color:#6b7280;">Date</td>
            <td style="padding:12px 0;color:#111;">${date}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 0;color:#6b7280;">SEO Retainer</td>
            <td style="padding:12px 0;color:#111;">${retainer || 'Decide after launch'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 0;color:#6b7280;">Proposal</td>
            <td style="padding:12px 0;color:#111;">${proposal || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#6b7280;">Project Fee</td>
            <td style="padding:12px 0;font-weight:700;font-size:18px;color:#080808;">${fee || '$5,000'}</td>
          </tr>
        </table>

        <div style="margin-top:28px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;">
          Next step: confirm receipt with the client and schedule the kickoff call.
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Surge Proposals <proposals@updates.thesurgeagency.com>',
        to: ['sam@thesurgeagency.com', 'mario@thesurgeagency.com'],
        subject: `Proposal Approved: ${name} / ${company || 'N/A'}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
