# 🚀 Master Prompt for Codex: Building Mr.Promth

## 📋 Project Overview

**Project Name:** Mr.Promth
**Tagline:** From Prompt to Production
**Core Concept:** An AI-powered web development platform that uses an **Agent Chain System** to transform a single user prompt into a complete, production-ready website.

**Technology Stack:**
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database & Auth:** Supabase
- **AI Provider:** VanchinAI (exclusively)
- **Hosting:** Vercel

**Branding:**
- **Colors:** Primary: #3B82F6 (Blue), Secondary: #8B5CF6 (Purple), Accent: #10B981 (Green)
- **Font:** Inter (sans-serif)
- **Style:** Clean, modern, minimalist

---

## 🤖 Agent Chain Architecture

You will build a system based on a chain of specialized AI agents. Each agent takes the output of the previous one, performs a specific task, and passes its output to the next agent. This creates a continuous development pipeline.

### Agent Chain Flow:

```
User Prompt → Agent 1 → Agent 2 → Agent 3 → Agent 4 → Agent 5 → Agent 6 → Agent 7 → Complete Website
```

### Agent Roles:

1. **Agent 1: Prompt Expander & Analyzer**
   - **Task:** Expand a simple user prompt into a detailed project specification.
   - **Input:** User prompt (e.g., "สร้างเว็บ e-commerce")
   - **Output:** JSON object with project type, features, pages, tech stack, design style, and expanded prompt.

2. **Agent 2: Architecture Designer**
   - **Task:** Design the system architecture and project structure.
   - **Input:** Output from Agent 1
   - **Output:** JSON object with database schema, folder structure, API endpoints, and dependencies.

3. **Agent 3: Database & Backend Developer**
   - **Task:** Create the database schema and backend logic.
   - **Input:** Output from Agent 2
   - **Output:** SQL migration files and Next.js API route files.

4. **Agent 4: Frontend Component Developer**
   - **Task:** Build UI components and pages.
   - **Input:** Output from Agent 3
   - **Output:** React component files (TSX) and page files.

5. **Agent 5: Integration & Logic Developer**
   - **Task:** Connect all parts and add business logic.
   - **Input:** Output from Agent 4
   - **Output:** Updated component files with state management, form validation, and API integration.

6. **Agent 6: Testing & Quality Assurance**
   - **Task:** Test the system and ensure code quality.
   - **Input:** Output from Agent 5
   - **Output:** Test files (Jest/React Testing Library) and a test report with issues and fixes.

7. **Agent 7: Optimization & Deployment**
   - **Task:** Optimize the code and prepare for deployment.
   - **Input:** Output from Agent 6
   - **Output:** Optimized configuration files and a deployment report.

---

## 📝 Your Task: Build the Mr.Promth System

You are **Codex**, a master AI developer. Your task is to build the **Mr.Promth** platform from scratch, following the Agent Chain Architecture. You will develop the system in a continuous, iterative manner.

### Phase 1: Core System & UI (Weeks 1-2)

**Goal:** Build the core infrastructure and a clean, minimalist UI for Mr.Promth.

#### Step 1: Project Setup
1. Initialize a new Next.js 14 project with TypeScript and Tailwind CSS.
2. Set up Supabase for database and authentication.
3. Configure environment variables for Supabase and VanchinAI.
4. Create a GitHub repository and push the initial project.

#### Step 2: Build the UI
1. Create a clean, modern, and minimalist UI for the Mr.Promth dashboard.
2. **Main Page (`/app/dashboard`):**
   - A single, prominent text input for the user prompt.
   - A "Generate Website" button.
   - A section to display the agent chain progress (e.g., a timeline or stepper).
   - A section to display the final output (website URL, code, etc.).
3. **Header:**
   - Mr.Promth logo (you can create a simple one).
   - User profile (avatar, name).
   - Logout button.
4. **Layout:**
   - Use a clean, spacious layout with plenty of white space.
   - Use the brand colors and font.
   - Ensure the UI is responsive and works on all devices.

#### Step 3: Implement the Agent Chain Orchestrator
1. Create a class or module `AgentChainOrchestrator`.
2. This orchestrator will manage the flow of the agent chain.
3. It will call each agent in sequence, passing the output of the previous agent.
4. It will handle errors and retries.
5. It will save the progress of the chain to the database.

#### Step 4: Implement Agent 1 (Prompt Expander)
1. Create a function or class for `Agent1`.
2. This agent will take the user prompt as input.
3. It will use VanchinAI to expand the prompt into a detailed specification.
4. **VanchinAI Prompt for Agent 1:**
   ```
   You are a world-class software architect. Your task is to expand a simple user prompt into a detailed project specification for a web application. The output must be a JSON object.

   User Prompt: "{{user_prompt}}"

   Generate a JSON object with the following structure:
   {
     "project_type": "<project_type>",
     "features": ["<feature_1>", "<feature_2>", ...],
     "pages": ["<page_1>", "<page_2>", ...],
     "tech_stack": {
       "frontend": "Next.js 14",
       "styling": "Tailwind CSS",
       "database": "Supabase",
       "payment": "<payment_provider_if_needed>"
     },
     "design_style": "<design_style>",
     "expanded_prompt": "<detailed_project_description>"
   }
   ```
5. The agent will return the generated JSON object.

