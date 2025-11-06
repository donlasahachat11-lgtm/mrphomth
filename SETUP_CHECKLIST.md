# 📋 รายการตรวจสอบการติดตั้ง Mr.Prompt

## ✅ สิ่งที่มีอยู่แล้ว

- [x] โครงสร้างโปรเจกต์ Next.js
- [x] AI Gateway (FastAPI)
- [x] Database schema
- [x] UI Components
- [x] Security features (encryption, RLS)
- [x] Documentation
- [x] VanchinAI API keys (14 agents)

---

## ❌ สิ่งที่ยังขาดและต้องทำ

### 1. Supabase Setup

- [ ] **สร้าง Supabase Project**
  - ไปที่ https://supabase.com
  - สร้างโปรเจกต์ใหม่
  - จดบันทึก:
    - Project URL: `https://xxxxx.supabase.co`
    - Anon Key: `eyJhbGc...`
    - Service Role Key: `eyJhbGc...`

- [ ] **รัน Database Migrations**
  ```bash
  # ใน Supabase Dashboard > SQL Editor
  # รันโค้ดจากไฟล์ database/migrations/001_initial_schema.sql
  ```

### 2. Environment Variables Setup

#### 2.1 Frontend Environment (`.env.local`)

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลัก:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

#### 2.2 Backend Environment (`services/ai-gateway/.env`)

สร้างไฟล์ `services/ai-gateway/.env`:

```bash
# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Gateway Security
GATEWAY_API_KEY="your-strong-secret-key-here"
ENCRYPTION_KEY="your-32-byte-encryption-key-here"

# VanchinAI Configuration
VANCHIN_API_BASE="https://vanchin.streamlake.ai/api/gateway/v1/endpoints"

# OpenAI & Anthropic (optional)
OPENAI_API_BASE="https://api.openai.com/v1"
ANTHROPIC_API_BASE="https://api.anthropic.com"

# Server
PORT=8000
CORS_ORIGINS="http://localhost:3000"
```

**วิธีสร้าง Keys:**

```bash
# สร้าง GATEWAY_API_KEY
openssl rand -base64 32

# สร้าง ENCRYPTION_KEY (32 bytes)
openssl rand -hex 32
```

### 3. Dependencies Installation

- [ ] **ติดตั้ง Node.js Dependencies**
  ```bash
  cd /home/ubuntu/mrphomth
  npm install
  ```

- [ ] **ติดตั้ง Python Dependencies**
  ```bash
  cd services/ai-gateway
  pip3 install -r requirements.txt
  ```

### 4. Code Modifications for VanchinAI

- [ ] **แก้ไข `services/ai-gateway/app/core/config.py`**
  
  เพิ่ม:
  ```python
  vanchin_api_base: str = Field(
      default="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
      env="VANCHIN_API_BASE"
  )
  ```

- [ ] **แก้ไข `services/ai-gateway/app/api/routes.py`**
  
  1. เพิ่ม "vanchin" ใน provider list (บรรทัด 46)
  2. เพิ่มฟังก์ชัน `_vanchin_completion()` และ `_vanchin_stream()`
  3. อัพเดต `_normalize_provider()` เพื่อรองรับ "vanchin"
  4. อัพเดต `_select_completion_callable()` และ `_select_stream_callable()`

### 5. Testing

- [ ] **ทดสอบ VanchinAI API แยก**
  ```bash
  cd /home/ubuntu/mrphomth
  python3 test_vanchin_api.py
  ```

- [ ] **ทดสอบ AI Gateway**
  ```bash
  cd services/ai-gateway
  python3 -m app
  # หรือ
  uvicorn app.main:app --reload --port 8000
  ```

- [ ] **ทดสอบ Frontend**
  ```bash
  cd /home/ubuntu/mrphomth
  npm run dev
  ```

- [ ] **เข้าถึงแอปพลิเคชัน**
  - Frontend: http://localhost:3000
  - AI Gateway: http://localhost:8000
  - Health Check: http://localhost:8000/health

### 6. Database Operations

- [ ] **สร้าง User Account**
  - ไปที่ http://localhost:3000/signup
  - สร้างบัญชีผู้ใช้

- [ ] **เพิ่ม API Keys**
  - Login เข้าระบบ
  - ไปที่ Settings > API Keys
  - เพิ่ม VanchinAI API keys (ใช้ข้อมูลจาก `vanchin_keys.json`)

### 7. Production Deployment (Optional)

- [ ] **ตั้งค่า Environment Variables บน Hosting Platform**
- [ ] **Build Production**
  ```bash
  npm run build
  ```
- [ ] **Deploy AI Gateway**
  - Deploy บน server หรือ container
  - ตั้งค่า reverse proxy (nginx)
- [ ] **Deploy Frontend**
  - Deploy บน Vercel/Netlify/ของคุณเอง

---

## 🔑 VanchinAI API Keys Reference

ดูรายละเอียดใน `vanchin_keys.json`:
- มี 14 agents
- แต่ละ agent มี API key และ endpoint ID
- Base URL: `https://vanchin.streamlake.ai/api/gateway/v1/endpoints`

---

## 📝 Notes

### การใช้ VanchinAI API

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
    api_key="WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
)

completion = client.chat.completions.create(
    model="ep-lpvcnv-1761467347624133479",  # endpoint ID, not model name
    messages=[
        {"role": "system", "content": "You are an AI assistant"},
        {"role": "user", "content": "Hello!"},
    ],
)
```

### ความแตกต่างจาก OpenAI
- **Model Parameter**: ใช้ endpoint ID (`ep-xxxxx`) แทน model name (`gpt-4`)
- **Base URL**: ใช้ VanchinAI URL แทน OpenAI URL
- **API Format**: เหมือน OpenAI (OpenAI-compatible)

---

## 🆘 Troubleshooting

### ปัญหาที่อาจพบ

1. **Database connection error**
   - ตรวจสอบ Supabase URL และ keys
   - ตรวจสอบว่ารัน migrations แล้ว

2. **CORS error**
   - ตรวจสอบ `CORS_ORIGINS` ใน AI Gateway .env
   - ตรวจสอบว่า Frontend และ Backend รันอยู่

3. **API key encryption error**
   - ตรวจสอบ `ENCRYPTION_KEY` มีความยาว 32 bytes (64 hex characters)

4. **VanchinAI API error**
   - ทดสอบด้วย `test_vanchin_api.py` ก่อน
   - ตรวจสอบว่า API key ถูกต้อง
   - ตรวจสอบว่า endpoint ID ถูกต้อง

---

## 📊 ความคืบหน้าโดยรวม

- ✅ โครงสร้างโค้ด: **100%**
- ❌ Configuration: **0%**
- ❌ Dependencies: **0%**
- ❌ VanchinAI Integration: **0%**
- ❌ Testing: **0%**

**ความสมบูรณ์โดยรวม: ~70%** (ขาดแค่ configuration และ integration)

---

## 🎯 Next Steps

1. สร้าง Supabase project
2. ตั้งค่า environment variables
3. ติดตั้ง dependencies
4. แก้ไขโค้ดเพื่อรองรับ VanchinAI
5. ทดสอบระบบ
6. Deploy (ถ้าต้องการ)
