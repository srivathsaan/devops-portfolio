/**
 * Content for the static page each building opens into, laid out by the Marginalia template
 * (components/ui/marginalia-portfolio-template.tsx). Sourced from the resume
 * (~/Documents/Resume/fintech_resume.tex); lib/zones.ts holds the shorter in-world cards.
 *
 * In summaries, *phrase* gets a pen underline and [phrase] a pen oval.
 */
import type { MarginaliaPortfolioTemplateProps } from "@/components/ui/marginalia-portfolio-template";

/** The template props a page supplies; look-and-feel props are shared in components/site/zone-page.tsx. */
export type PageSheets = Omit<
  MarginaliaPortfolioTemplateProps,
  "name" | "colors" | "fonts" | "chrome" | "height" | "className" | "inkTrail" | "portrait" | "portraitAlt"
>;

export type SitePage = {
  /** The in-world zone (lib/zones.ts) whose building opens this page. */
  zoneId: string;
  href: string;
  navLabel: string;
  /** Browser-tab / search-result title, before the site-wide " · Srivathsaan Nakkeeran" suffix. */
  metaTitle: string;
  /** Short line for <meta name="description">. */
  description: string;
  /** The template's pen colour, echoing the building in the 3D world. Each is at least 3:1
   *  against the paper sheets (and the night sheets where a page has them). */
  accent: string;
  /** A page-specific photo for the portrait slot; pages without one show the placeholder. */
  portrait?: { src: string; alt: string };
  sheets: PageSheets;
};

export const contactLinks = {
  email: "srivathsaan11@gmail.com",
  linkedin: "https://linkedin.com/in/srivathsaan",
  github: "https://github.com/srivathsaan",
  resume: "/resume.pdf",
};

const RESUME_URL = "https://www.srivathsaan.com/resume.pdf";

