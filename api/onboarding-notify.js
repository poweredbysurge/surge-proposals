// Vercel serverless function -- fires onboarding notification emails via Resend
// POST /api/onboarding-notify
// Body (type "onboarding"): { type, subject, payload }
// Body (type "upload-complete"): { type, clientName, uploadedFiles: [{ name, link }] }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  if (!body || !body.type) {
    return res.status(400).json({ error: 'Missing type field' });
  }

  let subject, html;

  if (body.type === 'onboarding') {
    const { payload } = body;
    if (!payload) return res.status(400).json({ error: 'Missing payload' });
    subject = body.subject || `Onboarding submitted: ${payload.clientName || 'Client'}`;
    html = buildOnboardingEmail(payload);
  } else if (body.type === 'upload-complete') {
    subject = `Files uploaded to Drive: ${body.clientName || 'Client'}`;
    html = buildUploadEmail(body.clientName, body.uploadedFiles || []);
  } else {
    return res.status(400).json({ error: 'Unknown type' });
  }

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
        subject,
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

function row(label, value) {
  if (!value) return '';
  return `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 0;color:#6b7280;width:180px;vertical-align:top;font-size:13px;">${label}</td>
      <td style="padding:10px 0;color:#111;font-size:13px;">${escHtml(String(value))}</td>
    </tr>`;
}

function sectionHeader(title) {
  return `
    <tr>
      <td colspan="2" style="padding:20px 0 6px;font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#dee535;border-bottom:2px solid #dee535;">${title}</td>
    </tr>`;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildOnboardingEmail(p) {
  const fileList = Array.isArray(p.uploadedFileNames) && p.uploadedFileNames.length
    ? p.uploadedFileNames.join(', ')
    : 'None';

  const platformRows = Object.keys(p)
    .filter(k => k.startsWith('platform-') && k.endsWith('-login'))
    .map(k => {
      const idx = k.split('-')[1];
      const done = p[`platform-${idx}-done`] === 'on' ? 'Done' : 'Pending';
      return row(`Access ${idx}`, `${p[k] || ''} (${done})`);
    }).join('');

  const inspoLinks = Array.isArray(p['inspoLink[]'])
    ? p['inspoLink[]'].filter(Boolean).join(', ')
    : (p['inspoLink[]'] || '');

  const serviceRows = Object.keys(p)
    .filter(k => k.startsWith('service-') && k.endsWith('-name'))
    .map(k => {
      const idx = k.split('-')[1];
      const name = p[`service-${idx}-name`] || '';
      const pct = p[`service-${idx}-pct`] || '';
      const priority = p[`service-${idx}-priority`] || '';
      return name ? row(`Service ${parseInt(idx) + 1}`, `${name} -- ${pct}% (${priority})`) : '';
    }).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#080808;padding:24px 32px;border-radius:12px 12px 0 0;">
        <span style="font-family:sans-serif;font-size:22px;font-weight:900;color:#dee535;letter-spacing:0.06em;">SURGE</span>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="margin:0 0 6px;font-size:22px;color:#111;">Onboarding Submitted</h2>
        <p style="margin:0 0 28px;color:#6b7280;font-size:14px;">${escHtml(p.clientName || '')} filled out all six onboarding stages.</p>

        <table style="width:100%;border-collapse:collapse;">
          ${sectionHeader('Overview')}
          ${row('Client', p.clientName)}
          ${row('Stakeholders', p.stakeholders)}
          ${row('Submitted', p.submittedAt ? new Date(p.submittedAt).toLocaleString('en-US', { timeZone: 'America/New_York' }) : '')}
          ${row('Uploaded files', fileList)}

          ${sectionHeader('Account Access')}
          ${platformRows || row('Access notes', p.accessNotes)}
          ${row('Access notes', p.accessNotes)}

          ${sectionHeader('Brand Assets')}
          ${row('Brand Drive link', p.brandDriveLink)}
          ${row('Brand colors', p.brandColors)}
          ${row('Brand notes', p.brandNotes)}

          ${sectionHeader('Website Inspiration')}
          ${row('Inspo links', inspoLinks)}
          ${row('Inspo notes', p.inspoNotes)}

          ${sectionHeader('Operations and SOPs')}
          ${row('Best offers', p.bestOffers)}
          ${row('Call center SOP', p.callCenterSOP)}
          ${row('Lead SOP', p.leadSOP)}
          ${row('Automation wishes', p.automationWishes)}

          ${sectionHeader('Service Mix')}
          ${serviceRows}
          ${row('Service to grow', p.serviceToGrow)}
          ${row('Service packages', p.servicePackages)}

          ${sectionHeader('Team and Tools')}
          ${row('Social team intro', p.socialTeamIntro)}
          ${row('Content library', p.contentLibrary)}
          ${row('Existing TV/radio', p.existingTV)}
          ${row('Other team notes', p.otherTeam)}
        </table>
      </div>
    </div>
  `;
}

function buildUploadEmail(clientName, files) {
  const fileRows = files.map(f =>
    `<tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 0;color:#111;font-size:13px;">${escHtml(f.name || '')}</td>
      <td style="padding:10px 0;font-size:13px;">
        <a href="${escHtml(f.link || '')}" style="color:#dee535;">View in Drive</a>
      </td>
    </tr>`
  ).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#080808;padding:24px 32px;border-radius:12px 12px 0 0;">
        <span style="font-family:sans-serif;font-size:22px;font-weight:900;color:#dee535;letter-spacing:0.06em;">SURGE</span>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="margin:0 0 6px;font-size:22px;color:#111;">Files Uploaded to Drive</h2>
        <p style="margin:0 0 28px;color:#6b7280;font-size:14px;">${escHtml(clientName || 'Client')} brand assets are now in Google Drive.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:2px solid #dee535;">
            <td style="padding:8px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">File</td>
            <td style="padding:8px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Link</td>
          </tr>
          ${fileRows}
        </table>
      </div>
    </div>
  `;
}
