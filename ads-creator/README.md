# AI Product Photoshoot Creator

A modern web application that transforms your product images into beautiful professional photoshoots using OpenAI's image generation capabilities, with an interactive chat interface for making edits.

## Features

- **Easy Image Upload**: Drag and drop your product images
- **AI-Powered Enhancement**: Transform ordinary product photos into studio-quality images
- **Interactive Editing**: Use natural language to request specific edits through a chat interface
- **Modern UI**: Clean, responsive design with a light, colorful theme

## Getting Started

### Prerequisites

- Node.js (version 18.x or higher)
- OpenAI API key

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd ads-creator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your OpenAI API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Technologies Used

- Next.js 14
- React
- Tailwind CSS
- OpenAI API
- React Dropzone
- React Icons

## Usage Guide

1. **Upload your product image** by dragging and dropping or clicking on the upload area
2. Wait for the AI to generate an enhanced product photoshoot
3. Click "Edit with AI" to open the chat interface
4. Describe the changes you want (e.g., "Make the background blue" or "Add more dramatic lighting")
5. The image will update based on your instructions
6. Continue making edits until you're satisfied with the result

## Important Notes

- This application uses client-side API calls to OpenAI for demonstration purposes. In a production environment, you should use server-side API routes to keep your API key secure.
- Image generation may take several seconds depending on OpenAI's API response time.
- The OpenAI image generation API has usage limits and costs associated with it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Setup

This application uses Supabase for database functionality. Follow these steps to set up Supabase:

1. Create a Supabase account at [supabase.com](https://supabase.com) and create a new project

2. In the Supabase dashboard, go to SQL Editor and run the SQL commands from the `docs/supabase_setup.sql` file to create all required tables

3. Go to Project Settings > API to get your project URL and anon key

4. Copy these values to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. Configure storage buckets:
   - Go to Storage in the Supabase dashboard
   - Create two buckets: `original-images` and `generated-images`
   - Set appropriate permissions (public or authenticated access)

6. Restart your development server to apply the changes

### Database Structure

The application uses the following tables:

- **users**: Stores user account information
- **projects**: Stores ad campaigns or collections of images
- **generated_images**: Stores all generated AI images
- **tags**: Categorizes images for organization
- **image_tags**: Many-to-many relationship between images and tags
- **user_preferences**: Stores user UI preferences and settings
- **usage_records**: Tracks API usage for each user
- **subscription_plans**: Defines available subscription tiers
- **user_subscriptions**: Tracks user subscription status
- **edit_history**: Records all edits made to images

### Subscription System

The application includes a credit-based subscription system:
- Users start with the Free plan (10 credits/month)
- Users can upgrade to Pro (100 credits/month) or Business (500 credits/month)
- Each image generation consumes credits based on size and quality
- Credits reset monthly based on subscription date
