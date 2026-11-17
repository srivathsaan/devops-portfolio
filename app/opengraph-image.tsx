import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { SITE_OG_IMAGE_ALT } from "@/lib/site";

export const alt = SITE_OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// With Cache Components, an uncached file read would make this route render per request;
// the screenshot only changes with a deploy, so cache it and let the image be prerendered.
async function loadScene() {
  "use cache";
  cacheLife("max");
  return readFile(join(process.cwd(), "assets/og-scene.jpg"), "base64");
}

/** Link preview: a shot of the 3D world (assets/og-scene.jpg) with the name card over it. */
export default async function OpengraphImage() {
  const scene = await loadScene();

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%" }}>
        <img
          src={`data:image/jpeg;base64,${scene}`}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 48,
            display: "flex",
            flexDirection: "column",
            padding: "28px 36px",
            borderRadius: 24,
            background: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.25)",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 700, color: "#0f172a" }}>Srivathsaan Nakkeeran</div>
          <div style={{ fontSize: 30, color: "#334155", marginTop: 8 }}>
            Data Science &amp; ML for Fintech · MSc FinTech, NTU Singapore
          </div>
          <div style={{ fontSize: 22, color: "#64748b", marginTop: 14 }}>
            srivathsaan.com — walk through my portfolio
          </div>
        </div>
      </div>
    ),
    size
  );
}
