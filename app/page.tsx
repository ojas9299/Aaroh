"use client";
import Prism from "@/components/Prism";
import ShinyText from "@/components/ShinyText";
import SpotlightCard from "@/components/SpotlightCard";

export default function Home() {
  const raagCards = [
    {
      name: "Raag Yaman",
      description:
        "A luminous evening raag known for its serene, devotional feel and its signature use of Tivra Ma.",
      time: "Early night",
      mood: "Peaceful, expansive",
    },
    {
      name: "Raag Pahadi",
      description:
        "Inspired by mountain folk melodies, Pahadi is fluid and romantic, often heard in light-classical and film music.",
      time: "Flexible",
      mood: "Pastoral, nostalgic",
    },
    {
      name: "Raag Bhairav",
      description:
        "A dawn raag with powerful gravitas, shaped by komal Re and komal Dha that create a meditative tension.",
      time: "Sunrise",
      mood: "Solemn, spiritual",
    },
    {
      name: "Raag Bageshree",
      description:
        "A late-evening favorite that expresses longing and intimacy, often unfolding gently in vilambit tempo.",
      time: "Late evening",
      mood: "Romantic, yearning",
    },
    {
      name: "Raag Darbari Kanada",
      description:
        "Deep and majestic, Darbari uses heavy oscillations to create a profound, courtly atmosphere.",
      time: "Late night",
      mood: "Grave, majestic",
    },
    {
      name: "Raag Malkauns",
      description:
        "A pentatonic midnight raag with hypnotic depth, often associated with inward reflection and stillness.",
      time: "Midnight",
      mood: "Mystic, introspective",
    },
    {
      name: "Raag Bhairavi",
      description:
        "Traditionally heard at the end of concerts, Bhairavi can move from devotional tenderness to earthy folk color.",
      time: "Morning / concert close",
      mood: "Compassionate, versatile",
    },
    {
      name: "Raag Desh",
      description:
        "A monsoon-flavored raag with bright emotional turns, widely loved in patriotic and lyrical compositions.",
      time: "Evening",
      mood: "Joyful, wistful",
    },
    {
      name: "Raag Hamsadhwani",
      description:
        "A bright pentatonic raag often used to open performances, admired for its clean, auspicious energy.",
      time: "Evening opener",
      mood: "Uplifting, devotional",
    },
    {
      name: "Raag Marwa",
      description:
        "A sunset raag with striking tension and no Pa, creating a unique sense of suspended expectation.",
      time: "Sunset",
      mood: "Intense, contemplative",
    },
    {
      name: "Raag Miyan Ki Todi",
      description:
        "An intricate late-morning raag with nuanced microtonal movement, prized for emotional subtlety.",
      time: "Late morning",
      mood: "Serious, searching",
    },
    {
      name: "Raag Kafi",
      description:
        "A spring-associated raag linked with folk idioms and Holi traditions, warm and conversational in character.",
      time: "Evening / spring",
      mood: "Playful, earthy",
    },
  ];

  return (
    <>
      <div className="relative w-full overflow-hidden h-[70vh] min-h-[500px] md:h-screen md:min-h-screen">
        <div className="absolute inset-0">
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-[17vw] font-extrabold ">
          <ShinyText
            text="AAROH"
            speed={2}
            delay={2}
            color="#ffffff"
            shineColor="#696969"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
          />
          <p className="text-zinc-400 mb-14 text-center max-w-sm md:max-w-md text-sm md:text-xl font-bold ">
            <ShinyText
              text="A rising rhythm written in conversations."
              speed={2}
              delay={1}
              color="#ffffff"
              shineColor="#808080"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </p>
          <a
            href="/chat"
            className="inline-flex h-12 md:h-12 items-center justify-center rounded-xl bg-white px-10 text-sm md:text-base font-bold text-black shadow-xl transition-all hover:scale-105 active:scale-95 focus-visible:outline-none w-full max-w-[220px]"
          >
            Subscribe
          </a>
        </div>
      </div>

      <section className="w-full bg-black px-4 py-12 md:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {raagCards.map((card) => (
            <SpotlightCard
              key={card.name}
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h3 className="text-lg font-semibold text-white">{card.name}</h3>
              <p className="mt-4 text-sm text-zinc-300">{card.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-cyan-300/40 px-3 py-1 text-cyan-200">
                  Time: {card.time}
                </span>
                <span className="rounded-full border border-fuchsia-300/40 px-3 py-1 text-fuchsia-200">
                  Mood: {card.mood}
                </span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </>
  );
}
// Vercel build force: 1
