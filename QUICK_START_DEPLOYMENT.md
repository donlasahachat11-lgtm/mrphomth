# 🚀 Mr.Promth - Quick Start Deployment Guide

คู่มือการ deploy Mr.Promth ไปยัง production อย่างรวดเร็ว

---

## ✅ สิ่งที่ทดสอบแล้วบน Sandbox

- ✅ Build สำเร็จ (ไม่มี TypeScript errors)
- ✅ Production server รันได้ปกติ
- ✅ Ready time: ~339ms
- ✅ Total routes: 40+ routes
- ✅ Bundle size: ~87.3 kB

---

## 📋 Prerequisites (สิ่งที่ต้องมีก่อน Deploy)

### 1. Supabase Project
คุณมี Supabase project อยู่แล้วที่: `https://supabase.com/dashboard/project/xcwkwdoxrbzzpwmlqswr`

**ต้องทำ:**
- [ ] รัน database migrations (ไฟล์ใน `database/migrations/`)
- [ ] เปิดใช้งาน Authentication
- [ ] ตั้งค่า RLS policies
- [ ] เก็บ credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 2. VanchinAI API Key
- [ ] สมัคร/Login ที่ https://api.vanchin.ai
- [ ] สร้าง API key
- [ ] เก็บ `VANCHIN_API_KEY`

### 3. GitHub Repository
- [ ] Repository: `donlasahachat11-lgtm/mrphomth`
- [ ] Branch: `phase-1-foundation` (pushed แล้ว)

---

## 🎯 Option 1: Deploy to Vercel (แนะนำ - ง่ายที่สุด)

### ขั้นตอนที่ 1: เตรียม Repository

```bash
# Pull latest changes
cd /path/to/your/mrphomth
git pull origin phase-1-foundation

# หรือ clone ใหม่
git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
cd mrphomth
git checkout phase-1-foundation
```

### ขั้นตอนที่ 2: Deploy ผ่าน Vercel Dashboard

1. **ไปที่ https://vercel.com**
2. **Login/Signup** ด้วย GitHub account
3. **Click "New Project"**
4. **Import Repository:**
   - เลือก `donlasahachat11-lgtm/mrphomth`
   - Branch: `phase-1-foundation`
5. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   VANCHIN_API_KEY=your-vanchin-api-key-here
   ```
7. **Click "Deploy"**
8. **รอ 2-3 นาที** - Vercel จะ build และ deploy ให้อัตโนมัติ
9. **เสร็จแล้ว!** คุณจะได้ URL เช่น `https://mrphomth.vercel.app`

### ขั้นตอนที่ 3: ตรวจสอบ Deployment

```bash
# Test health check
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "database": { "status": "healthy" },
    "authentication": { "status": "healthy" }
  }
}
```

---

## 🎯 Option 2: Deploy ด้วย Vercel CLI

### ขั้นตอนที่ 1: ติดตั้ง Vercel CLI

```bash
npm i -g vercel
```

### ขั้นตอนที่ 2: Login

```bash
vercel login
```

### ขั้นตอนที่ 3: Deploy

```bash
cd /path/to/mrphomth

# Preview deployment
vercel

# Production deployment
vercel --prod
```

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

```bash
# เพิ่ม env variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ใส่ค่า: https://xcwkwdoxrbzzpwmlqswr.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ใส่ค่า: your-anon-key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# ใส่ค่า: your-service-role-key

vercel env add VANCHIN_API_KEY
# ใส่ค่า: your-vanchin-api-key

# Deploy อีกครั้งเพื่อใช้ env variables
vercel --prod
```

---

## 🎯 Option 3: Deploy บน Server ของคุณเอง

### ขั้นตอนที่ 1: เตรียม Server (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง PM2
sudo npm install -g pm2

# ติดตั้ง Nginx
sudo apt install -y nginx
```

### ขั้นตอนที่ 2: Clone และ Build

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
cd mrphomth
sudo git checkout phase-1-foundation

# สร้าง .env.local
sudo nano .env.local
```

**เพิ่มใน .env.local:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VANCHIN_API_KEY=your-vanchin-api-key-here
NODE_ENV=production
```

```bash
# ติดตั้ง dependencies
sudo npm ci --only=production

# Build
sudo npm run build

# เปลี่ยน ownership
sudo chown -R $USER:$USER /var/www/mrphomth
```

### ขั้นตอนที่ 3: รันด้วย PM2

```bash
# Start with PM2
pm2 start npm --name "mrphomth" -- start

# Save PM2 configuration
pm2 save

# Auto-start on boot
pm2 startup
# ทำตามคำสั่งที่แสดง

