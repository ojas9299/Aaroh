export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-8 md:p-24 overflow-hidden">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">Aaroh</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-sm md:max-w-md text-sm md:text-base px-4">
        A rising rhythm written in conversations.
      </p>
      <a 
        href="/chat"
        className="inline-flex h-11 md:h-10 items-center justify-center rounded-md bg-primary px-8 text-sm md:text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none w-full max-w-[200px]"
      >
        Enter Chat
      </a>
    </main>

  );
}
