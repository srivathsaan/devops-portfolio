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
 * Keyboard users reach it via the "Skip to text version" link; while focus is inside, it is
 * shown as a readable panel instead of leaving invisible focus stops.
 */
export default function ProfileSummary() {
  return (
    <main
      id="text-version"
      tabIndex={-1}
      className={[
        "group/text sr-only outline-none",
        "focus-within:not-sr-only focus-within:fixed focus-within:inset-4 focus-within:z-50 focus-within:mx-auto",
        "focus-within:max-w-2xl focus-within:overflow-y-auto focus-within:rounded-xl focus-within:bg-background",
        "focus-within:p-6 focus-within:text-sm focus-within:leading-relaxed focus-within:shadow-2xl sm:focus-within:p-8",
        "[&_a]:underline [&_a]:underline-offset-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6",
        "[&_h2]:text-lg [&_h2]:font-semibold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
      ].join(" ")}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      {/* Only for sighted keyboard users while the panel is open — not crawled or read out. */}
      <p className="mb-4 hidden font-mono text-xs uppercase tracking-widest text-muted-foreground group-focus-within/text:block">
        Text version · press Esc to go back to the 3D world
      </p>
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
