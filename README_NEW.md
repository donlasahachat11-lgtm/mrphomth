# Mr.Promth - AI-Powered Web Development Platform

Transform your ideas into production-ready web applications using a chain of 7 specialized AI agents.

![Mr.Promth Banner](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=Mr.Promth+-+From+Prompt+to+Production)

## 🚀 Overview

Mr.Promth is an innovative platform that uses a sequential chain of 7 specialized AI agents to automatically generate complete, production-ready web applications from simple text prompts. Each agent is an expert in its domain, working together to handle every aspect of modern web development.

### Key Features

- **7-Agent Chain System**: Sequential AI agents that handle every aspect of development
- **Full-Stack Generation**: From database schema to deployment configs
- **Real-time Progress**: Watch as agents build your project step-by-step
- **Code Visualization**: Interactive code viewer with syntax highlighting
- **One-Click Deployment**: Deploy to Vercel, Netlify, or GitHub
- **Project Management**: Create, view, clone, and regenerate projects
- **Usage Tracking**: Monitor token usage and API calls
- **Multi-Tier Billing**: Free, Pro, and Enterprise plans

## 🤖 The 7 AI Agents

### 1. Prompt Expander & Analyzer
- Analyzes user prompts and requirements
- Expands vague ideas into detailed specifications
- Identifies features, pages, and tech stack needs
- **Output**: Comprehensive project specification

### 2. Architecture Designer
- Designs database schema with tables and relationships
- Plans RESTful API endpoints
- Creates folder structure and file organization
- Selects appropriate dependencies
- **Output**: Complete architecture blueprint

### 3. Database & Backend Developer
- Generates database migrations (SQL)
- Creates API routes (GET, POST, PUT, DELETE)
- Implements authentication and authorization
- Adds middleware (CORS, rate limiting, logging)
- **Output**: Backend code and database scripts

### 4. Frontend Component Developer
- Builds reusable React components
- Creates page layouts and navigation
- Implements responsive design
- Adds Tailwind CSS styling
- **Output**: Frontend components and pages

### 5. Integration & Logic Developer
- Connects frontend with backend APIs
- Implements state management (Zustand)
- Adds form validation and error handling
- Creates custom hooks for data fetching
- **Output**: Integration layer and business logic

### 6. Testing & Quality Assurance
- Generates unit tests (Jest)
- Creates integration tests for APIs
- Adds E2E tests (Playwright)
- Implements ESLint and accessibility checks
- **Output**: Comprehensive test suite

### 7. Optimization & Deployment
- Optimizes bundle size and performance
- Adds code splitting and lazy loading
- Creates deployment configs (Vercel, Docker, GitHub Actions)
- Generates documentation
- **Output**: Production-ready deployment package

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database and auth
- **VanchinAI** - AI model provider
- **Row Level Security** - Database security

### Tools & Infrastructure
- **Go** - CLI tool for advanced users
- **WebSocket** - Real-time communication
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Hosting and deployment
- **Docker** - Containerization
- **Jest** - Unit testing
- **Playwright** - E2E testing

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- Go 1.21+ (optional, for CLI tool)
- Supabase account
- VanchinAI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
   cd mrphomth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VANCHIN_API_KEY=your_vanchin_api_key
   ```

4. **Run database migrations**
   ```bash
   # Apply migrations in Supabase SQL Editor
   # Run files in database/migrations/ in order
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### CLI Tool Setup (Optional)

```bash
cd cli-tool
go build -o mr-promth-cli
./mr-promth-cli --help
```

## 🎯 Usage

### Web Interface

1. **Sign Up / Login**
   - Navigate to `http://localhost:3000`
   - Sign up with email or OAuth (Google, GitHub)

2. **Create Your First Project**
   - Go to Dashboard
   - Enter your project idea: *"Create a task management app with user authentication"*
   - Click "Generate"
   - Watch the 7 agents work sequentially

3. **Monitor Progress**
   - See real-time agent execution
   - View logs and outputs
   - Track completion percentage

4. **Review Generated Code**
   - Browse all generated files
   - View API routes, components, tests
   - Copy code snippets

5. **Deploy or Download**
   - One-click deploy to Vercel
   - Download complete source code
   - Clone for modifications

### CLI Tool

```bash
# Authenticate
./mr-promth-cli login

# Connect to platform
./mr-promth-cli connect

# Execute tools remotely
./mr-promth-cli tools execute --name browser --args "https://example.com"

# Logout
./mr-promth-cli logout
```

