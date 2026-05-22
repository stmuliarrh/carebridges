import pool from './db.js';
import jwt from 'jsonwebtoken';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const secret = process.env.JWT_SECRET || 'carebridges_secret_key_123';

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

    const { complaint_id, status, unit } = JSON.parse(event.body || '{}');

    if (!complaint_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Complaint ID is required' })
      };
    }

    // Get current state
    const currentRes = await pool.query('SELECT * FROM complaints WHERE id = $1', [complaint_id]);
    if (currentRes.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Complaint not found' })
      };
    }

    const oldComplaint = currentRes.rows[0];
    const newStatus = status || oldComplaint.status;
    const newUnit = unit || oldComplaint.unit;

    // Update
    const updateRes = await pool.query(
      `UPDATE complaints
       SET status = $1, unit = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newStatus, newUnit, complaint_id]
    );

    const updatedComplaint = updateRes.rows[0];

    // Log the change
    if (oldComplaint.status !== newStatus || oldComplaint.unit !== newUnit) {
      let logMsg = '';
      if (oldComplaint.status !== newStatus && oldComplaint.unit !== newUnit) {
        logMsg = `Unit: ${oldComplaint.unit} -> ${newUnit}, Status: ${oldComplaint.status} -> ${newStatus}`;
      } else if (oldComplaint.unit !== newUnit) {
        logMsg = `Unit: ${oldComplaint.unit} -> ${newUnit}`;
      } else {
        logMsg = `Status: ${oldComplaint.status} -> ${newStatus}`;
      }

      await pool.query(
        `INSERT INTO complaint_logs (complaint_id, status_from, status_to, changed_by)
         VALUES ($1, $2, $3, $4)`,
        [complaint_id, oldComplaint.status, newStatus, `${decoded.email} (${logMsg})`]
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Complaint updated successfully',
        complaint: updatedComplaint
      })
    };
  } catch (error) {
    console.error('Error updating complaint:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
}
