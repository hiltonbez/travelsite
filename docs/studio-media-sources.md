# Studio media sources — November 2026 rebuild

The files below are locally served presentation media. They are illustrative, not evidence of a specific supplier product, property, destination or availability. Do not label these scenes as a named resort, hotel or safari concession without verifying that identity.

## Background videos

All three source detail pages were read through Firecrawl on 4 November 2026. Each explicitly offered the clip for commercial or personal use under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree). No footage from competitors' websites was reused.

| Local file | Official source | Download | Prepared output |
| --- | --- | --- | --- |
| `public/videos/studio/city.mp4` | [Aerial view of the glass corporate buildings of a big city at night](https://mixkit.co/free-stock-video/aerial-view-of-the-glass-corporate-buildings-of-a-big-49845/) | [720p MP4](https://assets.mixkit.co/videos/49845/49845-720.mp4) | 12 s, 1280×720, H.264, silent, fast start, 1,904,797 bytes |
| `public/videos/studio/coast.mp4` | [Aerial panoramic view of a coastline](https://mixkit.co/free-stock-video/aerial-panoramic-view-of-a-coastline-42492/) | [720p MP4](https://assets.mixkit.co/videos/42492/42492-720.mp4) | 12 s, 1280×720, H.264, silent, fast start, 1,544,355 bytes |
| `public/videos/studio/wilderness.mp4` | [Elephants eating seen in detail](https://mixkit.co/free-stock-video/elephants-eating-seen-in-detail-3668/) | [720p MP4](https://assets.mixkit.co/videos/3668/3668-720.mp4) | 12 s, 1280×720, H.264, silent, fast start, 1,050,056 bytes |

Matching JPEG posters are `public/images/studio/city-film.jpg`, `coast-film.jpg` and `wilderness-film.jpg`, extracted at two seconds from each final clip. City footage is an unlabelled modern commercial skyline, not necessarily Dubai. Coast footage depicts an arid coastal landscape. The elephant footage shows Asian elephants; do not present it as a Botswana, Kruger or African elephant scene.

The separately reviewed Mixkit clips **37032** and **11054** carried the Restricted License and were **not used**. Candidate **4089** was licensed freely but omitted after visual review because its microlight framing was unsuitable.

## Photography

The following photographs were fetched directly from the Unsplash image CDN using `auto=format&fit=crop&w=1800&q=85`. [Unsplash License](https://unsplash.com/license) applies; retain these source references and replace illustrative pictures with approved agency/supplier media where necessary.

| Local file | Source | Observed subject |
| --- | --- | --- |
| `public/images/studio/family.jpg` | [Unsplash photo-1511895426328-dc8714191300](https://images.unsplash.com/photo-1511895426328-dc8714191300) | A multi-generation family together on a beach at sunset |
| `public/images/studio/private-pool.jpg` | [Unsplash photo-1571896349842-33c89424de2d](https://images.unsplash.com/photo-1571896349842-33c89424de2d) | An upmarket resort swimming pool and terraces at dusk; the filename does not establish exclusive/private access |
| `public/images/studio/rail.jpg` | [Lukas Seitz: red train through green countryside](https://unsplash.com/photos/a-red-train-traveling-through-a-lush-green-countryside-_zJmRY63EcY), [image](https://images.unsplash.com/photo-1672498821497-deee7c266a69) | Scenic red passenger train in the Swiss Alps |
| `public/images/studio/mountain-adventure.jpg` | [Unsplash photo-1464822759023-fed622ff2c3b](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b) | Broad mountain valley, woodland and snow-covered peaks |

All final videos were checked with ffprobe for duration, dimensions, codec and file size. All photo subjects and video posters were visually inspected. Download originals and rejected candidates were removed; only presentation outputs remain in the public video directory.

### Optimised island ambient clip

`public/videos/studio/islands.mp4` is derived locally from the existing `public/videos/hero.mp4`: 12 seconds, silent H.264, 1280px width, fast-start, 1,127,463 bytes. It replaces the 10,520,181-byte original for automatic ambient playback (approximately 89% smaller). The source attribution and usage rights of the original continue to apply; re-encoding grants no additional rights. The original remains available only for user-initiated longer film playback.
