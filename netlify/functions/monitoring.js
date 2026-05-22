import { pool } from './db.js';
import jwt from 'jsonwebtoken';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
      };
    }

    // 1. Status aggregates
    const statusRes = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM complaints 
      GROUP BY status
    `);

    // 2. Unit aggregates
    const unitRes = await pool.query(`
      SELECT unit, COUNT(*) as count 
      FROM complaints 
      GROUP BY unit
      ORDER BY count DESC
    `);

    // 3. Avg response time (seconds between creation and update where status changed)
    // We compute differences in minutes.
    const responseTimeRes = await pool.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) / 60 as avg_minutes
      FROM complaints 
      WHERE status IN ('Processing', 'Completed') AND updated_at > created_at
    `);
    const avgMinutes = parseFloat(responseTimeRes.rows[0].avg_minutes || 0).toFixed(1);

    // 4. Audit Trail logs
    const logsRes = await pool.query(`
      SELECT 
        l.id as log_id,
        l.complaint_id,
        c.patient_name,
        c.unit as current_unit,
        l.status_from,
        l.status_to,
        l.changed_by,
        l.timestamp
      FROM complaint_logs l
      LEFT JOIN complaints c ON l.complaint_id = c.id
      ORDER BY l.timestamp DESC
      LIMIT 100
    `);

    // Format results
    const statusStats = { Pending: 0, Processing: 0, Completed: 0 };
    statusRes.rows.forEach(row => {
      if (statusStats[row.status] !== undefined) {
        statusStats[row.status] = parseInt(row.count, 10);
      }
    });

    const unitStats = unitRes.rows.map(row => ({
      name: row.unit,
      value: parseInt(row.count, 10)
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        statusStats,
        unitStats,
        avgMinutes: parseFloat(avgMinutes),
        logs: logsRes.rows
      })
    };
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
}
