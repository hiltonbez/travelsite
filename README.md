# Paper Plane Travel

Website for Paper Plane Travel, a worldwide holiday agency. Plain HTML, CSS and JavaScript, no build step.

**Live site:** https://hiltonbez.github.io/travelsite/ (GitHub Pages, published from `main`; every push updates it within a minute or two)

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Structure

```
index.html     page markup
css/styles.css styles (colours and fonts are CSS variables at the top)
js/main.js     destination data, search filter, mobile menu, contact form
```

## Enquiries

The contact form sends each enquiry straight into TribeTravel as a new enquiry
for Paper Plane Travel. To switch it on, sign in to TribeTravel as the agency,
open **Setup**, copy the website enquiry link
(`https://tribetravel.io/api/enquiry/<agency-slug>`) and paste it into
`TRIBETRAVEL_ENQUIRY_URL` near the bottom of `js/main.js`. Until then the form
tells visitors enquiries can't be sent yet.

Phone, destination, dates and number of travellers are added to the
enquiry's summary.

## Next steps

- Replace the sample destinations in `js/main.js` with real trips
- Swap the placeholder brand name, colours and images
- Point a custom domain at the site (repo Settings → Pages → Custom domain)
