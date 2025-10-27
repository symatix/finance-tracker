# Finance Tracker

A comprehensive React TypeScript application for collaborative financial management with multi-user accounts, email invitations, and detailed analytics.

## ✨ Features

### Core Financial Tracking

-   📊 **Interactive Dashboard**: Real-time overview of income, expenses, and savings with beautiful charts
-   💰 **Transaction Management**: Add, edit, and delete transactions with categorized organization
-   📁 **Smart Categories**: Organize transactions into income, expense, and savings categories with subcategories
-   📈 **Advanced Analytics**: Monthly/yearly filtering with financial summaries and trends
-   🔄 **Recurring Transactions**: Automated processing of recurring income and expenses
-   🛒 **Shopping Lists**: Create and manage shopping lists linked to expense categories
-   📅 **Planned Expenses**: Track upcoming expenses with priority levels and due dates

### 👥 Collaboration & Multi-User Features

-   🏠 **Shared Accounts**: Create family/household accounts for collaborative financial management
-   📧 **Email Invitations**: Send secure email invitations with role-based access control
-   👤 **User Roles**: Owner, Admin, Member, and Viewer roles with appropriate permissions
-   🔒 **Secure Sharing**: Row-level security ensures users only see authorized data
-   🤝 **Real-time Collaboration**: Live updates when team members make changes

### 🎨 User Experience

-   🎯 **Modern UI**: Built with Material-UI components and responsive design
-   ⚡ **Real-time Updates**: Live data synchronization with Supabase
-   📱 **Mobile-Friendly**: Responsive design that works on all devices
-   🎨 **Dark/Light Themes**: Automatic theme switching based on user preferences
-   🚀 **Fast Performance**: Optimized with Vite build system and efficient state management

## 🛠️ Tech Stack

-   **Frontend**: React 18 + TypeScript + Vite
-   **State Management**: Zustand with async operations
-   **UI Library**: Material-UI (MUI) with custom theming
-   **Database**: Supabase (PostgreSQL with real-time subscriptions)
-   **Authentication**: Supabase Auth with email/password and social logins
-   **Email Service**: Resend API for transactional emails
-   **Edge Functions**: Supabase Edge Runtime for serverless functions
-   **Build Tool**: Vite with TypeScript and ESLint
-   **Deployment**: GitHub Pages (or any static hosting)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main page components
│   ├── dashboard/      # Dashboard with charts and summaries
│   ├── transactions/   # Transaction management
│   ├── categories/     # Category organization
│   ├── family/         # Account management and collaboration
│   ├── planned/        # Planned expenses tracking
│   ├── recurring/      # Recurring transactions
│   ├── shopping/       # Shopping list management
│   └── help/           # Help and documentation
├── store/              # Zustand state management
├── db/                 # Database operations and schemas
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth, etc.)
├── utils/              # Utility functions
├── assets/             # Static assets and icons
└── types/              # TypeScript type definitions
supabase/
└── functions/          # Edge Functions for serverless operations
```

## 🚀 Quick Start

### Prerequisites

-   Node.js 18 or higher
-   npm or yarn package manager
-   Supabase account ([supabase.com](https://supabase.com))
-   Resend account ([resend.com](https://resend.com)) for email functionality

### 1. Clone and Install

```bash
git clone https://github.com/symatix/finance-tracker.git
cd finance-tracker
npm install
```

### 2. Supabase Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

#### Database Setup

1. Go to your project's **SQL Editor**
2. Copy and run the entire `database-setup.sql` file
3. This creates all tables, functions, policies, and indexes

#### Authentication Configuration

1. Go to **Authentication > Settings**
2. Configure your site URL: `https://symatix.github.io` (or your deployment URL)
3. Set up email templates if desired (optional - default templates work fine)

#### Environment Variables

1. Go to **Settings > Edge Functions**
2. Add these environment variables:
    ```
    RESEND_API_KEY=your_resend_api_key_here
    APP_URL=https://symatix.github.io/finance-tracker
    ```

### 3. Resend Email Setup

#### Create Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Verify your email and complete onboarding

#### Domain Verification

1. In Resend dashboard, go to **Domains**
2. Add domain: `symatix.github.io`
3. Follow DNS verification steps (add TXT records to your GitHub Pages settings)

#### Get API Key

