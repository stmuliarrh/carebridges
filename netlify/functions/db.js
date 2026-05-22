import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vpqGOt1DCUf4@ep-bold-mud-ap8ck6da-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

let maskedUrl = "unknown";
try {
  const parsed = new URL(connectionString);
  maskedUrl = `${parsed.protocol}//${parsed.username}:****@${parsed.host}${parsed.pathname}${parsed.search}`;
} catch (e) {
  maskedUrl = connectionString.substring(0, 30) + "...";
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export { pool, maskedUrl };
export default pool;