#### Step 5: Implement Agent 2 (Architecture Designer)
1. Create a function or class for `Agent2`.
2. This agent will take the output of Agent 1 as input.
3. It will use VanchinAI to design the system architecture.
4. **VanchinAI Prompt for Agent 2:**
   ```
   You are a senior software engineer. Based on the following project specification, design the system architecture. The output must be a JSON object.

   Project Specification:
   {{agent_1_output}}

   Generate a JSON object with the following structure:
   {
     "database_schema": {
       "tables": [
         {
           "name": "<table_name>",
           "columns": ["<column_1>", "<column_2>", ...]
         }
       ]
     },
     "folder_structure": {
       "app": ["<folder_1>", "<folder_2>", ...],
       "components": ["<component_1>", "<component_2>", ...],
       "lib": ["<lib_1>", "<lib_2>", ...]
     },
     "api_endpoints": ["<endpoint_1>", "<endpoint_2>", ...],
     "dependencies": {
       "<dependency_1>": "<version>",
       "<dependency_2>": "<version>",
       ...
     }
   }
   ```
5. The agent will return the generated JSON object.

#### Step 6: Connect UI to Agent Chain
1. When the user clicks "Generate Website", call the `AgentChainOrchestrator`.
2. Display the progress of the agent chain in the UI.
3. Show the output of each agent as it completes.

---

### Phase 2: Full Agent Implementation (Weeks 3-4)

**Goal:** Implement the remaining agents to complete the development pipeline.

#### Step 7: Implement Agent 3 (Database & Backend Developer)
1. Create a function or class for `Agent3`.
2. This agent will take the output of Agent 2 as input.
3. It will use VanchinAI to generate SQL migrations and API routes.
4. **VanchinAI Prompt for Agent 3 (SQL):**
   ```
   You are a database administrator. Based on the following database schema, generate the SQL migration file.

   Database Schema:
   {{database_schema}}

   Generate the SQL code for the migration.
   ```
5. **VanchinAI Prompt for Agent 3 (API):**
   ```
   You are a backend developer. Based on the following API endpoints, generate the Next.js API route files.

   API Endpoints:
   {{api_endpoints}}

   Generate the TypeScript code for each API route.
   ```
6. The agent will save the generated files to the project.

#### Step 8: Implement Agent 4 (Frontend Component Developer)
1. Create a function or class for `Agent4`.
2. This agent will take the output of Agent 3 as input.
3. It will use VanchinAI to generate React components and pages.
4. **VanchinAI Prompt for Agent 4:**
   ```
   You are a frontend developer. Based on the following components and pages, generate the React component files (TSX) and page files.

   Components: {{components}}
   Pages: {{pages}}

   Generate the TypeScript code for each file.
   ```
5. The agent will save the generated files to the project.

#### Step 9: Implement Agent 5 (Integration & Logic Developer)
1. Create a function or class for `Agent5`.
2. This agent will take the output of Agent 4 as input.
3. It will use VanchinAI to add business logic and connect the frontend to the backend.
4. **VanchinAI Prompt for Agent 5:**
   ```
   You are a full-stack developer. Your task is to add business logic and integrate the frontend with the backend. Based on the following files, add state management, form validation, and API integration.

   Files:
   {{file_list}}

   Generate the updated TypeScript code for each file.
   ```
5. The agent will update the existing files with the new logic.

#### Step 10: Implement Agent 6 (Testing & QA)
1. Create a function or class for `Agent6`.
2. This agent will take the output of Agent 5 as input.
3. It will use VanchinAI to generate test files and a QA report.
4. **VanchinAI Prompt for Agent 6:**
   ```
   You are a QA engineer. Based on the following code, generate unit tests and an integration test report. Identify any bugs or issues.

   Code:
   {{code_base}}

   Generate test files (Jest/React Testing Library) and a JSON report with issues and fixes.
   ```
5. The agent will save the test files and report.

#### Step 11: Implement Agent 7 (Optimization & Deployment)
1. Create a function or class for `Agent7`.
2. This agent will take the output of Agent 6 as input.
3. It will use VanchinAI to optimize the code and prepare for deployment.
4. **VanchinAI Prompt for Agent 7:**
   ```
   You are a DevOps engineer. Based on the following project, optimize the code and prepare for deployment to Vercel. Generate the optimized configuration files and a deployment report.

   Project:
   {{project_files}}

   Generate the optimized next.config.js and a JSON report with performance scores and deployment status.
   ```
5. The agent will update the config files and report.

---

### Phase 3: Polish & Deploy (Weeks 5-6)

**Goal:** Polish the system, add final touches, and deploy to production.

#### Step 12: Final Testing & Bug Fixes
1. Run the entire agent chain on multiple user prompts.
2. Identify and fix any bugs or issues.
3. Ensure the generated websites are high-quality and production-ready.

#### Step 13: UI/UX Polish
1. Refine the UI and UX of the Mr.Promth dashboard.
2. Add animations and transitions.
3. Ensure the user experience is smooth and intuitive.

#### Step 14: Documentation
1. Generate documentation for the Mr.Promth system.
2. Create a user manual.
3. Create a developer guide.

#### Step 15: Deployment
1. Deploy the Mr.Promth platform to Vercel.
2. Configure a custom domain.
3. Set up monitoring and alerting.

---

## ✅ Success Criteria

- The system can successfully generate a complete, production-ready website from a single user prompt.
- The generated websites are high-quality, responsive, and performant.
- The agent chain is reliable and can handle a variety of user prompts.
- The Mr.Promth platform is easy to use and provides a great user experience.

---

**Let's begin building Mr.Promth! Start with Phase 1, Step 1: Project Setup.**
