# Deployment Guide

This guide covers deploying Mr.Promth to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project created and configured
- ✅ VanchinAI API key
- ✅ Database migrations applied
- ✅ Environment variables configured
- ✅ Domain name (optional, but recommended)
- ✅ SSL certificate (for custom domains)

## Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# VanchinAI
VANCHIN_API_KEY=your-vanchin-api-key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Optional Variables

```env
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Make sure to add them for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add VANCHIN_API_KEY
   ```

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Configure DNS**
   - Add A record pointing to Vercel's IP
   - Or add CNAME record pointing to `cname.vercel-dns.com`

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation (can take up to 48 hours)

## Docker Deployment

### Build and Run

1. **Build Docker Image**
   ```bash
   docker build -t mrphomth:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     --name mrphomth \
     --env-file .env.production \
     mrphomth:latest
   ```

### Docker Compose

1. **Create `.env.production`**
   ```bash
   cp .env.local.example .env.production
   # Edit .env.production with production values
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop Services**
   ```bash
   docker-compose down
   ```

### Docker Hub

1. **Tag Image**
   ```bash
   docker tag mrphomth:latest yourusername/mrphomth:latest
   ```

2. **Push to Docker Hub**
   ```bash
   docker login
   docker push yourusername/mrphomth:latest
   ```

3. **Pull and Run on Server**
   ```bash
   docker pull yourusername/mrphomth:latest
   docker run -d -p 3000:3000 --env-file .env.production yourusername/mrphomth:latest
   ```

## Manual Deployment

### On Ubuntu/Debian Server

1. **Install Dependencies**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2 (Process Manager)
   sudo npm install -g pm2
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/mrphomth.git
   cd mrphomth
   ```

3. **Install Packages**
   ```bash
   npm ci --only=production
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   pm2 start npm --name "mrphomth" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/mrphomth
   sudo ln -s /etc/nginx/sites-available/mrphomth /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain Certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment

### 1. Database Migrations

```bash
# Run migrations on Supabase
# Go to Supabase Dashboard → SQL Editor
# Run migration files in order
```

### 2. Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": { "status": "healthy" },
    "authentication": { "status": "healthy" }
  }
}
```

### 3. Test Core Features

- ✅ User signup/login
- ✅ Create project
- ✅ Agent chain execution
- ✅ Code generation
- ✅ Deployment actions

### 4. Configure Monitoring

```bash
# Set up error tracking (Sentry)
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

## Monitoring

### Application Monitoring

1. **Vercel Analytics**
   - Automatically enabled for Vercel deployments
   - View at: Project → Analytics

2. **Custom Monitoring**
   ```typescript
   // lib/monitoring.ts
   export function trackEvent(name: string, data?: any) {
     // Send to your analytics service
   }
   ```

### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Database health
# Check Supabase dashboard

# API health
curl https://your-domain.com/api/projects
```

### Logs

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker logs mrphomth
```

**PM2:**
```bash
pm2 logs mrphomth
```

## Troubleshooting

### Build Failures

**Issue:** Build fails with "Module not found"
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Issue:** TypeScript errors
```bash
# Solution: Check types
npx tsc --noEmit
```

### Runtime Errors

**Issue:** 500 Internal Server Error
```bash
# Check logs
vercel logs
# or
docker logs mrphomth
```

**Issue:** Database connection failed
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

### Performance Issues

**Issue:** Slow response times
```bash
# Enable caching
# Add to next.config.js:
module.exports = {
  experimental: {
    optimizeCss: true,
  },
}
```

**Issue:** High memory usage
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Docker

```bash
# Stop current container
docker stop mrphomth

# Run previous version
docker run -d -p 3000:3000 --name mrphomth mrphomth:previous
```

### Manual

```bash
# Checkout previous version
git checkout [previous-commit]

# Rebuild
npm run build

# Restart
pm2 restart mrphomth
```

## Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Database RLS policies are active
- [ ] API keys are rotated regularly
- [ ] Backups are configured
- [ ] Monitoring is set up
- [ ] Error tracking is enabled

## Support

If you encounter issues during deployment:

- Check the [Troubleshooting](#troubleshooting) section
- Review logs for error messages
- Consult the [GitHub Issues](https://github.com/yourusername/mrphomth/issues)
- Contact support at support@mrphomth.com

---

**Happy Deploying! 🚀**