export const sitePages: SitePage[] = [
  {
    zoneId: "btech",
    href: "/b-tech",
    navLabel: "B.Tech",
    metaTitle: "B.Tech at Amrita Vishwa Vidyapeetham",
    description:
      "Srivathsaan Nakkeeran's B.Tech in Computer and Communication Engineering at Amrita Vishwa Vidyapeetham: CGPA 8.87/10 and the Silver Medal for academic excellence.",
    accent: "#aa4a2a",
    sheets: {
      sections: ["cover", "education"],
      title: "B.Tech",
      role: "Computer & Communication Engineering",
      location: "Coimbatore",
      year: "2019-23",
      educationIntro:
        "Four years of computer and communication engineering at Amrita Vishwa Vidyapeetham, finishing with a CGPA of 8.87 and the Silver Medal.",
      education: [
        {
          title: "B.Tech, Computer and Communication Engineering",
          place: "Amrita Vishwa Vidyapeetham, Coimbatore",
          period: "Jul 2019 - Jun 2023",
          circled: true,
        },
        { title: "CGPA 8.87 / 10", place: "Amrita Vishwa Vidyapeetham" },
        { title: "Silver Medal for academic excellence", place: "Undergraduate studies", period: "Aug 2023", circled: true },
        { title: "Software Engineer Intern at Bounteous", place: "Alongside the final semester", period: "Jan - May 2023" },
      ],
      cvUrl: RESUME_URL,
      cvNote: "my resume",
      languages: [],
    },
  },
  {
    zoneId: "bounteous",
    href: "/experience",
    navLabel: "Experience",
    metaTitle: "Experience at Bounteous",
    description:
      "Srivathsaan Nakkeeran's three years at Bounteous: CloudOps support across 20+ client environments, 200+ incidents, AWS ECS migrations, and full-stack engineering.",
    accent: "#3d7fb0",
    sheets: {
      sections: ["cover", "cases"],
      // "Bounteous" is too wide for the giant cover word; the employer goes on the pill.
      title: "Work",
      role: "Bounteous · CloudOps & software engineering",
      location: "Chennai",
      year: "2023-25",
      projects: [
        {
          name: "CloudOps",
          kind: "Support Analyst",
          year: "Jun 2023 - Dec 2025",
          tagline: "Monitoring 20+ client environments.",
          summary:
            "Kept *20+ client environments* healthy and secure: analysed telemetry in Splunk, Sumo Logic, Site24x7 and CloudWatch, investigated [200+ infrastructure and 30+ security incidents] to root cause, and built Cloudflare WAF rules from credential-stuffing and probing traffic.",
          challengeLabel: "also shipped:",
          challenge:
            "Migrated a legacy EC2-based NGINX service to AWS ECS Fargate with Docker, Terraform and CI/CD, with Python scripts automating configuration, redirect and SSL validation.",
          note: "my runbooks were adopted by the on-call team",
          stats: [
            { value: 200, suffix: "+", label: "infrastructure incidents investigated" },
            { value: 30, suffix: "+", label: "security incidents" },
            { value: 99.99, decimals: 2, suffix: "%", label: "uptime at peak traffic on AWS ECS" },
          ],
          images: [],
          screens: ["stats", "cover", "feed"],
          accent: "#3d7fb0",
        },
        {
          name: "Internship",
          kind: "Software Engineer Intern",
          year: "Jan - May 2023",
          tagline: "Full-stack features for production.",
          summary:
            "Built *full-stack web applications* with React.js, Node.js, MongoDB and AWS, delivering data-driven features for production use, and [earned an upgraded full-time offer] at the end of it.",
          note: "full-time offer, upgraded in May 2023",
          images: [],
          screens: ["feed", "cover", "stats"],
          accent: "#3d7fb0",
        },
      ],
    },
  },
  {
    zoneId: "ntu",
    href: "/msc",
    navLabel: "MSc",
    metaTitle: "MSc Financial Technology at NTU",
    description:
      "Srivathsaan Nakkeeran's MSc in Financial Technology (Intelligent Process Automation) at Nanyang Technological University, Singapore, and activities alongside it.",
    accent: "#9c7a4e",
    portrait: {
      src: "/images/msc-ntu.jpg",
      alt: "Srivathsaan in a white shirt, seated in a lecture theatre at NTU's FinTech Industry Day 2026",
    },
    sheets: {
      sections: ["cover", "hello", "education"],
      title: "MSc",
      role: "Financial Technology",
      location: "Singapore",
      year: "2026-27",
      greeting: "Hello.",
      bio: "I'm an MSc Financial Technology student at NTU Singapore with *3 years of CloudOps experience*. I bring analytical, problem-solving and technical skills in Python, SQL and financial modelling to [identify patterns in complex systems] and deliver practical, data-driven solutions.",
      traits: ["problem solving", "analytical", "collaborative", "communicator", "Python & SQL", "fintech"],
      headings: { education: "At NTU" },
      educationIntro: "Intelligent Process Automation specialisation, Aug 2026 - May 2027, and what I've joined alongside it.",
      education: [
        {
          title: "MSc Financial Technology, Intelligent Process Automation",
          place: "Nanyang Technological University, Singapore",
          period: "Aug 2026 - May 2027",
          circled: true,
        },
        { title: "GFTN ASEAN Financial Health Challenge finalist", period: "Oct 2026", circled: true },
        { title: "Bloomberg Global Trading Challenge 2026", period: "Oct 2026" },
        { title: "Web development freelance", place: "Singapore · thenkondar.com", period: "Sep 2026" },
        { title: "TEDxNTU volunteer", place: "Logistics and Operations", period: "Sep 2026" },
      ],
      cvUrl: RESUME_URL,
      cvNote: "the whole story",
      languages: [],
    },
  },
  {
    zoneId: "contact",
    href: "/contact",
    navLabel: "Projects & Contact",
    metaTitle: "Projects & Contact",
    description:
      "Srivathsaan Nakkeeran's projects (PolicyPulse, an FDIC bank-failure early-warning model), certifications, skills, and contact details.",
    accent: "#9c4a3c",
    sheets: {
      sections: ["cover", "cases", "skills", "education", "thanks"],
      title: "Projects",
      role: "Fintech · ML · infrastructure",
      location: "Singapore",
      year: "2026",
      projects: [
        {
          name: "PolicyPulse",
          kind: "Insurance decision-support",
          year: "2026",
          tagline: "The real cost of a policy decision.",
          summary:
            "A decision-support platform that helps people in Singapore and India see the cost of *surrendering, switching or borrowing* against a life insurance policy, and surfaces [ranked, cited alternatives].",
          challengeLabel: "under the hood:",
          challenge:
            "An 11-rule decision engine covering 51 licensed insurers and 8 real products across Singapore (LIA/MAS) and India (IRDAI), every rule sourced to its regulator or insurer document.",
          note: "reads scanned policies with a vision-language model",
          stats: [
            { value: 11, label: "sourced decision rules" },
            { value: 51, label: "licensed insurers covered" },
            { value: 8, label: "real insurance products" },
          ],
          href: "https://github.com/Devesh-Singh05/PolicyPulse",
          linkLabel: "see it on GitHub",
          images: [],
          screens: ["cover", "feed", "stats"],
          accent: "#9c4a3c",
          tone: "paper",
        },
        {
          // Two words so the big case-study title can wrap.
          name: "Early Warning",
          kind: "FDIC bank-failure model",
          tagline: "Which banks fail next?",
          summary:
            "Ranks US banks by *risk of FDIC failure within four quarters*, trained on 751K bank-quarters (2000-2026, 590 failures), benchmarking tree ensembles and a PyTorch GRU under [purged walk-forward cross-validation].",
          challengeLabel: "the result:",
          challenge:
            "Gradient Boosting reached test PR-AUC 0.226 (565× no-skill) and flagged all 7 capital-weak 2020-2026 failures a median 3 quarters early.",
          note: "the misses traced back to SVB-style deposit runs",
          stats: [
            { value: 751, suffix: "K", label: "bank-quarters of FDIC data" },
            { value: 565, suffix: "×", label: "the no-skill PR-AUC" },
            { value: 3, label: "quarters' median early warning" },
          ],
          images: [],
          screens: ["stats", "cover", "feed"],
          accent: "#9c4a3c",
          tone: "paper",
        },
      ],
      tools: [
        { name: "Python", mark: "Py", bg: "#3776ab", fg: "#ffd43b", note: "models, analysis and automation scripts" },
        { name: "SQL", mark: "SQL", bg: "#336791", fg: "#ffffff", note: "querying and shaping data" },
        { name: "PyTorch", mark: "Pt", bg: "#ee4c2c", fg: "#ffffff", note: "the GRU in the bank-failure model" },
        { name: "AWS", mark: "aws", bg: "#232f3e", fg: "#ff9900", note: "ECS Fargate, CloudWatch, scaling policies" },
        { name: "Docker", mark: "Dk", bg: "#1d63ed", fg: "#ffffff", note: "containers for the Fargate migration" },
        { name: "Terraform", mark: "Tf", bg: "#7b42bc", fg: "#ffffff", note: "infrastructure as code" },
        { name: "Cloudflare", mark: "Cf", bg: "#f38020", fg: "#ffffff", note: "WAF rules, plus an ACE accreditation" },
      ],
      toolNote: "hover a tool",
      skillsIntro:
        "Problem solving, analytical thinking, cross-functional collaboration and technical communication, backed by coursework in machine learning, statistics and finance.",
      skills: [
        "scikit-learn",
        "pandas",
        "Git",
        "ML & AI",
        "Deep learning",
        "ML in finance",
        "Data analysis with Python",
        "Statistical modelling",
        "Finance & risk management",
        "DSA",
        "DBMS",
      ],
      books: [],
      headings: { education: "Certifications" },
      educationIntro: "",
      education: [
        { title: "Bloomberg Market Concepts", place: "Bloomberg", period: "Nov 2026" },
        { title: "Bloomberg Finance Fundamentals", place: "Bloomberg", period: "Sep 2026" },
        { title: "Google Cybersecurity Professional Certificate", place: "Google", period: "Sep 2024" },
        { title: "Accredited Configuration Engineer (ACE)", place: "Cloudflare", period: "Jun 2024", circled: true },
      ],
      cvUrl: RESUME_URL,
      cvNote: "the full resume",
      languages: [],
      thanks: "Thank you",
      email: contactLinks.email,
      links: [
        { label: "LinkedIn", href: contactLinks.linkedin },
        { label: "GitHub", href: contactLinks.github },
        { label: "Resume", href: contactLinks.resume },
      ],
      letter:
        "Thanks for walking through the world and reading this far.\n\nIf you're working where machine learning, data and solid infrastructure meet finance, I'd love to hear about it.",
      signature: "Srivathsaan",
    },
  },
];

export function pageForZone(zoneId: string): SitePage | undefined {
  return sitePages.find((page) => page.zoneId === zoneId);
}

export function pageAt(href: string): SitePage {
  const page = sitePages.find((candidate) => candidate.href === href);
  if (!page) throw new Error(`No site page configured for ${href}`);
  return page;
}
