import CoolText from "@/components/landing/CoolText";
import Grids from "@/components/landing/Grids";
import Hero from "@/components/landing/Hero";
import Nav from "@/components/landing/Nav";
import Team from "@/components/landing/Team";
import PageTransition from "@/components/shared/PageTransition";

export default function Home() {
  const gradientColors = {
    from: "oklch(0.6453 0.1966 283.37)",
    to: "oklch(0.5219 0.2248 274.51)",
  };

  return (
    <PageTransition>
      <div className={`min-h-screen w-full overflow-hidden relative`}>
        {/* top Gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              background: `linear-gradient(to top right, ${gradientColors.from}, ${gradientColors.to})`,
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* bottom Gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              background: `linear-gradient(to top right, ${gradientColors.from}, ${gradientColors.to})`,
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 w-full">
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <Nav />
              <Hero />
              <Grids />
              <Team />
              <CoolText />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
