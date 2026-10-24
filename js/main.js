// Sample destinations; replace with real data or an API call later.
const destinations = [
  { name: "Cape Town", country: "South Africa", price: 899, image: "photo-1580060839134-75a5edca2e99", blurb: "Table Mountain, winelands and dramatic coastline." },
  { name: "Zanzibar", country: "Tanzania", price: 1099, image: "photo-1586861635167-e5223aadc9fe", blurb: "White beaches, spice farms and historic Stone Town." },
  { name: "Bali", country: "Indonesia", price: 1249, image: "photo-1537996194471-e657df975ab4", blurb: "Rice terraces, temples and laid-back surf towns." },
  { name: "Santorini", country: "Greece", price: 1399, image: "photo-1570077188670-e3a8d69ac5ff", blurb: "Whitewashed villages and unforgettable sunsets." },
  { name: "Kyoto", country: "Japan", price: 1599, image: "photo-1493976040374-85c8e12f0c0e", blurb: "Ancient shrines, gardens and world-class food." },
  { name: "Marrakech", country: "Morocco", price: 949, image: "photo-1597212618440-806262de4f6b", blurb: "Bustling souks, riads and the Atlas Mountains." },
];

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
          <span class="price">From $${d.price.toLocaleString()}</span>
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
