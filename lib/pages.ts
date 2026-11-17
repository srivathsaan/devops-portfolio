/**
 * Content for the static page each building opens into. Sourced from the resume
 * (~/Documents/Resume/fintech_resume.tex); lib/zones.ts holds the shorter in-world cards.
 */

export type Fact = { label: string; value: string; note?: string };

export type Role = {
  title: string;
  dates: string;
  location?: string;
  bullets: string[];
  tools?: string[];
};

export type Project = {
  title: string;
  href?: string;
  bullets: string[];
  tags: string[];
};

export type DatedItem = { title: string; date: string };

export type PageSection =
  | { kind: "bullets"; heading: string; items: string[] }
  | { kind: "roles"; heading: string; roles: Role[] }
  | { kind: "projects"; heading: string; projects: Project[] }
  | { kind: "dated"; heading: string; items: DatedItem[] }
  | { kind: "tags"; heading: string; groups: { label: string; tags: string[] }[] };

export type SitePage = {
  /** The in-world zone (lib/zones.ts) whose building opens this page. */
  zoneId: string;
  href: string;
  navLabel: string;
  /** Browser-tab / search-result title, before the site-wide " · Srivathsaan Nakkeeran" suffix. */
  metaTitle: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Short line for <meta name="description">. */
  description: string;
  /** Accent colour, echoing the building in the 3D world. */
  accent: string;
  facts: Fact[];
  sections: PageSection[];
};

export const contactLinks = {
  email: "srivathsaan11@gmail.com",
  linkedin: "https://linkedin.com/in/srivathsaan",
  github: "https://github.com/srivathsaan",
  resume: "/resume.pdf",
};

