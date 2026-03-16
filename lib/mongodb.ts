import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const options = {}

if (uri === '' && process.env.NODE_ENV === 'production') {
  // We can't throw at the top level during 'next build' on Vercel
  // but we should log a warning.
  console.warn('Warning: MONGODB_URI is not defined.')
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  if (!uri && typeof window === 'undefined') {
    // This will be hit during build or on server if URI is missing
    clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'))
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise
