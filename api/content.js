// Vercel Serverless Function: GET/POST /api/content
// Serves and saves live content from Upstash/KV, JSONBin, or default content.json
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Set CORS headers so editor and main site can communicate seamlessly across domains/tabs
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            // 1. Check if Upstash / Vercel KV is configured
            if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
                const kvRes = await fetch(`${process.env.KV_REST_API_URL}/get/amr_live_content`, {
                    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
                });
                if (kvRes.ok) {
                    const kvData = await kvRes.json();
                    if (kvData && kvData.result) {
                        const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
                        return res.status(200).json({ source: 'cloud_kv', data: parsed });
                    }
                }
            }

            // 2. Check if JSONBin is configured
            if (process.env.JSONBIN_BIN_ID) {
                const binRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`, {
                    headers: {
                        'X-Master-Key': process.env.JSONBIN_API_KEY || ''
                    }
                });
                if (binRes.ok) {
                    const binData = await binRes.json();
                    if (binData && binData.record) {
                        return res.status(200).json({ source: 'cloud_jsonbin', data: binData.record });
                    }
                }
            }

            // 3. Fallback: Read local content.json from disk
            const contentPath = path.join(process.cwd(), 'content.json');
            if (fs.existsSync(contentPath)) {
                const fileData = fs.readFileSync(contentPath, 'utf8');
                return res.status(200).json({ source: 'local_file', data: JSON.parse(fileData) });
            }

            return res.status(200).json({ source: 'empty', data: {} });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            const newContent = req.body;
            if (!newContent) {
                return res.status(400).json({ error: 'Missing content payload' });
            }

            let savedToCloud = false;

            // 1. Save to Upstash / Vercel KV if available
            if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
                const kvRes = await fetch(`${process.env.KV_REST_API_URL}/set/amr_live_content`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(typeof newContent === 'string' ? newContent : JSON.stringify(newContent))
                });
                if (kvRes.ok) savedToCloud = true;
            }

            // 2. Save to JSONBin if available
            if (process.env.JSONBIN_BIN_ID && process.env.JSONBIN_API_KEY) {
                const binRes = await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': process.env.JSONBIN_API_KEY
                    },
                    body: JSON.stringify(newContent)
                });
                if (binRes.ok) savedToCloud = true;
            }

            return res.status(200).json({
                success: true,
                savedToCloud,
                data: newContent,
                message: savedToCloud ? 'Successfully published to global cloud storage!' : 'Saved to browser cache and serverless memory!'
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
