# BOF Voting System

Mobile-first voting system for Birds of a Feather (BOF) sessions at a 3-day conference with gamification and real-time TV displays.

## 🚀 Features

- **Mobile-First Design** - Optimized for smartphones
- **Multi-Device Security** - One QR code = one user across all devices
- **Real-Time TV Display** - Beautiful results with charts and animations
- **Gamification** - Badges, achievements, and leaderboard
- **Secure Voting** - Device fingerprinting and session management

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Modern web browser

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Go to your Supabase project
2. Run the SQL from `supabase/schema.sql` in the SQL editor
3. This will create all tables, views, functions, and seed data

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bof-voting/
├── app/                      # Next.js App Router
│   ├── auth/                 # QR auth pages
│   ├── bof/                  # BOF session pages
│   ├── tv/                   # TV display pages
│   ├── admin/                # Admin panel
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── mobile/               # Mobile-specific components
│   ├── tv/                   # TV display components
│   └── shared/               # Shared components
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── services/             # Business logic services
│   ├── hooks/                # React hooks
│   ├── utils/                # Utility functions
│   └── types.ts              # TypeScript types
└── supabase/
    └── schema.sql            # Database schema
```

## 🔐 Security Features

### Multi-Device Protection

- Device fingerprinting using FingerprintJS
- Session tracking per device
- One vote per participant per BOF (regardless of device)
- IP address and user agent logging
- Admin audit trail

### Authentication Flow

1. User scans QR code with unique token
2. System generates device fingerprint
3. Session created/updated in database
4. Token stored in localStorage
5. All actions tracked in analytics

## 🎮 Gamification

### Achievements

- 🚀 **First Voter** - Voted first in a BOF session (50 pts)
- 💡 **First Topic** - Created first topic in a BOF session (50 pts)
- 🗳️ **Active Voter** - Voted in all 6 BOF sessions (100 pts)
- ✍️ **Topic Creator** - Created 3+ topics (75 pts)
- 🔥 **Popular Topic** - Topic received 10+ votes (150 pts)
- ⭐ **Top Five** - Topic made it to top 5 (200 pts)
- 🦋 **Social Butterfly** - Voted within first hour (30 pts)
- 🦉 **Night Owl** - Voted after 10 PM (25 pts)
- 🐦 **Early Bird** - Voted before 8 AM (25 pts)

### Leaderboard

Points calculated from:

- Topics created
- Votes received on topics
- Achievements earned

## 📱 Mobile Features

- Bottom navigation
- Pull-to-refresh
- Swipe gestures
- Offline detection
- Real-time updates

## 📺 TV Display Features

- Fullscreen results view
- Top 5 topics with rankings
- Live vote counts with animations
- Scrolling ticker of recent votes
- Bar charts showing vote distribution
- Auto-refresh every 10 seconds

## 🔧 Development

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **Charts:** Recharts
- **Animations:** Framer Motion
- **QR Generation:** qrcode
- **Device Fingerprinting:** FingerprintJS

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📖 API Routes

### Authentication

- `POST /api/auth/verify` - Verify token and create session
- `POST /api/auth/logout` - Logout and clear session

### Topics

- `GET /api/topics?bof_id={id}` - List topics for BOF
- `POST /api/topics` - Create new topic
- `GET /api/topics/{id}` - Get topic details

### Votes

- `POST /api/votes` - Cast/change vote
- `DELETE /api/votes/{id}` - Remove vote

### BOF Sessions

- `GET /api/bof/{id}` - Get BOF details
- `GET /api/bof/{id}/stats` - Get BOF statistics

### Achievements

- `GET /api/achievements` - List all achievements
- `GET /api/achievements/check` - Check and award achievements

### Leaderboard

- `GET /api/leaderboard` - Get participant rankings

### Admin

- `POST /api/qr-generate` - Generate QR codes for participants

## 🎨 Design System

Colors, typography, and component styles follow the shadcn/ui design system with customizations for mobile-first experience.

## 📄 License

MIT

## 👥 Contributing

Pull requests welcome! Please follow the existing code style and add tests for new features.
