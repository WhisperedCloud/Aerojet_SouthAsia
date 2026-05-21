# AeroJet ✈️ — Flight Booking & Management PWA

AeroJet is a modern flight booking Progressive Web App built with **Next.js 14, Supabase, Zustand, and Tailwind CSS**.
The goal of this project was to create a smooth and realistic airline booking experience with realtime seat selection, offline support, booking management, and secure database transactions.

The app is designed to feel fast, interactive, and production-ready while keeping the user experience simple and clean.

---

# ✨ Features

### ✈️ Flight Search

Users can search flights between multiple hub airports by selecting:

* Origin
* Destination
* Travel date
* Passenger count

Quick-route suggestions are also available for commonly used routes.

---

### 🛫 Flight Results

The results page displays detailed flight cards including:

* Flight duration
* Aircraft type
* Ticket pricing
* Flight status
* Amenities
* Travel class badges

---

### 💺 Interactive Seat Selection

Users can choose seats from a live cabin layout with:

* Economy
* Business
* First Class sections

Seat availability updates in realtime using **Supabase Realtime**, preventing double booking issues.

---

### 🧍 Passenger Details

Passengers can enter traveler information such as:

* Full name
* Nationality
* Date of birth
* Passport number

For privacy reasons, passport numbers are **never stored in localStorage**.

---

### 🎟️ Booking Confirmation

After successful booking, users receive:

* Unique PNR code
* Boarding pass style confirmation
* Route timeline
* Travel class information

---

### 📦 My Bookings Dashboard

Users can manage their bookings by:

* Viewing previous reservations
* Rescheduling flights
* Cancelling bookings

A 2-hour cancellation restriction is enforced directly at the database level.

---

### 📡 Offline Support (PWA)

AeroJet works as a Progressive Web App with:

* Offline fallback page
* Cached assets
* Faster repeat visits
* Installable app experience

---

# 🛠️ Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | Next.js 14 (App Router)      |
| Language         | TypeScript                   |
| Database & Auth  | Supabase                     |
| State Management | Zustand + Persist Middleware |
| Styling          | Tailwind CSS                 |
| Animations       | GSAP + Three.js              |
| PWA              | next-pwa + Workbox           |
| Deployment       | Vercel                       |

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/WhisperedCloud/Aerojet_SouthAsia.git
cd aerojet
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file using the example file:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under:

`Project Settings → API`

---

# 🗄️ Supabase Setup

Open your Supabase project and run the SQL files in the following order.

## Step 1 — Create Database Schema

Run:

```bash
supabase/migrations/init_schema.sql
```

This creates:

* Tables
* Relationships
* RLS Policies
* RPC Functions
* Database triggers

---

## Step 2 — Seed Demo Flight Data

Run:

```bash
supabase/seed.sql
```

This inserts demo flights and seat layouts.

---

## Step 3 — Seed Demo Users

Run:

```bash
supabase/seed_users.sql
```

This creates demo accounts for testing.

---

# 🔐 Authentication Setup

In Supabase:

1. Go to **Authentication → Providers → Email**
2. Disable **Confirm Email** during development

This allows demo accounts to log in instantly.

---

# 📡 Enable Realtime

To make live seat updates work:

1. Go to **Database → Replication**
2. Enable Realtime for the `seats` table

---

# 👤 Demo Accounts

All demo accounts use the same password:

```txt
AeroJet#2026
```

| Name         | Email                                                         |
| ------------ | ------------------------------------------------------------- |
| Alex Turner  | [alex.turner@aerojet.demo](mailto:alex.turner@aerojet.demo)   |
| Sarah Chen   | [sarah.chen@aerojet.demo](mailto:sarah.chen@aerojet.demo)     |
| James Patel  | [james.patel@aerojet.demo](mailto:james.patel@aerojet.demo)   |
| Maria Santos | [maria.santos@aerojet.demo](mailto:maria.santos@aerojet.demo) |
| David Kim    | [david.kim@aerojet.demo](mailto:david.kim@aerojet.demo)       |

---

# 🧠 Zustand Store Structure

The project uses two Zustand stores.

---

## `useFlightStore`

Handles the active booking process:

* Search data
* Selected flight
* Seat selection
* Passenger form state
* Booking progress

Sensitive data like passport numbers are excluded from persistence.

---

## `useUserStore`

Handles:

* Authentication session
* Offline booking cache

Only the session token is persisted.

---

# 🗃️ Database Overview

## Main Tables

```txt
flights       → Flight schedules
seats         → Seat layouts per flight
bookings      → Confirmed reservations
passengers    → Traveler information
reschedules   → Booking reschedule history
```

---

# ⚙️ RPC Functions

The project uses PostgreSQL RPC functions for secure transactional operations.

| Function               | Purpose                               |
| ---------------------- | ------------------------------------- |
| `book_flight()`        | Locks seat and creates booking safely |
| `cancel_booking()`     | Cancels booking and frees seat        |
| `reschedule_booking()` | Swaps seats and logs reschedule       |

All seat operations use row-level locking (`FOR UPDATE`) to avoid race conditions.

---

# 📱 PWA Features

AeroJet supports Progressive Web App functionality including:

* Offline support
* Service worker caching
* Installable experience
* Faster loading performance

### Cache Strategy

* Static Assets → `CacheFirst`
* Flight APIs → `StaleWhileRevalidate`
* Bookings → Zustand runtime cache

---

# 📂 Project Structure

```txt
src/
├── app/
├── components/
├── lib/
├── store/
└── styles/

supabase/
├── migrations/
├── seed.sql
└── seed_users.sql
```

---

# 🧪 Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 🏗️ Production Build

```bash
npm run build
npm start
```

After building, you can verify the PWA service worker using:

```txt
Chrome DevTools → Application → Service Workers
```

---

# ✅ Project Highlights

* Realtime seat synchronization
* Offline booking support
* Secure transactional booking system
* Modern animated UI
* Fully responsive design
* Role-based database security using RLS
* Optimistic UI updates with Zustand
* Production-ready architecture

---

# 📌 Notes

* Passport numbers are never stored in localStorage
* All booking operations are protected using database transactions
* Supabase Row Level Security (RLS) protects all user data
* The browser only uses the public Supabase anon key
* Concurrent seat booking conflicts are safely handled

---

# 📎 Submission Checklist

* [x] Public GitHub Repository
* [x] README Documentation
* [x] Environment Variable Example
* [x] Supabase Migration Files
* [x] Seed Scripts
* [x] Zustand Store Architecture
* [x] Vercel Deployment Link
* [x] Lighthouse PWA Audit Screenshot
