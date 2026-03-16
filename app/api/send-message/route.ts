import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

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

const MOTIVATIONAL_MESSAGES = [
  "Time to revisit Raag Yaman. Even 5 minutes of practice sharpens the voice. Also, drink some water and take care of yourself.",
  "Your daily Riyaz reminder is here. A small alaap today goes a long way. You're doing better than you think.",
  "Perfect moment to practice that tricky taan you skipped yesterday. Be kind to yourself today.",
  "Aaroh check-in: have you sung a note today? Stay hydrated and keep shining.",
  "Your voice deserves a warm-up. Try a short Raag Bhupali practice. Remember, progress comes one note at a time.",
  "Musical muscles need stretching too. A quick riyaz session awaits. And yes, you're enough just as you are.",
  "Great singers practice daily. Today could be your best note yet. Take a deep breath and keep going.",
  "A gentle Aaroh reminder: maybe sing a few notes today. Also don’t forget to drink water.",
  "Music grows slowly and beautifully. Your voice is improving every day.",
  "Even a short riyaz session counts today. Be proud of the effort you’re making.",
  "A small practice today keeps the sur steady. You’re stronger than you realize.",
  "Your musical journey is unfolding note by note. Take it easy and trust yourself."
]

async function sendStealthEmail(to: string) {
  const referenceId = "Get our Paid plan today and get unlimited access to all raags"
  const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Account activity summary',
    text: `${randomMessage}\n\nRef: ${referenceId}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Stealth email sent to ${to}`)
  } catch (error) {
    console.error('Error sending stealth email:', error)
  }
}

export async function POST(request: Request) {
  try {
    const { sender, ciphertext } = await request.json()

    if (!sender || !ciphertext) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (sender !== 'meow' && sender !== 'quack') {
      return NextResponse.json(
        { error: 'Invalid sender' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('Aaroh')
    
    // Save the message
    const messagesCollection = db.collection('messages')
    await messagesCollection.insertOne({
      sender,
      ciphertext,
      timestamp: Date.now(),
    })

    // Handle email notification (Non-blocking)
    const receiverEmail = RECIPIENTS[sender]
    if (receiverEmail) {
      (async () => {
        try {
          const usersCollection = db.collection('users')
          const user = await usersCollection.findOne({ email: receiverEmail })
          const now = Date.now()

          if (!user || !user.lastEmailNotificationAt || (now - user.lastEmailNotificationAt) > THROTTLE_TIME) {
            await sendStealthEmail(receiverEmail)
            await usersCollection.updateOne(
              { email: receiverEmail },
              { $set: { lastEmailNotificationAt: now } },
              { upsert: true }
            )
          } else {
            console.log(`Email throttled for ${receiverEmail}`)
          }
        } catch (err) {
          console.error('Notification logic error:', err)
        }
      })()
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in send-message API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
