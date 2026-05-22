import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_vpqGOt1DCUf4@ep-bold-mud-ap8ck6da-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  console.log("Connecting to Neon DB...");
  const client = new pg.Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    // 1. Create users table
    console.log("Creating 'users' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create complaints table
    console.log("Creating 'complaints' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(50) NOT NULL,
        unit VARCHAR(100) NOT NULL,
        complaint_content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create complaint_logs table
    console.log("Creating 'complaint_logs' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_logs (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
        status_from VARCHAR(50),
        status_to VARCHAR(50),
        changed_by VARCHAR(255) DEFAULT 'admin@test.com',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Seed admin account with UPSERT
    console.log("Seeding admin account...");
    const email = "admin@test.com";
    const password = "admin123"; // default admin password
    const passwordHash = await bcrypt.hash(password, 10);

    // Using UPSERT: ON CONFLICT(email) DO UPDATE
    await client.query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, [email, passwordHash]);

    console.log(`Admin account '${email}' upserted successfully (Password: ${password})!`);

  } catch (err) {
    console.error("Error during database seeding:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
