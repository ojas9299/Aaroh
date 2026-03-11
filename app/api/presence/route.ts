import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

// POST /api/presence — upsert a user's lastSeen timestamp
export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json()
    if (!user) {
      return NextResponse.json({ error: 'Missing user' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('privatechat')
    const collection = db.collection('presence')

    await collection.updateOne(
      { user },
      { $set: { user, lastSeen: Date.now() } },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Presence POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// GET /api/presence — fetch all users' lastSeen timestamps
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('privatechat')
    const collection = db.collection('presence')

    const records = await collection.find({}).toArray()

    const result: Record<string, number> = {}
    for (const rec of records) {
      result[rec.user] = rec.lastSeen
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    console.error('Presence GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
