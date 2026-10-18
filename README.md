# Srivathsaan Nakkeeran — DevOps Portfolio

A static portfolio site for a DevOps Engineer, positioned around fintech-style
infrastructure work: CI/CD, cloud automation, observability and infrastructure
as code. Built with Tailwind CSS (CDN) and a Three.js interactive background.

## Structure

```
index.html              Page markup
assets/
  css/style.css          Custom styles (theme tokens, components, a11y)
  js/main.js             Nav, modal, contact form, Three.js background
  images/                Hero, about, and project screenshots
  docs/resume.pdf         Downloadable resume
favicon.ico
CNAME                    GitHub Pages custom domain
```

## Run locally

Any static file server works:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes

- The contact form hands the message off to the visitor's email client via a
  `mailto:` link — no backend or third-party form service required.
- "View Detailed Description" buttons on project cards open a modal with the
  full project description; no external API calls are made.
