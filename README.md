# Mr.Prompt: AI-Powered Project Generator

**MrMr.Prompt is a revolutionary AI-powered platform that generates complete, production-ready web projects from a single natural language prompt. Describe your project, and our autonomous AI agents will handle everything from backend code and database schemas to frontend components and deployment.



## ✨ Features

- **AI-Powered Code Generation**: Utilizes 19 advanced AI models to generate high-quality, human-readable code.
- **Full-Stack Projects**: Creates complete Next.js projects with backend APIs, database migrations, and frontend components.
- **Autonomous AI Agents**: A team of 7 specialized AI agents work together to build your project:
  - **Agent 1: Prompt Analysis**: Understands your requirements.
  - **Agent 2: Requirements Expansion**: Creates detailed specifications.
  - **Agent 3: Backend Generator**: Generates API routes and database schemas.
  - **Agent 4: Frontend Generator**: Builds React components and pages.
  - **Agent 5: Testing & QA**: Generates automated tests.
  - **Agent 6: Deployment**: Deploys your project to Vercel.
  - **Agent 7: Monitoring**: Sets up health checks and monitoring.
- **Real-time Workflow**: Watch your project being built in real-time with our live progress tracking and logs.
- **Production-Ready**: Generated projects include authentication, rate limiting, security headers, and more.
- **Downloadable & Deployable**: Download your project as a ZIP file or deploy it directly to Vercel.

## 🚀 Getting Started

Follow these steps to get Mr. Prompt up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Python](https://www.python.org/) (v3.10 or later)
- [Docker](https://www.docker.com/) (optional, for database)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
   cd mrphomth
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add the following:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Vanchin AI
   VC_API_KEY=your-vanchin-api-key

   # Vercel
   VERCEL_TOKEN=your-vercel-token
   VERCEL_TEAM_ID=your-vercel-team-id

   # GitHub
   GITHUB_TOKEN=your-github-token
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

##  workflow

1. **Go to the `/generate` page.**
2. **Enter your project name and a detailed prompt.**
3. **Click "Generate Project".**
4. **Watch the real-time progress as the AI agents build your project.**
5. **Once completed, download your project or view the deployment.**

## 🛠️ Built With

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.io/)
- **AI**: [Vanchin AI](https://www.vanchin.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to learn how you can get involved.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
