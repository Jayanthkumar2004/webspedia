# Webspedia — AI Tools Discovery & Review Platform

Webspedia is a modern, high-performance platform designed for discovering, comparing, reviewing, and managing top-rated AI tools. Built with a modern **3D Claymorphism Design System**, React, Vite, and Supabase.

---

## Key Features

- **3D Claymorphism UI/UX System**: Custom Porcelain Light & Obsidian Black dual-theme design tokens with tactile ambient shadow physics.
- **AI Tools Catalog & Search**: Instant multi-criteria keyword search, categorization, ratings, and PDF documentation downloads.
- **Editable Ad Banner Carousel**: Dynamic promotional banner slider manageable via the Admin Control Center.
- **Community Review System**: Interactive 5-star rating breakdown, nested discussion threads, and likes.
- **Real-Time Direct Messaging**: Split-pane messenger with dynamic Supabase Realtime Presence online indicators and WhatsApp-style single/double read ticks.
- **SaaS Admin Control Center**: Metrics overview, tool catalog CRUD, ad banner carousel controls, and user moderation (ban/unban controls).
- **Personal Tool Library**: Bookmark and save favorite AI tools for quick workflow access.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Emoji Picker React
- **Backend & Database**: Supabase (Auth, Postgres DB, Storage Buckets, Realtime Channels & Presence)
- **Styling**: Pure CSS Design Tokens with 3D Claymorphism Physics (`index.css`)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Jayanthkumar2004/webspedia.git
cd webspedia/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Database Setup (Supabase)
Create a project on [Supabase](https://supabase.com) and configure your environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## License

MIT License © 2026 Webspedia Team
