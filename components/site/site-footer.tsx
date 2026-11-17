import { contactLinks } from "@/lib/pages";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-medium text-foreground">Srivathsaan Nakkeeran</span> · Data science &amp; ML for
          fintech
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <a className="hover:text-foreground" href={`mailto:${contactLinks.email}`}>
              Email
            </a>
          </li>
          <li>
            <a className="hover:text-foreground" href={contactLinks.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="hover:text-foreground" href={contactLinks.github} target="_blank" rel="noopener">
              GitHub
            </a>
          </li>
          <li>
            <a className="hover:text-foreground" href={contactLinks.resume} download>
              Resume
            </a>
          </li>
        </ul>
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-6 text-xs text-muted-foreground sm:px-6">
        3D models: character, trees &amp; buildings by Kenney (CC0); bicycle, motorcycle &amp; airplane by Poly by
        Google (CC-BY) via Poly Pizza.
      </p>
    </footer>
  );
}
