# Deploying Your Application to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account
- A [Stripe](https://stripe.com) account for payment processing
- An [OpenAI](https://openai.com) account for image generation

## Steps for Deployment

### 1. Set Up Database

#### Using Vercel Postgres
1. In your Vercel dashboard, create a new Postgres database
2. Vercel will automatically provide the connection string as an environment variable

### 2. Connect Your GitHub Repository
1. Push your code to GitHub
2. In Vercel, click "Add New Project"
3. Import your repository
4. Select "Next.js" as the framework preset

### 3. Configure Environment Variables
Add the following environment variables in your Vercel project settings:

- `POSTGRES_URL`: Automatically provided by Vercel Postgres
- `NEXTAUTH_SECRET`: Generate a random string for session security
- `NEXTAUTH_URL`: Your site's URL (e.g., `https://your-app.vercel.app`)
- `STRIPE_SECRET_KEY`: From your Stripe dashboard
- `STRIPE_WEBHOOK_SECRET`: Create a webhook in Stripe dashboard
- `NEXT_PUBLIC_BASE_URL`: Your site's URL (e.g., `https://your-app.vercel.app`)
- `OPENAI_API_KEY`: From your OpenAI account

### 4. Deploy
1. Click "Deploy"
2. Vercel will build and deploy your application

### 5. Final Setup
1. Set up Stripe webhooks to point to your deployed URL
2. Test the authentication, image generation, and payment flows

## Development Environment
For local development:
1. Create a `.env.local` file with placeholder values
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Troubleshooting
- If you encounter database errors, check your Postgres connection string
- For auth issues, verify your NEXTAUTH_SECRET and NEXTAUTH_URL
- For payment problems, check your Stripe webhook configuration 