1. Go to **API Keys** in Resend dashboard
2. Create a new API key
3. Copy the key for Supabase environment variables

### 4. Deploy Edge Function

#### Email Invitation Function

1. In Supabase dashboard, go to **Edge Functions**
2. Click **Create a new function**
3. Name: `send-invitation`
4. Copy the code from `supabase/functions/send-invitation/index.ts`
5. Deploy the function

### 5. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from **Settings > API** in your Supabase dashboard.

### 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app running locally.

### 7. Deploy to Production

#### GitHub Pages Deployment

1. Update `vite.config.ts` with your repository name
2. Push to GitHub main branch
3. Enable GitHub Pages in repository settings
4. Your app will be live at `https://yourusername.github.io/finance-tracker`

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with:

-   **Core Tables**: `categories`, `transactions`, `shopping_lists`, `list_items`, `recurring_transactions`, `planned_expenses`
-   **Collaboration**: `families`, `family_members` for multi-user accounts
-   **Invitations**: `invitations` table for email-based invites
-   **Security**: Row Level Security (RLS) policies for data protection

See `database-setup.sql` for the complete schema definition.

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**: Create your account with email and password
2. **Create Account**: Set up your first financial account (family/household)
3. **Add Categories**: Create income, expense, and savings categories
4. **Track Transactions**: Start adding your financial transactions
5. **Invite Members**: Add family members to collaborate

### Account Management

-   **Roles**: Owner (full control), Admin (manage members), Member (read/write), Viewer (read-only)
-   **Shared Resources**: Categories and transactions can be shared across account members
-   **Private Items**: Personal categories remain private to the creator

### Email Invitations

-   Send secure invitations via email
-   Invitations expire after 7 days
-   Recipients can accept invitations to join your account
-   Automatic role assignment upon acceptance

## 🔒 Security Features

-   **Row Level Security**: Database-level access control
-   **Authentication**: Secure user authentication with Supabase Auth
-   **Authorization**: Role-based permissions for shared resources
-   **Data Encryption**: All data encrypted in transit and at rest
-   **Secure Tokens**: Cryptographically secure invitation tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Run `npm run lint` and `npm run build` to ensure code quality
5. Commit your changes: `git commit -m 'Add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Supabase](https://supabase.com) for the amazing backend-as-a-service platform
-   [Material-UI](https://mui.com) for the beautiful component library
-   [Vite](https://vitejs.dev) for the lightning-fast build tool
-   [Resend](https://resend.com) for reliable email delivery

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Help & Guide](src/pages/help/) section in the app
2. Review this README for setup instructions
3. Open an issue on GitHub with detailed information
4. Check Supabase/Edge Function logs for server-side errors

---

**Happy financial tracking!** 💰📊

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
3. Run the SQL from `supabase-schema.sql` to create tables, functions, and sample data
4. Get your project URL and anon key from Settings > API

### 3. Set Up Automatic Recurring Transaction Processing

The app includes automatic processing of recurring transactions. To enable this:

**Option A: Supabase Edge Function (Recommended)**

1. Create an Edge Function in your Supabase dashboard called `process-recurring`
2. Copy the code from `db.supabase.edge-function.js`
3. **Set up scheduling:**
    - If you have **Cron** in Edge Functions menu: Create daily cron job at `0 2 * * *`
    - If no Cron: Use **Option B** (manual) or **Option C** (external service)
4. The function will automatically create transactions for due recurring items

**Option B: Manual Processing** Call the function manually when needed:

```sql
SELECT * FROM process_recurring_transactions();
```

**Option D: Database Function Cron Job**

If your Supabase plan supports database-level cron jobs:

1. Set up a cron job that calls the SQL function directly:
    ```sql
    SELECT * FROM process_recurring_transactions();
    ```
2. Schedule it to run daily (e.g., `0 2 * * *` for 2 AM daily)

**Note**: `calculate_next_due_date` is a helper function - don't call it directly for cron jobs.

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

-   **Goal-Based Savings**: Set savings goals with progress tracking and auto-allocations.
-   **Collaboration & Sharing**: Multi-user lists and shared accounts for families.
-   **Gamification & Motivation**: Badges and challenges for financial goals.
-   **Advanced Analytics & Insights**: AI-driven spending insights and trend analysis.
-   **Automation & Integrations**: Bank sync, voice commands, and third-party app connections.
