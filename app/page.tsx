import Prism from "@/components/react-bits/Prism";
import GradientText from "@/components/react-bits/GradientText";

export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center p-8 md:p-24 overflow-hidden bg-black">
      {/* Prism Background - Only on Home Page */}
      <Prism 
        animationType="rotate"
        glow={1.2}
        scale={4}
        timeScale={0.8}
        className="opacity-50"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-center"
        >
          Aaroh
        </GradientText>
        
        <p className="text-zinc-400 mb-8 text-center max-w-sm md:max-w-md text-sm md:text-base px-4 font-medium">
          A rising rhythm written in conversations.
        </p>
        
        <a 
          href="/chat"
          className="inline-flex h-12 md:h-12 items-center justify-center rounded-xl bg-white px-10 text-sm md:text-base font-bold text-black shadow-xl transition-all hover:scale-105 active:scale-95 focus-visible:outline-none w-full max-w-[220px]"
        >
          Enter Chat
        </a>
      </div>
    </main>
  );
}
