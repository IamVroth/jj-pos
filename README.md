# JJ POS System

A Point of Sale (POS) system built with React and Supabase, designed for quick sales processing and customer management.

## Features

- Quick access POS UI for fast order processing
- Customer-specific pricing system
- Invoice and receipt printing
- Sales dashboard with analytics
- Single user authentication system

## Tech Stack

- React (Vite)
- Supabase (Backend and Database)
- Mantine UI (Component Library)
- React Router (Navigation)
- React Query (Data Fetching)
- Recharts (Charts and Analytics)
- React-to-print (Receipt Printing)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── layouts/       # Layout components
  ├── hooks/         # Custom hooks
  ├── lib/           # Utilities and configurations
  ├── services/      # API and service functions
  ├── contexts/      # React contexts
  └── types/         # TypeScript types
```
