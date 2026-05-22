import { pool } from './db.js';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json"
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID/Nomor tiket pengaduan harus diisi' })
      };
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID tiket tidak valid (harus angka)' })
      };
    }

    const res = await pool.query(
      `SELECT id, patient_name, unit, status, created_at, updated_at 
       FROM complaints 
       WHERE id = $1`, 
      [parsedId]
    );

    if (res.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Pengaduan dengan nomor tiket tersebut tidak ditemukan' })
      };
    }

    const complaint = res.rows[0];
    
    // Fetch logs/audit trail for this complaint to show progress updates
    const logsRes = await pool.query(
      `SELECT status_from, status_to, timestamp 
       FROM complaint_logs 
       WHERE complaint_id = $1 
       ORDER BY timestamp ASC`,
      [complaint.id]
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        complaint,
        history: logsRes.rows
      })
    };
  } catch (error) {
    console.error('Error tracking complaint:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
}
