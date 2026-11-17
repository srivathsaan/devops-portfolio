import { zones } from "@/lib/zones";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const contact = zones.find((zone) => zone.id === "contact");
const timeline = zones.filter((zone) => zone.id !== "home" && zone.id !== "contact");

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: contact?.links ? `mailto:${contact.links.email}` : undefined,
  sameAs: contact?.links ? [contact.links.linkedin, contact.links.github] : undefined,
  alumniOf: { "@type": "CollegeOrUniversity", name: "Amrita Vishwa Vidyapeetham" },
  affiliation: { "@type": "CollegeOrUniversity", name: "Nanyang Technological University" },
  knowsAbout: ["Machine learning", "Financial technology", "Data analysis", "Python", "SQL", "AWS", "Cloud operations"],
};

/**
 * The portfolio's content as plain, server-rendered HTML. The 3D world draws everything on a
 * canvas, which search engines and screen readers can't read, so this carries the same text
 * (from lib/zones.ts) in a visually hidden but readable form, plus structured data.
 */
export default function ProfileSummary() {
  return (
    <main className="sr-only">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <h1>{SITE_NAME}</h1>
      <p>{SITE_DESCRIPTION}</p>

      {timeline.map((zone) => (
        <section key={zone.id} aria-labelledby={`summary-${zone.id}`}>
          <h2 id={`summary-${zone.id}`}>{zone.title}</h2>
          <p>
            {zone.org ? `${zone.org} · ` : ""}
            {zone.eyebrow}
          </p>
          {zone.bullets.length > 0 && (
            <ul>
              {zone.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {contact && (
        <section aria-labelledby="summary-contact">
          <h2 id="summary-contact">{contact.title}</h2>
          <ul>
            {contact.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {contact.links && (
            <ul>
              <li>
                <a href={contact.links.resume}>Resume (PDF)</a>
              </li>
              <li>
                <a href={`mailto:${contact.links.email}`}>Email</a>
              </li>
              <li>
                <a href={contact.links.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a href={contact.links.github}>GitHub</a>
              </li>
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
