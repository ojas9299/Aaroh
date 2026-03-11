import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { sender, ciphertext } = await request.json()

    if (!sender || !ciphertext) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (sender !== 'user1' && sender !== 'user2') {
      return NextResponse.json(
        { error: 'Invalid sender' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('Aaroh')
    const collection = db.collection('messages')

    await collection.insertOne({
      sender,
      ciphertext,
      timestamp: Date.now(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in send-message API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
