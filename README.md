# AI Image Generator

An application for generating and editing professional product images using AI, with a credit-based system for managing image generation.

## Features

- Generate professional product images using AI
- Edit and refine images with AI
- Credit system for usage tracking
- Stripe integration for purchasing credits
- User authentication with Next.js and NextAuth
- Vercel Postgres for database storage

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API routes, Vercel Serverless Functions
- **Database**: Vercel Postgres
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Stripe account for payment processing
- Vercel account for hosting and database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/BeingRishi69/AIImage-Generator.git
   cd AIImage-Generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # App
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Database (Vercel Postgres)
   POSTGRES_URL=your-postgres-url
   POSTGRES_HOST=your-postgres-host
   POSTGRES_DATABASE=your-postgres-database
   POSTGRES_USER=your-postgres-user
   POSTGRES_PASSWORD=your-postgres-password

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key

   # Stripe
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This application is designed to be deployed on Vercel. Follow these steps:

1. Push your code to GitHub
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Configure the environment variables
5. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details. 