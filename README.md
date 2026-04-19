# AI Interview Coach (PrepWise)

AI-powered interview practice and feedback platform built with **Next.js + TypeScript**. Users can **sign up / sign in**, run **voice-based mock interviews**, and receive **AI-generated feedback**—with data stored in **Firebase Auth + Firestore**.

---

## Demo

- **Live Demo:** https://vercel.com/chikwa235s-projects/ai-interview-ydcv
---

## Screenshots

![Dashboard](assets/screenshot-dashboard.png)  
![Interview](assets/screenshot-interview.png)  
![Feedback](assets/screenshot-feedback1.png)
![Feedback](assets/screenshot-feedback2.png)

---

## Features

- **Email/password authentication** with **Firebase Auth**
- **Interview creation & history** stored in **Firestore**
- **Voice interview practice** powered by **Vapi**
- **AI feedback generation** powered by **OpenAI**
- **Interview cards** (progressively generated and updated as interviews are created)
- **Responsive UI** (mobile → desktop)
- Clean, reusable components (Tailwind + shadcn/ui)

---

## Tech Stack

- **Next.js 16 (App Router)** — full-stack React framework
- **React 19** — UI layer
- **TypeScript** — static typing
- **Firebase** — client auth SDK
- **firebase-admin** — server-side session cookies + Firestore access
- **Firestore** — database for users + interviews
- **Vapi Web SDK** (`@vapi-ai/web`) — realtime voice interview experience
- **OpenAI** — feedback generation
- **Tailwind CSS + shadcn/ui** — styling + UI primitives

---

## How The App Works

1) Authentication + Session
User signs up / signs in via Firebase Auth
After sign-in, the client sends the Firebase idToken to a Next.js server action
The server action creates a Firebase session cookie and stores it as an httpOnly cookie
Protected pages check authentication using that cookie (server-side)
2) Generate an Interview (Creates the Interview in Firestore)
On the dashboard, the user clicks Generate Interview
The app creates a new interview record in Firestore (e.g., role/level/type)
The app then routes the user into the interview call flow to take the interview
Note: The interview card becomes visible when the user returns to the homepage/dashboard (it’s not shown instantly on the same screen).

3) After the Call → Interview Card Appears on the Homepage
After finishing the call, the user manually navigates back to the homepage/dashboard
The dashboard loads the latest interviews from Firestore
A new Interview Card appears for the interview that was just created
4) View Interview → Start the Interview Call
The user clicks View Interview on the interview card
Then starts a voice call using Vapi
The user completes the interview conversation (voice Q&A)
5) Feedback is Displayed After the Interview
When the interview ends, the app marks the interview as finalized
The transcript/summary is used to generate feedback via OpenAI
The app displays the feedback after the interview finishes (and can store it back in Firestore for later viewing)


---

## Notes on Feedback & AI Output

- Feedback is meant to help users iterate quickly—it's not a guarantee of real interview outcomes.
- AI feedback quality depends on clarity and completeness of answers.
- Avoid sharing sensitive personal info during interviews.

---

## Project Setup (Local)

### Prerequisites

Make sure you have:
- **Git**
- **Node.js 20+**
- **npm**

### Installation

```bash
npm install

### Environment Variables
Create a file named .env.local in the project root:

bash
Copy
# Firebase Admin (server)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# OpenAI (server)
OPENAI_API_KEY=sk-...

# Vapi (client)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
Important:

Keep FIREBASE_PRIVATE_KEY as one line with \n
Do not wrap the private key in quotes
Run the app
bash
Copy
npm run dev
Open: http://localhost:3000

### Deployment (Vercel)
Environment Variables
In Vercel → Project → Settings → Environment Variables, add:

FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY (no quotes)
OPENAI_API_KEY
NEXT_PUBLIC_VAPI_PUBLIC_KEY
Set them for Production (and Preview if you use preview deploys).


### Project Structure

.
├── app/ # Next.js App Router routes, layouts, pages
├── components/ # Reusable UI components
├── lib/ # Utilities + server actions (auth, interviews, feedback)
├── firebase/ # Firebase client + admin initialization
├── public/ # Static assets (images, icons, covers)
│ └── covers/ # Company/brand cover images used in UI
├── types/ # Global TypeScript type definitions
│ ├── index.d.ts
│ └── vapi.d.ts # Vapi-related types
├── next.config.ts
├── package.json
└── README.md

### Credits
Vapi — voice AI infrastructure + Web SDK
Firebase — authentication + Firestore
OpenAI — feedback generation
Tailwind CSS + shadcn/ui — UI styling and components


### License
MIT License © chisapa chikwa

