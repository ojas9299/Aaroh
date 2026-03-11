# Aaroh

A highly secure, end-to-end encrypted real-time messaging application designed specifically for two users.

## Features
- **End-to-End Encryption**: Utilizes WebCrypto API (AES-GCM) entirely in the browser.
- **Zero-Knowledge Backend**: The server and database only ever see opaque ciphertext and timestamps. Key derivation is strictly client-side.
- **Polling Architecture**: Built for stateless serverless environments without needing WebSockets.
- **Modern UI**: Designed with Tailwind CSS and shadcn/ui.

## Tech Stack
- Next.js 14 (App Router)
- React
- Tailwind CSS & shadcn/ui
- MongoDB Atlas (Free Tier compatible)
- WebCrypto API (PBKDF2, AES-GCM)

---

## Setup Instructions

### 1. Configure MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write access.
3. Allow network access from anywhere (`0.0.0.0/0`) since serverless functions will connect from dynamic IPs.
4. Get your connection string (URI).

### 2. Environment Variables
Create a `.env.local` file in the root directory (or add it to your hosting provider's dashboard) with the following:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/Aaroh?retryWrites=true&w=majority"
```

### 3. Local Development
Run the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Deployment on Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import the repository.
3. Add the `MONGODB_URI` to the Environment Variables section in the Vercel deployment settings.
4. Click **Deploy**.

## Security Notes
- Both users **must** enter the exact same passphrase on their respective devices to successfully decrypt each other's messages.
- If the passphrase is forgotten, historical messages can never be recovered.
- The `passphrase` is run through `PBKDF2` (100,000 iterations) to derive the `AES-GCM` key.
- Keys are kept in React state and are cleared upon refresh or logout.
