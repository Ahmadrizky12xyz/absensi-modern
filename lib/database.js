// Database configuration for cloud PostgreSQL
// File: /lib/database.js

import { Pool } from 'pg'

// Database configuration
const dbConfig = {
  // Vercel Postgres configuration
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create connection pool
let pool

function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig)
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }
  return pool
}

// Database helper functions
export class Database {
  static async query(text, params) {
    const client = getPool()
    try {
      const result = await client.query(text, params)
      return result
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  static async getClient() {
    const client = getPool()
    return await client.connect()
  }

  // Initialize database tables
  static async initTables() {
    const client = await this.getClient()
    
    try {
      await client.query('BEGIN')

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nama VARCHAR(255) NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          nomor_id VARCHAR(50) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create absences table
      await client.query(`
        CREATE TABLE IF NOT EXISTS absences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          qr_code_id UUID,
          check_in_time TIMESTAMP,
          check_out_time TIMESTAMP,
          latitude_masuk NUMERIC(10,7),
          longitude_masuk NUMERIC(10,7),
          latitude_keluar NUMERIC(10,7),
          longitude_keluar NUMERIC(10,7),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create qr_codes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(255) UNIQUE NOT NULL,
          location VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create work_hours table
      await client.query(`
        CREATE TABLE IF NOT EXISTS work_hours (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          day_of_week INTEGER NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(day_of_week)
        )
      `)

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_absences_user_id ON absences(user_id)
      `)
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_absences_check_in_time ON absences(check_in_time)
      `)
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
      `)
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code)
      `)

      await client.query('COMMIT')
      console.log('Database tables initialized successfully')
      
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error initializing database tables:', error)
      throw error
    } finally {
      client.release()
    }
  }

  // Seed initial data
  static async seedData() {
    const client = await this.getClient()
    
    try {
      await client.query('BEGIN')

      // Check if admin user exists
      const adminCheck = await client.query(
        'SELECT id FROM users WHERE username = $1',
        ['admin']
      )

      if (adminCheck.rows.length === 0) {
        // Insert default admin user
        await client.query(`
          INSERT INTO users (nama, username, password, nomor_id, role)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          'Administrator',
          'admin',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
          'ADM001',
          'admin'
        ])

        // Insert default user
        await client.query(`
          INSERT INTO users (nama, username, password, nomor_id, role)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          'Budi Santoso',
          'user',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // user123
          'EMP001',
          'user'
        ])

        console.log('Default users created')
      }

      // Check if QR codes exist
      const qrCheck = await client.query('SELECT id FROM qr_codes LIMIT 1')
      
      if (qrCheck.rows.length === 0) {
        // Insert default QR codes
        await client.query(`
          INSERT INTO qr_codes (code, location, is_active)
          VALUES ($1, $2, $3)
        `, [
          'PTINDOTEKHNOPLUS_KANTOR_PUSAT',
          'Kantor Pusat',
          true
        ])

        await client.query(`
          INSERT INTO qr_codes (code, location, is_active)
          VALUES ($1, $2, $3)
        `, [
          'PTINDOTEKHNOPLUS_CABANG_BEKASI',
          'Cabang Bekasi',
          false
        ])

        console.log('Default QR codes created')
      }

      // Check if work hours exist
      const workHoursCheck = await client.query('SELECT id FROM work_hours LIMIT 1')
      
      if (workHoursCheck.rows.length === 0) {
        // Insert default work hours (Monday to Friday)
        for (let day = 1; day <= 5; day++) {
          await client.query(`
            INSERT INTO work_hours (day_of_week, start_time, end_time)
            VALUES ($1, $2, $3)
          `, [day, '08:00:00', '17:00:00'])
        }

        console.log('Default work hours created')
      }

      await client.query('COMMIT')
      console.log('Database seeded successfully')
      
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error seeding database:', error)
      throw error
    } finally {
      client.release()
    }
  }

  // Close all connections
  static async close() {
    if (pool) {
      await pool.end()
      pool = null
    }
  }
}

export default Database

