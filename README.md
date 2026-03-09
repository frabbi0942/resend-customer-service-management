# HelpDesk - Customer Service Management

Open-source customer service management system powered by [Resend](https://resend.com). Built for startups that want a lightweight, self-hostable helpdesk without the cost of enterprise tools.

## How It Works

1. Customers send emails to your support address (e.g., `support@yourdomain.com`)
2. Resend receives the email and forwards it to your app via webhook
3. A ticket is automatically created and assigned to an available team member
4. Your team replies from the dashboard — replies are sent via Resend back to the customer
5. The full conversation is threaded in one place

## Features

- **Email-to-Ticket**: Incoming emails via Resend webhooks automatically create support tickets
- **Auto-Assignment**: Tickets are assigned to team members via round-robin or least-loaded strategy
- **Threaded Conversations**: Full email thread between customer and support team
- **Internal Notes**: Add private notes visible only to your team
- **Canned Responses**: Pre-built reply templates for common questions
- **Labels & Priority**: Categorize and prioritize tickets
- **Status Workflow**: Open → In Progress → Resolved → Closed
- **Team Management**: Add team members, toggle availability for auto-assignment
- **Dark Mode**: System-aware with manual toggle
- **Keyboard Shortcuts**: Press `?` to see all shortcuts
- **Mobile Responsive**: Works on any screen size

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** with custom UI components
- **PostgreSQL** via Prisma ORM
- **Clerk** for authentication
- **Resend** for sending and receiving emails
- **Svix** for webhook verification

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- [Clerk](https://clerk.com) account
- [Resend](https://resend.com) account with a domain configured for receiving

### 1. Clone and install

```bash
git clone https://github.com/your-username/resend-customer-service-management.git
cd resend-customer-service-management
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/resend_csm"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"

RESEND_API_KEY="re_..."
RESEND_WEBHOOK_SECRET="whsec_..."
RESEND_FROM_EMAIL="support@yourdomain.com"
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Configure Resend webhook

1. Go to [Resend Dashboard](https://resend.com/webhooks) → Webhooks
2. Add a new webhook pointing to `https://your-app-url/api/webhooks/resend`
3. Select the `email.received` event type
4. Copy the signing secret to `RESEND_WEBHOOK_SECRET` in your `.env`

### 5. Set up receiving domain

1. Go to Resend Dashboard → Domains → Add Domain
2. Configure DNS records as instructed
3. Enable receiving on the domain

### 6. Add users in Clerk

This app has no sign-up flow by design. Add team members directly in your [Clerk Dashboard](https://dashboard.clerk.com) under Users.

### 7. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `g t` | Go to Tickets |
| `g d` | Go to Dashboard |
| `g s` | Go to Settings |
| `g m` | Go to Team |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed default data |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT
