import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Aaroh')
    const collection = db.collection('messages')

    const messages = await collection
      .find({})
      .sort({ timestamp: 1 }) // Descending if we want newest first, but client wants chronological so Ascending (1)
      .toArray()

    // Map `_id` to `id` for easier frontend consumption
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      sender: msg.sender,
      ciphertext: msg.ciphertext,
      timestamp: msg.timestamp,
    }))

    return NextResponse.json(formattedMessages, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('Error in messages API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