# ตรวจสอบสถานะ
pm2 status
pm2 logs mrphomth
```

### ขั้นตอนที่ 4: ตั้งค่า Nginx

```bash
# สร้าง Nginx config
sudo nano /etc/nginx/sites-available/mrphomth
```

**เพิ่มใน config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # เปลี่ยนเป็น domain ของคุณ

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mrphomth /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### ขั้นตอนที่ 5: ติดตั้ง SSL (Let's Encrypt)

```bash
# ติดตั้ง Certbot
sudo apt install -y certbot python3-certbot-nginx

# ขอ SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 🎯 Option 4: Deploy ด้วย Docker

### ขั้นตอนที่ 1: ติดตั้ง Docker

```bash
# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ติดตั้ง Docker Compose
sudo apt install -y docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### ขั้นตอนที่ 2: สร้าง .env.production

```bash
cd /path/to/mrphomth
nano .env.production
```

**เพิ่มใน .env.production:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xcwkwdoxrbzzpwmlqswr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VANCHIN_API_KEY=your-vanchin-api-key-here
NODE_ENV=production
```

### ขั้นตอนที่ 3: Build และ Run

```bash
# Build Docker image
docker build -t mrphomth:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --name mrphomth \
  --env-file .env.production \
  --restart unless-stopped \
  mrphomth:latest

# ตรวจสอบ logs
docker logs -f mrphomth

# ตรวจสอบสถานะ
docker ps
```

### หรือใช้ Docker Compose:

```bash
# Start services
docker-compose up -d

# ดู logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 📊 Post-Deployment Checklist

หลังจาก deploy แล้ว ตรวจสอบสิ่งเหล่านี้:

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

**Expected:**
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "authentication": { "status": "healthy" }
  }
}
```

### 2. ทดสอบ Authentication
- [ ] เปิด `https://your-domain.com/login`
- [ ] ลอง signup ด้วย email
- [ ] ลอง login
- [ ] ตรวจสอบว่า redirect ไป `/app/dashboard` ได้

### 3. ทดสอบ Project Creation
- [ ] ไปที่ Dashboard
- [ ] กด "Create New Project"
- [ ] ใส่ prompt
- [ ] ตรวจสอบว่า Agent Chain ทำงาน
- [ ] ดูผลลัพธ์

### 4. ตรวจสอบ Database
- [ ] เปิด Supabase Dashboard
- [ ] ตรวจสอบตาราง `users`
- [ ] ตรวจสอบตาราง `projects`
- [ ] ดู RLS policies ว่าทำงาน

### 5. ตรวจสอบ Logs
```bash
# Vercel
vercel logs

# PM2
pm2 logs mrphomth

# Docker
docker logs mrphomth
```

---

## 🔧 Troubleshooting

### ปัญหา: Build Failed

**แก้ไข:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### ปัญหา: Database Connection Error

**แก้ไข:**
1. ตรวจสอบ environment variables
2. ตรวจสอบ Supabase project ว่า active
3. ตรวจสอบ RLS policies

### ปัญหา: 500 Internal Server Error

**แก้ไข:**
```bash
# ดู logs
# Vercel: vercel logs
# PM2: pm2 logs mrphomth
# Docker: docker logs mrphomth

# ตรวจสอบ env variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### ปัญหา: Agent Chain ไม่ทำงาน

**แก้ไข:**
1. ตรวจสอบ `VANCHIN_API_KEY`
2. ตรวจสอบ API quota
3. ดู logs ที่ `/api/agent-chain`

---

## 📱 Custom Domain (Vercel)

### ขั้นตอนที่ 1: เพิ่ม Domain

1. ไปที่ Vercel Dashboard → Project Settings → Domains
2. กด "Add Domain"
3. ใส่ domain ของคุณ เช่น `mrphomth.com`

### ขั้นตอนที่ 2: ตั้งค่า DNS

**Option A: Nameservers (แนะนำ)**
- ไปที่ domain registrar ของคุณ
- เปลี่ยน nameservers เป็น:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

**Option B: A Record**
- เพิ่ม A record:
  - Name: `@`
  - Value: `76.76.21.21`

**Option C: CNAME**
- เพิ่ม CNAME record:
  - Name: `www`
  - Value: `cname.vercel-dns.com`

### ขั้นตอนที่ 3: รอ DNS Propagation

- รอ 24-48 ชั่วโมง
- Vercel จะออก SSL certificate อัตโนมัติ
- ตรวจสอบที่ https://your-domain.com

---

## 🎉 เสร็จแล้ว!

คุณได้ deploy Mr.Promth สำเร็จแล้ว! 🚀

**Next Steps:**
1. ทดสอบทุกฟีเจอร์
2. เชิญทีมมาใช้งาน
3. Monitor logs และ performance
4. Setup monitoring (Sentry, LogRocket)
5. Configure analytics (Google Analytics)

---

## 📞 ต้องการความช่วยเหลือ?

- **Documentation**: `README_NEW.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **GitHub Issues**: https://github.com/donlasahachat11-lgtm/mrphomth/issues

---

**Happy Deploying! 🎊**
