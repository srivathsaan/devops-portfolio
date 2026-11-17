# srivathsaan.com

Personal portfolio for Srivathsaan Nakkeeran, built as a small 3D world you walk through. Each stretch of the path is a stage of the timeline — home, B.Tech at Amrita, CloudOps at Bounteous, the MSc at NTU, and a contact zone — and each building can be entered for the details.

Built with Next.js (App Router) and three.js, deployed on Vercel.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Walk | WASD or arrow keys | Joystick (bottom left) |
| Jump | Space | — |
| Enter a building | E, near a door | Door button (bottom right) |
| Leave a building | Esc | "Back outside" button |

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where things live

| Path | What it is |
| --- | --- |
| `lib/zones.ts` | Text for every zone — edit this to update the site's content |
| `public/resume.pdf` | The downloadable resume |
| `lib/three/world.ts` | Builds the world: ground, buildings, props, colliders and entrances |
| `lib/three/character-controller.ts` | Character movement, collision, animation and jumping |
| `lib/three/engine.ts` | Renderer, camera, lights, sky and fog |
| `lib/three/occlusion-fade.ts` | Fades anything standing between the camera and the character |
| `components/scene-canvas.tsx` | Render loop, input, zone and door detection |
| `components/portfolio-experience.tsx` | Page layout and on-screen UI |

## Credits

Character, trees and buildings by [Kenney](https://kenney.nl) (CC0). Bicycle, motorcycle and airplane by Poly by Google (CC-BY) via [Poly Pizza](https://poly.pizza).
