// Sample destinations with placeholder "from" prices in rand (ZAR), per person sharing.
// Replace with real packages or an API call later.
const destinations = [
  { name: "Bali", country: "Indonesia", price: 18999, image: "photo-1537996194471-e657df975ab4", blurb: "Rice terraces, temples and laid-back surf towns." },
  { name: "Santorini", country: "Greece", price: 24999, image: "photo-1570077188670-e3a8d69ac5ff", blurb: "Whitewashed villages and unforgettable sunsets." },
  { name: "Paris", country: "France", price: 21999, image: "photo-1502602898657-3e91760cbb34", blurb: "Cafés, galleries and evenings by the Seine." },
  { name: "Maldives", country: "Maldives", price: 34999, image: "photo-1514282401047-d79a71a590e8", blurb: "Overwater villas and the clearest water you'll ever see." },
  { name: "Kyoto", country: "Japan", price: 29999, image: "photo-1493976040374-85c8e12f0c0e", blurb: "Ancient shrines, gardens and world-class food." },
  { name: "Dubai", country: "United Arab Emirates", price: 14999, image: "photo-1512453979798-5ea266f8880c", blurb: "Desert dunes, skyline views and endless shopping." },
  { name: "Zanzibar", country: "Tanzania", price: 13999, image: "photo-1586861635167-e5223aadc9fe", blurb: "White beaches, spice farms and historic Stone Town." },
  { name: "Marrakech", country: "Morocco", price: 16999, image: "photo-1597212618440-806262de4f6b", blurb: "Bustling souks, riads and the Atlas Mountains." },
];

const formatRand = (amount) => "R" + amount.toLocaleString("en-ZA").replace(/[\s,]/g, " ");

const grid = document.getElementById("destination-grid");
const noResults = document.getElementById("no-results");

function renderDestinations(list) {
  grid.innerHTML = list
    .map(
      (d) => `
      <article class="card">
        <img src="https://images.unsplash.com/${d.image}?auto=format&fit=crop&w=600&q=70" alt="${d.name}, ${d.country}" loading="lazy">
        <div class="card-body">
          <h3>${d.name}</h3>
          <p>${d.country} · ${d.blurb}</p>
          <span class="price">From ${formatRand(d.price)} pps</span>
        </div>
      </article>`
    )
    .join("");
  noResults.hidden = list.length > 0;
}

renderDestinations(destinations);

// Search filters the destination cards
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  const matches = destinations.filter(
    (d) => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
  );
  renderDestinations(matches);
  document.getElementById("destinations").scrollIntoView({ behavior: "smooth" });
});

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") links.classList.remove("open");
});

// Contact form (front-end only for now; hook up to a backend or form service later)
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("form-status").textContent =
    "Thanks! We'll be in touch soon.";
  e.target.reset();
});

document.getElementById("year").textContent = new Date().getFullYear();
