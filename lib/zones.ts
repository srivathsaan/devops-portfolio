export type ZoneLinks = {
  email: string;
  linkedin: string;
  github: string;
  resume: string;
};

export type ZoneContent = {
  id: string;
  eyebrow: string;
  title: string;
  org?: string;
  bullets: string[];
  cta?: string;
  links?: ZoneLinks;
  /** World-space center this zone's card appears around. */
  x: number;
  z: number;
  /** Distance from center at which the card becomes visible. */
  radius: number;
};

export const zones: ZoneContent[] = [
  {
    id: "home",
    eyebrow: "Portfolio",
    title: "Srivathsaan Nakkeeran",
    org: "Data / ML, fintech-focused",
    bullets: [],
    cta: "Walk right to explore — WASD or arrow keys",
    x: 0,
    z: 0,
    radius: 7,
  },
  {
    id: "btech",
    eyebrow: "Jul 2019 – Jun 2023",
    title: "B.Tech, Computer and Communication Engineering",
    org: "Amrita Vishwa Vidyapeetham, Coimbatore",
    bullets: ["CGPA 8.87 / 10.0", "Silver Medal for academic excellence (Aug 2023)"],
    x: 20,
    z: 0,
    radius: 7,
  },
  {
    id: "bounteous",
    eyebrow: "Jun 2023 – Dec 2025",
    title: "Support Analyst, CloudOps",
    org: "Bounteous, Chennai",
    bullets: [
      "Analyzed telemetry across 20+ client environments (Splunk, Sumo Logic, Site24x7, CloudWatch)",
      "Investigated 200+ infrastructure and 30+ security incidents; turned attack traffic patterns into targeted Cloudflare WAF rules",
      "Led the NGINX → AWS ECS Fargate migration; optimized ECS scaling to 99.99% uptime",
    ],
    x: 40,
    z: 0,
    radius: 7,
  },
  {
    id: "ntu",
    eyebrow: "Aug 2026 – May 2027",
    title: "MSc Financial Technology — Intelligent Process Automation",
    org: "Nanyang Technological University, Singapore",
    bullets: [],
    x: 60,
    z: 0,
    radius: 7,
  },
  {
    id: "contact",
    eyebrow: "Get in touch",
    title: "Let's talk fintech, ML, and infra.",
    bullets: [
      "Side project: Android ransomware detector (deep learning, 98.3% binary accuracy)",
      "Certifications: Google Cybersecurity Professional, Cloudflare ACE, Bloomberg Finance Fundamentals",
    ],
    links: {
      email: "srivathsaan11@gmail.com",
      linkedin: "https://linkedin.com/in/srivathsaan",
      github: "https://github.com/srivathsaan",
      resume: "/resume.pdf",
    },
    x: 80,
    z: 0,
    radius: 7,
  },
];

export const WORLD_BOUNDS = { xMin: -10, xMax: 90, zMin: -10, zMax: 10 };
