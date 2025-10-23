# Budget Tracker App

A modern React TypeScript application for tracking personal finances with categories, transactions, and detailed analytics.

## Features

-   📊 **Dashboard**: Overview of income, expenses, and savings with charts
-   💰 **Transaction Management**: Add, edit, and delete transactions with categories
-   📁 **Category Organization**: Organize transactions into income, expense, and savings categories
-   📈 **Analytics**: Monthly/yearly filtering and financial summaries
-   🔄 **Real-time Updates**: Live data synchronization with Supabase
-   🎨 **Modern UI**: Built with Material-UI components

## Tech Stack

-   **Frontend**: React 18 + TypeScript + Vite
-   **State Management**: Zustand
-   **UI Library**: Material-UI (MUI)
-   **Database**: Supabase (PostgreSQL)
-   **Build Tool**: Vite
-   **Language**: TypeScript

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Dashboard, Transactions, Categories)
├── store/              # Zustand state management
├── db/                 # Database operations and schemas
├── assets/             # Static assets
└── types/              # TypeScript type definitions
```

## Setup Instructions

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd budget-app
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL from `supabase-schema.sql` to create tables and sample data
4. Get your project URL and anon key from Settings > API

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

The app uses two main tables:

-   **categories**: Income, expense, and savings categories with subcategories
-   **transactions**: Financial transactions linked to categories

See `supabase-schema.sql` for the complete schema definition.

## Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint

## Architecture

-   **Modular Components**: Each page is broken into smaller, reusable components
-   **Custom Hooks**: Business logic separated into custom hooks (useDashboardData, useMonthYearFilter)
-   **Database Layer**: Clean separation between UI and database operations
-   **Type Safety**: Full TypeScript coverage with proper type definitions
-   **State Management**: Centralized state with Zustand, async operations with loading states

## Planned features

### Core Expansions

-   **Planned Expenses & Budget Alerts**: Create planned expense lists with estimated costs, due dates, and budget alerts.
-   **Shopping List Integration**: Build categorized shopping lists that convert to transactions upon completion.
-   **Recurring & Subscription Tracking**: Manage recurring expenses and optimize subscriptions.

### Additional Features

-   **Goal-Based Savings**: Set savings goals with progress tracking and auto-allocations.
-   **Advanced Analytics & Insights**: AI-driven spending insights and trend analysis.
-   **Collaboration & Sharing**: Multi-user lists and shared accounts for families.
-   **Automation & Integrations**: Bank sync, voice commands, and third-party app connections.
-   **Gamification & Motivation**: Badges and challenges for financial goals.

## BUGS

-   Savings can't have negative value so it is not possible to use those funds
