// Vercel serverless function -- uploads brand files to Google Drive via service account
// POST /api/upload  (multipart/form-data)
// Fields: files (one or more), driveFolderId, clientName

import { google } from 'googleapis';
import Busboy from 'busboy';
import { Readable } from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY env var is not set');
    return res.status(500).json({ error: 'Drive not configured' });
  }

  let credentials;
  try {
    credentials = JSON.parse(Buffer.from(rawKey, 'base64').toString('utf-8'));
  } catch (err) {
    console.error('Failed to parse service account key:', err);
    return res.status(500).json({ error: 'Invalid Drive credentials' });
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  // Parse multipart body
  const fields = {};
  const files = [];

  await new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (fieldName, stream, info) => {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        files.push({
          filename: info.filename,
          mimeType: info.mimeType || 'application/octet-stream',
          buffer: Buffer.concat(chunks),
        });
      });
      stream.on('error', reject);
    });

    bb.on('close', resolve);
    bb.on('error', reject);
    req.pipe(bb);
  });

  const folderId = fields.driveFolderId;
  const clientName = fields.clientName;

  if (!folderId) {
    return res.status(400).json({ error: 'Missing driveFolderId' });
  }

  const results = [];

  for (const file of files) {
    try {
      const resp = await drive.files.create({
        requestBody: {
          name: file.filename,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimeType,
          body: Readable.from(file.buffer),
        },
        fields: 'id,webViewLink,name',
      });

      results.push({
        name: resp.data.name,
        id: resp.data.id,
        link: resp.data.webViewLink,
      });
    } catch (err) {
      console.error(`Failed to upload ${file.filename}:`, err.message);
    }
  }

  // Ping Sam and Mario with Drive links
  if (results.length > 0) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    fetch(`${proto}://${host}/api/onboarding-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'upload-complete',
        clientName,
        uploadedFiles: results,
      }),
    }).catch(err => console.error('Upload notify failed:', err.message));
  }

  return res.status(200).json({ ok: true, files: results });
}
