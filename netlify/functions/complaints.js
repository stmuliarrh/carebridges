import pool from './db.js';
import jwt from 'jsonwebtoken';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const secret = process.env.JWT_SECRET || 'carebridges_secret_key_123';

  // GET: Admin-only to get all complaints
  if (event.httpMethod === 'GET') {
    try {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized: Missing token' })
        };
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (err) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
        };
      }

      // Fetch all complaints, newest first
      const res = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(res.rows)
      };
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal Server Error' })
      };
    }
  }

  // POST: Public submission of E-Complaint
  if (event.httpMethod === 'POST') {
    try {
      const { patient_name, whatsapp_number, unit, complaint_content } = JSON.parse(event.body || '{}');

      if (!patient_name || !whatsapp_number || !unit || !complaint_content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'All fields are required' })
        };
      }

      // Insert complaint
      const complaintRes = await pool.query(
        `INSERT INTO complaints (patient_name, whatsapp_number, unit, complaint_content, status)
         VALUES ($1, $2, $3, $4, 'Pending')
         RETURNING *`,
        [patient_name.trim(), whatsapp_number.trim(), unit.trim(), complaint_content.trim()]
      );

      const newComplaint = complaintRes.rows[0];

      // Add audit log entry
      await pool.query(
        `INSERT INTO complaint_logs (complaint_id, status_from, status_to, changed_by)
         VALUES ($1, NULL, 'Pending', $2)`,
        [newComplaint.id, `Patient: ${newComplaint.patient_name}`]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'Complaint submitted successfully',
          complaint: newComplaint
        })
      };
    } catch (error) {
      console.error('Error submitting complaint:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
}
