# Deployment Guide

This guide provides instructions for deploying the Mr. Prompt application to Vercel.

## Deploying to Vercel

Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with Next.js applications.

### 1. Sign up for Vercel

If you don't have a Vercel account, sign up for a free account at [vercel.com](https://vercel.com/).

### 2. Import Your Git Repository

1.  From your Vercel dashboard, click on **Add New... > Project**.
2.  Connect your Git provider (GitHub, GitLab, or Bitbucket) where your forked repository is located.
3.  Select the `mrphomth` repository.

### 3. Configure Your Project

Vercel will automatically detect that you are deploying a Next.js application and configure the build settings for you. The most important step is to add the required environment variables.

#### Adding Environment Variables

In the **Configure Project** screen, expand the **Environment Variables** section and add the following variables:

| Name                          | Value                 |
| ----------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`    | Your Supabase URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key|

You can find these values in your Supabase project dashboard under **Project Settings > API**.

![Vercel Environment Variables](https://i.imgur.com/YOUR_ENV_VAR_SCREENSHOT.png) <!-- Replace with an actual screenshot -->

### 4. Deploy

Click the **Deploy** button. Vercel will start the build and deployment process. Once the deployment is complete, you will be provided with a public URL for your application.

### 5. (Optional) Fixing PNPM Version Issues

The build log indicates a potential version mismatch for `pnpm`. While Vercel attempts to use a newer version, it's best practice to lock the version used in your project to what is expected by your `pnpm-lock.yaml` file.

To ensure Vercel uses the correct `pnpm` version, you can create a `vercel.json` file in the root of your project with the following content:

```json
{
  "packageManager": "pnpm@9.x"
}
```

Commit this file to your repository. Vercel will automatically detect this configuration and use the specified `pnpm` version for subsequent builds.

## Troubleshooting

- **Build Failures**: The most common cause of build failures is missing environment variables. Double-check that you have correctly added the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables in your Vercel project settings.
- **Serverless Function Errors**: If you encounter errors with serverless functions, check the function logs in your Vercel dashboard for more details.

