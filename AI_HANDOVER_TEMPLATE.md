# AI Handover & Startup Template: Mr.Prompt Project

**Objective:** Guide the next AI agent to seamlessly continue development, automate its workflow, and push the Mr.Prompt project to 100% production readiness.

---

## 📋 Part 1: Startup Command for Next AI Session

*Copy and paste the following text as the **very first prompt** in the new chat session.*

```text
**Project:** Mr.Prompt - Final Push to Production

**Objective:** Your mission is to bring the Mr.Prompt project to 100% production readiness. You must work autonomously, creating and executing a continuous development plan until all tasks in the roadmap are complete. Your work is critical for the final launch.

**Project Info:**
- **Repository:** donlasahachat11-lgtm/mrphomth
- **Branch:** main
- **Latest Commit:** [AI, please find and insert the latest commit hash here]
- **Production URL:** https://mrphomth.vercel.app

**Critical Instructions:**
1.  **Read First:** Before taking any action, you MUST read the following documents in order to understand the project state and your mission:
    - `/home/ubuntu/mrphomth/COMPREHENSIVE_ANALYSIS_NOV_2025.md` (Your primary mission guide)
    - `/home/ubuntu/mrphomth/AI_HANDOVER_TEMPLATE.md` (This file)

2.  **Automated Workflow:** You are expected to work in a continuous, automated loop:
    - **Plan:** Create a detailed, multi-phase plan based on the Development Roadmap in the analysis document.
    - **Execute:** Complete each task in the plan systematically.
    - **Report:** Provide clear, concise progress updates after each major task.
    - **Loop:** Continue this cycle until all roadmap tasks are complete.

3.  **Environment Variables:** All necessary API keys and environment variables are provided below. You must configure them as needed.

4.  **Pre-flight Checklist:** Before you begin coding, complete the pre-flight checklist in `AI_HANDOVER_TEMPLATE.md` to ensure your environment is correctly set up.

**Your First Task:**
1.  Clone the repository.
2.  Read the mandatory documents.
3.  Perform the pre-flight checklist.
4.  Create your initial multi-phase development plan based on the roadmap.
5.  Begin executing Phase 1 of your plan.

Begin now. The project's launch depends on you.
```

---

## 📚 Part 2: Mandatory Reading for the AI

The AI **MUST** read these files to understand its mission. They provide the context, analysis, and roadmap required for success.

1.  **`COMPREHENSIVE_ANALYSIS_NOV_2025.md`**
    - **Purpose:** This is the **master plan**. It contains the detailed project analysis, the current production readiness assessment (85%), and the **Official Development Roadmap** you must follow to reach 100%.

2.  **`AI_HANDOVER_TEMPLATE.md`** (This file)
    - **Purpose:** Provides the startup command, workflow instructions, and checklists to ensure a smooth handover.

3.  **`DEVELOPMENT_SUMMARY_NOV_2025.md`**
    - **Purpose:** Summarizes the work completed in the previous session, giving context to the current state.

4.  **`PRODUCTION_READINESS.md`**
    - **Purpose:** A detailed checklist of all features and their status, which you will be updating as you complete your tasks.

---

## 🔑 Part 3: Environment Variables & API Keys

These keys are required for the project to function. The AI must ensure they are correctly configured and utilized.

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vanchin AI (LLM Provider - 19 Keys for Load Balancing)
# Note: The application code already manages these keys. No action needed unless you modify the core AI client.
VC_API_KEY_1=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VC_API_KEY_2=3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk
# ... (and 17 other keys)

# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# GitHub Integration
GITHUB_TOKEN=your-github-token

# Vercel (Deployment)
VERCEL_TOKEN=your-vercel-token
```

---

## 🔄 Part 4: AI Workflow & Automation Guide

To ensure continuous and effective development, the AI must adhere to the following workflow:

### The Plan-Execute-Report Loop

This is a continuous cycle. The AI should not stop until the final goal (100% readiness) is achieved.

1.  **PLAN:**
    - At the start of the session, create a high-level, multi-phase plan based on the **Development Roadmap** from the analysis document.
    - The phases should be logical units of work (e.g., "Phase 1: Unit Testing for API Routes", "Phase 2: Security Hardening").
    - Use the `plan(action='update', ...)` tool to set this plan.

2.  **EXECUTE:**
    - Work through each phase of the plan sequentially.
    - For each task, break it down into smaller, manageable steps (e.g., read file, write code, run test, commit).
    - **Always test your changes.** Before committing, run `pnpm lint`, `pnpm exec tsc --noEmit`, and any relevant tests you create.
    - Commit your changes with clear, descriptive messages.

3.  **REPORT:**
    - After completing a significant task or a full phase, send an `info` message to the user summarizing what you did, the outcome, and what you will do next.
    - This keeps the user informed and allows for course correction if needed.

4.  **ADVANCE & LOOP:**
    - Once a phase is 100% complete, use the `plan(action='advance', ...)` tool to move to the next phase.
    - Immediately begin the **EXECUTE** step for the new phase.
    - Repeat this loop until all phases in your plan are complete.

### Final Delivery

- Once all roadmap tasks are complete and the project is 100% production-ready, your final task is to:
  1.  Update the `PRODUCTION_READINESS.md` checklist to be 100% complete.
  2.  Create a final `FINAL_LAUNCH_REPORT.md` summarizing the entire project journey.
  3.  Send a `result` message to the user with the final report and all relevant attachments.

---

## ✅ Part 5: Pre-flight Checklist

*The AI must confirm these steps are completed before writing any code.*

- [ ] **Repository Cloned:** The `donlasahachat11-lgtm/mrphomth` repository is successfully cloned into `/home/ubuntu/mrphomth`.
- [ ] **Dependencies Installed:** `pnpm install` has been run successfully.
- [ ] **Mandatory Documents Read:** I have read and understood:
  - [ ] `COMPREHENSIVE_ANALYSIS_NOV_2025.md`
  - [ ] `AI_HANDOVER_TEMPLATE.md`
- [ ] **Initial Plan Created:** A multi-phase plan based on the development roadmap has been created using the `plan` tool.
- [ ] **Build Verified:** The project builds successfully locally using `pnpm build` (using the dummy `.env.local` file).

Once this checklist is complete, you are cleared to begin development.
