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
      "Started as a Software Engineer Intern (Jan–May 2023) building full-stack features with React, Node.js, and MongoDB; earned an upgraded full-time offer",
    ],
    x: 40,
    z: 0,
    // Wider than the other zones: the 3rd (easternmost) Bounteous building's door sits
    // ~9.9 units from the zone center, outside the usual 7-unit radius, which made the
    // info card disappear right as you reached it.
    radius: 10,
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
      "PolicyPulse: an insurance policy decision-support platform for Singapore and India, with an 11-rule decision engine spanning 51 licensed insurers and 8 products",
      "Bank Failure Early-Warning Model: ranks US banks by FDIC failure risk; Gradient Boosting reached 565× no-skill PR-AUC and flagged all 7 capital-weak 2020–2026 failures a median 3 quarters early",
      "Certifications: Bloomberg Market Concepts, Bloomberg Finance Fundamentals, Google Cybersecurity Professional, Cloudflare ACE",
      "Also: GFTN ASEAN Financial Health Challenge (Finalist), Bloomberg Global Trading Challenge 2026, freelance web development (Singapore), TEDxNTU volunteer (Logistics & Ops)",
    ],
    links: {
      email: "srivathsaan11@gmail.com",
      linkedin: "https://linkedin.com/in/srivathsaan",
      github: "https://github.com/srivathsaan",
      resume: "/resume.pdf",
    },
    x: 80,
    z: 0,
    // The home building's door sits ~7.7 units from the zone center, just outside the
    // usual 7-unit radius, which made the info card disappear right at the door.
    radius: 8,
  },
];

export const WORLD_BOUNDS = { xMin: -10, xMax: 90, zMin: -10, zMax: 10 };
