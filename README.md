# Mr.Prompt - Complete AI Chat Application

A modern, secure AI chat application with API key management, built with Next.js and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker (optional)

### Installation

1. **Clone and setup**
```bash
git clone <your-repo-url>
cd mrphomth-main
```

2. **Run setup script**
```bash
./scripts/setup.sh
```

3. **Run database migrations**
```bash
./scripts/migrate.sh
```

4. **Start AI Gateway**
```bash
cd services/ai-gateway
python app.py
```

5. **Start Next.js application**
```bash
cd ../..
npm run dev
```

6. **Access the application**
- App: http://localhost:3000
- API Gateway: http://localhost:8000

## 📋 Environment Configuration

### Required API Keys (to be filled by you):

**.env.local:**
```env
STREAMLAKE_API_KEY=your-streamlake-api-key-here
```

**services/ai-gateway/.env:**
```env
STREAMLAKE_API_KEY=your-streamlake-api-key-here
```

### Pre-configured Settings:
- ✅ Supabase database connection
- ✅ Encryption secrets (AES-256-GCM)
- ✅ AI Gateway configuration
- ✅ CORS settings
- ✅ Security headers
- ✅ Rate limiting
- ✅ Production-ready configuration

## 🏗️ Architecture

### Frontend (Next.js)
- Modern React application with TypeScript
- Tailwind CSS for styling
- Server-side rendering
- Authentication with Supabase
- Real-time chat interface

### Backend (Python FastAPI)
- AI Gateway service
- Streamlake API integration
- Database operations
- Security middleware
- Rate limiting and monitoring

### Database (Supabase/PostgreSQL)
- Encrypted API key storage
- Chat session management
- User preferences
- Prompt library
- RLS (Row Level Security)

## 🔧 Features

### Core Features
- [x] Secure API key management with encryption
- [x] Real-time chat interface
- [x] Multi-provider AI support
- [x] Chat history and sessions
- [x] User authentication and profiles
- [x] Prompt library management

### Security Features
- [x] AES-256-GCM encryption for API keys
- [x] Row Level Security (RLS)
- [x] CORS protection
- [x] Rate limiting
- [x] Secure environment configuration
- [x] Input validation and sanitization

### Developer Features
- [x] Automated setup script
- [x] Database migrations
- [x] Comprehensive documentation
- [x] Error handling and logging
- [x] Health checks and monitoring
- [x] Production deployment ready

## 📁 Project Structure

```
mrphomth-main/
├── app/                    # Next.js app directory
├── components/            # Reusable React components
├── cli/                   # Mr.Promth local agent runner CLI
├── services/             # Backend services
│   └── ai-gateway/       # Python FastAPI gateway
├── database/             # Database migrations
├── scripts/              # Utility scripts
├── docs/                 # Documentation
├── utils/                # Utility functions
├── .env.local           # Next.js environment variables
└── services/ai-gateway/.env  # Gateway environment variables
```

## 🧰 Local CLI (mr-promth)

The `cli/` directory contains the local agent runner used to authenticate with Supabase and connect your machine to the Mr.Promth agent chain.

### Install & Build

```bash
cd cli
npm install
npm run build
```

### Authenticate

```bash
# Interactive login (prompts for email & password)
node dist/index.js login

# Provide credentials via flags (use with caution, command history will include the password)
node dist/index.js login --email user@example.com --password "your-password"

# Override Supabase credentials if needed
node dist/index.js login --supabase-url https://xyzcompany.supabase.co --supabase-key your-anon-key
```

Successful authentication stores a session token in `~/.mrpromth/config.json`, along with your preferred API endpoint and working directory. The CLI reads Supabase credentials from the config file or from environment variables (`MRPROMTH_SUPABASE_URL`, `MRPROMTH_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### Connect to the Agent Orchestrator

```bash
# Connect using saved configuration
node dist/index.js connect

# Override WebSocket endpoint / project directory
node dist/index.js connect --api-url ws://localhost:3000/api/ws --project-dir ~/projects/demo
```

`connect` establishes a persistent WebSocket session with the backend orchestrator, streams command output in real-time, and executes tool commands (`writeFile`, `readFile`, `runCommand`) inside the configured project directory. Use `--reconnect` to enable automatic reconnection.

### Development Mode

```bash
# Run the CLI directly from TypeScript sources
npm run dev -- login
```

> Additional tooling (`mr-promth connect` subcommands for session diagnostics, deployment helpers, etc.) will follow as the orchestrator matures.

## 🛠️ Scripts

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

### Database
```bash
./scripts/migrate.sh     # Run migrations
./scripts/migrate.sh status  # Check migration status
```

### Setup
```bash
./scripts/setup.sh    # Complete setup (first time only)
```

## 🔍 Monitoring

### Health Checks
- App health: http://localhost:3000/health
- Gateway health: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics

### Logs
- App logs: `npm run dev`
- Gateway logs: `python app.py`

## 🚀 Production Deployment

### Environment Variables
All production environment variables are pre-configured in the .env files.
Just replace the placeholder API keys with your actual keys.

### Deployment Steps
1. Set production API keys in your hosting platform
2. Run migrations: `./scripts/migrate.sh`
3. Build: `npm run build`
4. Start: `npm run start`

### Supported Platforms
- Vercel (Next.js)
- Docker containers
- AWS/GCP/Azure
- Traditional server deployment

## 📖 Documentation

- [Setup Guide](docs/setup-guide.md) - Complete installation guide
- [API Documentation](docs/api.md) - API endpoints and usage
- [Security Guide](docs/security.md) - Security best practices
- [Deployment Guide](docs/deployment.md) - Production deployment

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [Issues](../../issues)
- [Discussions](../../discussions)
- [Documentation](docs/)

---

**Note:** This is a complete, production-ready application. All configuration is pre-set and ready for deployment. Just add your API keys and run the setup script!