## 📊 Project Structure

```
mrphomth/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── app/                      # Protected app pages
│   │   ├── dashboard/            # Main dashboard
│   │   ├── projects/             # Project management
│   │   ├── billing/              # Billing and usage
│   │   └── settings/             # User settings
│   ├── admin/                    # Admin dashboard
│   └── api/                      # API routes
│       ├── agent-chain/          # Agent orchestration
│       ├── projects/             # Project CRUD
│       └── usage/                # Usage tracking
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components
│   ├── AgentChainProgress.tsx    # Agent progress display
│   ├── CodeViewer.tsx            # Code viewer component
│   └── DeploymentActions.tsx     # Deployment interface
├── lib/                          # Utility libraries
│   ├── agents/                   # Agent implementations
│   │   ├── agent1.ts             # Prompt Expander
│   │   ├── agent2.ts             # Architecture Designer
│   │   ├── agent3.ts             # Backend Developer
│   │   ├── agent4.ts             # Frontend Developer
│   │   ├── agent5.ts             # Integration Developer
│   │   ├── agent6.ts             # QA Engineer
│   │   ├── agent7.ts             # Deployment Expert
│   │   └── orchestrator.ts       # Agent orchestration
│   ├── database.ts               # Supabase client
│   ├── vanchin.ts                # VanchinAI integration
│   └── token-manager.ts          # Token tracking
├── cli-tool/                     # Go CLI application
│   ├── main.go
│   ├── cmd/                      # CLI commands
│   └── README.md
├── database/                     # Database files
│   ├── migrations/               # SQL migrations
│   └── README.md
├── __tests__/                    # Test files
│   ├── api/                      # API tests
│   ├── components/               # Component tests
│   └── lib/                      # Library tests
├── e2e/                          # E2E tests
│   ├── auth.spec.ts
│   └── project-creation.spec.ts
└── docs/                         # Documentation
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Deploy

### Docker

```bash
# Build
docker build -t mrphomth .

# Run
docker run -p 3000:3000 --env-file .env.production mrphomth
```

### Manual

```bash
# Build
npm run build

# Start
npm start
```

## 💳 Pricing

### Free Tier
- 3 projects per month
- 10,000 tokens per month
- Basic support
- Community access

### Pro Tier ($29/month)
- Unlimited projects
- 100,000 tokens per month
- Priority support
- Advanced features
- Custom domains

### Enterprise Tier ($99/month)
- Unlimited everything
- Dedicated support
- Custom integrations
- SLA guarantee
- Team collaboration
- Advanced analytics

## 📖 API Documentation

### Projects

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "My Project",
  "user_prompt": "Create a todo app with authentication"
}
```

#### Get Projects
```http
GET /api/projects
```

#### Get Project Details
```http
GET /api/projects/{id}
```

#### Download Project
```http
GET /api/projects/{id}/download
```

### Usage Tracking

#### Get Usage
```http
GET /api/usage?days=30
```

#### Track Usage
```http
POST /api/usage
Content-Type: application/json

{
  "tokens_used": 1000,
  "operation": "project_generation",
  "project_id": "optional-project-id"
}
```

## 🔒 Security

- **Authentication**: Supabase Auth with OAuth support
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Rate limiting and CORS protection
- **Encryption**: AES-256-GCM for sensitive data
- **Environment Security**: Never commit secrets
- **Input Validation**: Comprehensive validation on all inputs

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow TypeScript best practices
- Use Prettier for code formatting
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **VanchinAI** - AI model provider
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting platform
- **Next.js Team** - Amazing framework
- **Open Source Community** - For all the great tools

## 📧 Support

- **Documentation**: [docs.mrphomth.com](https://docs.mrphomth.com)
- **Email**: support@mrphomth.com
- **Discord**: [Join our community](https://discord.gg/mrphomth)
- **GitHub Issues**: [Report bugs](https://github.com/donlasahachat11-lgtm/mrphomth/issues)

## 🗺️ Roadmap

- [ ] Multi-language support (Python, Java, etc.)
- [ ] Custom agent configurations
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Plugin system for custom agents
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] Self-hosted option
- [ ] White-label solution

---

**Built with ❤️ by the Mr.Promth Team**

*From Prompt to Production in Minutes*
