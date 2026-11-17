import PortfolioExperience from "@/components/portfolio-experience";
import ProfileSummary from "@/components/profile-summary";

export default function Home() {
  return (
    // The 3D world fills the viewport exactly; the content pages scroll normally.
    <div className="relative h-dvh overflow-hidden">
      <a
        href="#text-version"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:shadow-lg"
      >
        Skip to text version
      </a>
      <PortfolioExperience />
      <ProfileSummary />
    </div>
  );
}