export const sitePages: SitePage[] = [
  {
    zoneId: "btech",
    href: "/b-tech",
    navLabel: "B.Tech",
    metaTitle: "B.Tech at Amrita Vishwa Vidyapeetham",
    eyebrow: "Education · Jul 2019 – Jun 2023",
    title: "B.Tech, Computer and Communication Engineering",
    subtitle: "Amrita Vishwa Vidyapeetham, Coimbatore",
    description:
      "Srivathsaan Nakkeeran's B.Tech in Computer and Communication Engineering at Amrita Vishwa Vidyapeetham: CGPA 8.87/10 and the Silver Medal for academic excellence.",
    accent: "#aa4a2a",
    facts: [
      { label: "CGPA", value: "8.87 / 10" },
      { label: "Award", value: "Silver Medal", note: "Academic excellence, Aug 2023" },
      { label: "Duration", value: "4 years", note: "Jul 2019 – Jun 2023" },
    ],
    sections: [
      {
        kind: "bullets",
        heading: "Highlights",
        items: [
          "Awarded the Silver Medal for academic excellence in undergraduate studies (Aug 2023).",
          "Interned at Bounteous as a Software Engineer from Jan to May 2023, alongside the final semester, and received an upgraded full-time offer.",
        ],
      },
    ],
  },
  {
    zoneId: "bounteous",
    href: "/experience",
    navLabel: "Experience",
    metaTitle: "Experience at Bounteous",
    eyebrow: "Experience · Jan 2023 – Dec 2025",
    title: "Bounteous",
    subtitle: "CloudOps and software engineering · Chennai, India",
    description:
      "Srivathsaan Nakkeeran's three years at Bounteous: CloudOps support across 20+ client environments, 200+ incidents, AWS ECS migrations, and full-stack engineering.",
    accent: "#3d7fb0",
    facts: [
      { label: "Client environments", value: "20+" },
      { label: "Infrastructure incidents", value: "200+" },
      { label: "Security incidents", value: "30+" },
      { label: "Uptime at peak traffic", value: "99.99%" },
    ],
    sections: [
      {
        kind: "roles",
        heading: "Roles",
        roles: [
          {
            title: "Support Analyst — CloudOps",
            dates: "Jun 2023 – Dec 2025",
            location: "Chennai, India",
            bullets: [
              "Analyzed infrastructure and application telemetry across 20+ client environments using Splunk, Sumo Logic, Site24x7, and CloudWatch, improving proactive risk detection and SLA adherence.",
              "Investigated 200+ infrastructure and 30+ security incidents by correlating logs and metrics, identifying root causes and restoring services.",
              "Built targeted Cloudflare WAF rules from credential-stuffing and probing traffic analysis across 20+ client environments.",
              "Optimized AWS ECS scaling policies using CloudWatch workload metrics, sustaining 99.99% uptime during peak traffic while reducing compute cost.",
              "Built monitoring dashboards in Site24x7 visualizing CPU, memory, API latency, and database metrics across 20+ client environments.",
              "Migrated a legacy EC2-based NGINX service to AWS ECS Fargate using Docker, Terraform, and CI/CD, with Python scripts automating configuration, redirect, and SSL validation.",
              "Created infrastructure runbooks adopted by the on-call engineering team, documenting AWS deployment requirements gathered with cross-functional stakeholders.",
            ],
            tools: [
              "Splunk",
              "Sumo Logic",
              "Site24x7",
              "CloudWatch",
              "Cloudflare WAF",
              "AWS ECS Fargate",
              "Docker",
              "Terraform",
              "Python",
              "CI/CD",
            ],
          },
          {
            title: "Software Engineer Intern",
            dates: "Jan 2023 – May 2023",
            location: "Chennai, India",
            bullets: [
              "Built full-stack web applications using React.js, Node.js, MongoDB, and AWS, delivering data-driven features for production use.",
              "Received an upgraded full-time offer in recognition of outstanding internship performance (May 2023).",
            ],
            tools: ["React.js", "Node.js", "MongoDB", "AWS"],
          },
        ],
      },
    ],
  },
  {
    zoneId: "ntu",
    href: "/msc",
    navLabel: "MSc",
    metaTitle: "MSc Financial Technology at NTU",
    eyebrow: "Education · Aug 2026 – May 2027",
    title: "MSc Financial Technology",
    subtitle: "Intelligent Process Automation · Nanyang Technological University, Singapore",
    description:
      "Srivathsaan Nakkeeran's MSc in Financial Technology (Intelligent Process Automation) at Nanyang Technological University, Singapore, and activities alongside it.",
    accent: "#a8865a",
    facts: [
      { label: "Specialisation", value: "Intelligent Process Automation" },
      { label: "Location", value: "Singapore" },
      { label: "Expected completion", value: "May 2027" },
    ],
    sections: [
      {
        kind: "bullets",
        heading: "Focus",
        items: [
          "MSc Financial Technology student with 3 years of CloudOps experience, bringing analytical, problem-solving, and technical skills in Python, SQL, and financial modelling to identify patterns in complex systems and deliver practical, data-driven solutions.",
        ],
      },
      {
        kind: "dated",
        heading: "Alongside the MSc",
        items: [
          { title: "GFTN ASEAN Financial Health Challenge — Finalist", date: "Oct 2026" },
          { title: "Bloomberg Global Trading Challenge 2026", date: "Oct 2026" },
          { title: "Web development freelance — Singapore", date: "Sep 2026" },
          { title: "TEDxNTU Volunteer — Logistics and Operations", date: "Sep 2026" },
        ],
      },
    ],
  },
  {
    zoneId: "contact",
    href: "/contact",
    navLabel: "Projects & Contact",
    metaTitle: "Projects & Contact",
    eyebrow: "Get in touch",
    title: "Let's talk fintech, ML, and infra.",
    subtitle: "Projects, certifications, and skills — and how to reach me.",
    description:
      "Srivathsaan Nakkeeran's projects (PolicyPulse, an FDIC bank-failure early-warning model), certifications, skills, and contact details.",
    accent: "#9c4a3c",
    facts: [],
    sections: [
      {
        kind: "projects",
        heading: "Projects",
        projects: [
          {
            title: "PolicyPulse — Insurance Policy Decision-Support Platform",
            href: "https://github.com/Devesh-Singh05/PolicyPulse",
            bullets: [
              "Built PolicyPulse, a decision-support platform that helps users in Singapore and India see the cost of surrendering, switching, or borrowing against a life insurance policy and surfaces ranked, cited alternatives.",
              "Developed an 11-rule decision engine covering 51 licensed insurers and 8 real insurance products across Singapore (LIA/MAS) and India (IRDAI), with every rule sourced to its regulator or insurer document.",
              "Built a document reader that extracts data from scanned policy documents using a GPU-hosted vision-language model, plus a reviewer workflow for resolving user-raised concerns.",
            ],
            tags: ["Insurance", "Decision engine", "Vision-language model", "Singapore & India"],
          },
          {
            title: "Bank Failure Early-Warning Model using FDIC Data",
            bullets: [
              "Built a model ranking US banks by risk of FDIC failure within 4 quarters on 751K bank-quarters (2000–2026, 590 failures), benchmarking tree ensembles and a PyTorch GRU with purged walk-forward CV.",
              "Gradient Boosting reached test PR-AUC 0.226 (565× no-skill) and flagged all 7 capital-weak 2020–2026 failures a median 3 quarters early; error analysis traced misses to 2023 SVB-style deposit runs.",
            ],
            tags: ["PyTorch", "Gradient Boosting", "Walk-forward CV", "FDIC data"],
          },
        ],
      },
      {
        kind: "dated",
        heading: "Certifications",
        items: [
          { title: "Bloomberg Market Concepts", date: "Nov 2026" },
          { title: "Bloomberg Finance Fundamentals", date: "Sep 2026" },
          { title: "Google Cybersecurity Professional Certificate", date: "Sep 2024" },
          { title: "Cloudflare Accredited Configuration Engineer (ACE)", date: "Jun 2024" },
        ],
      },
      {
        kind: "tags",
        heading: "Skills",
        groups: [
          {
            label: "Technical",
            tags: ["Python", "SQL", "PyTorch", "scikit-learn", "pandas", "AWS", "Docker", "Terraform", "Git", "Cloudflare"],
          },
          {
            label: "Soft",
            tags: [
              "Problem solving",
              "Analytical thinking",
              "Cross-functional collaboration",
              "Technical communication",
            ],
          },
          {
            label: "Coursework",
            tags: [
              "ML & AI",
              "Deep learning",
              "DSA",
              "DBMS",
              "ML in finance",
              "Data analysis with Python",
              "Foundations of statistical modelling",
              "Principles of finance & risk management",
            ],
          },
        ],
      },
    ],
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
