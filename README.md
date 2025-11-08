# Mr. Prompt: Your Self-Hosted AI Chat Companion

**Mr. Prompt** is a feature-rich, open-source, and self-hostable AI chat application designed for developers, researchers, and AI enthusiasts. It provides a secure and flexible platform for interacting with multiple AI models while keeping your API keys and conversations private. This project is built with a modern tech stack, including Next.js, Supabase, and FastAPI, ensuring a robust and scalable solution.

![Mr. Prompt Screenshot](https://i.imgur.com/YOUR_SCREENSHOT.png)  <!-- Replace with an actual screenshot -->

## ✨ Key Features

- **Multi-Provider AI Support**: Seamlessly switch between different AI models from various providers.
- **Secure API Key Management**: Your API keys are encrypted at rest (AES-256-GCM) and in transit, ensuring they remain confidential.
- **Real-Time Chat Interface**: A responsive and intuitive chat interface for a smooth user experience.
- **Chat History and Sessions**: All your conversations are saved, allowing you to revisit and continue them at any time.
- **User Authentication**: Secure user authentication and profile management powered by Supabase.
- **Prompt Library**: Create, save, and manage your favorite prompts for quick access.
- **Self-Hostable**: Deploy Mr. Prompt on your own infrastructure for complete control over your data.
- **Extensible and Customizable**: The open-source nature of the project allows you to customize and extend its functionality to fit your needs.

## 🚀 Getting Started

Follow these steps to get Mr. Prompt up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Python](https://www.python.org/) (v3.10 or later)
- [Docker](https://www.docker.com/) (optional, for database)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/donlasahachat11-lgtm/mrphomth.git
cd mrphomth
```

### 2. Set Up Supabase

Mr. Prompt uses Supabase for its database and authentication. You can either use the Supabase cloud service or self-host it.

1.  **Create a new Supabase project**: Go to [supabase.com](https://supabase.com/) and create a new project.
2.  **Get your project URL and anon key**: In your Supabase project dashboard, go to **Project Settings > API**. You will find your **Project URL** and **Project API keys** (use the `anon` key).

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the values from your Supabase project.

### 4. Install Dependencies and Run the Application

```bash
pnpm install
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## 📖 Documentation

For more detailed information about the project, please refer to the following documents:

- **[Deployment Guide](docs/DEPLOYMENT.md)**: Learn how to deploy Mr. Prompt to production.
- **[Contributing Guide](CONTRIBUTING.md)**: Find out how you can contribute to the project.

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to learn how you can get involved.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
