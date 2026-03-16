import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { raagMessages } from "@/lib/raagMessages"

export const dynamic = 'force-dynamic';

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

const RECIPIENTS: Record<string, string> = {
  meow: 'ojasbhalerao9299@gmail.com',
  quack: 'aaryaanekar15@gmail.com'
}

const THROTTLE_TIME = 10 * 60 * 1000 // 10 minutes in ms

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

async function sendStealthEmail(to: string) {
  const randomMessage = raagMessages[Math.floor(Math.random() * raagMessages.length)]
  
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Account activity summary',
    text: randomMessage,
  }

  try {
    console.log(`Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Stealth email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending stealth email:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { sender, ciphertext } = await request.json()

    if (!sender || !ciphertext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (sender !== 'meow' && sender !== 'quack') {
      return NextResponse.json({ error: 'Invalid sender' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('Aaroh')
    
    // 1. Save the message (Primary Action)
    const messagesCollection = db.collection('messages')
    await messagesCollection.insertOne({
      sender,
      ciphertext,
      timestamp: Date.now(),
    })

    // 2. Handle email notification (MUST AWAIT ON VERCEL)
    const receiverEmail = RECIPIENTS[sender]
    if (receiverEmail) {
      try {
        const usersCollection = db.collection('users')
        const user = await usersCollection.findOne({ email: receiverEmail })
        const now = Date.now()

        if (!user || !user.lastEmailNotificationAt || (now - user.lastEmailNotificationAt) > THROTTLE_TIME) {
          console.log(`Triggering notification for ${receiverEmail}`);
          await sendStealthEmail(receiverEmail)
          await usersCollection.updateOne(
            { email: receiverEmail },
            { $set: { lastEmailNotificationAt: now } },
            { upsert: true }
          )
        } else {
          console.log(`Email throttled for ${receiverEmail}. Last sent at: ${user.lastEmailNotificationAt}`);
        }
      } catch (err) {
        // We log the error but don't fail the message send
        console.error('Notification logic error:', err)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in send-message API:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
