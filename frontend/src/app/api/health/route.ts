// // src/app/api/health/route.ts
// import { NextResponse } from 'next/server'
// import { query } from '@/utils/db'

// // GET /api/health
// export async function GET() {
//   try {
//     // Run a trivial query to test the DB connection
//     await query('SELECT 1')
//     return NextResponse.json({ status: 'ok', db: 'connected' })
//   } catch (err: any) {
//     console.error('DB health-check failed:', err)
//     return NextResponse.json(
//       { status: 'error', db: 'disconnected', error: err.message },
//       { status: 500 }
//     )
//   }
// }

// src/app/api/redis-test/route.ts
import { NextResponse } from 'next/server'
import { redis } from '@/services/redis'  // adjust path if needed

// GET /api/redis-test
export async function GET() {
  try {
    // Write a key
    await redis.set('test-key', 'hello-world')
    // Read it back
    const value = await redis.get('test-key')
    return NextResponse.json({ success: true, value })
  } catch (error: any) {
    console.error('Redis test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
