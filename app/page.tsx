export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold">Mr.Prompt</h1>
        <p className="text-muted-foreground max-w-md">
          A unified workspace for crafting, managing, and deploying prompts across your AI tooling stack.
        </p>
      </div>
    </main>
  );
}
