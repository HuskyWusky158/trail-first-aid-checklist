const API_URL = "http://localhost:8080/api/checklist";

const form = document.getElementById("trip-form");
const checklistEl = document.getElementById("checklist");
const errorEl = document.getElementById("error");
const safetyPlanEl = document.getElementById("safety-plan");
const copyStatusEl = document.getElementById("copyStatus");

let currentTrip = null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";
  checklistEl.innerHTML = "";

  const trip = {
    miles: Number(document.getElementById("miles").value),
    terrain: document.getElementById("terrain").value,
    season: document.getElementById("season").value,
    elevationGainFt: Number(document.getElementById("elevationGainFt").value),
    bringingDog: document.getElementById("bringingDog").checked,
    overnight: document.getElementById("overnight").checked,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const items = await response.json();
    renderChecklist(items);

    currentTrip = trip;
    safetyPlanEl.hidden = false;
  } catch (err) {
    errorEl.textContent = `Could not generate checklist: ${err.message}`;
  }
});

const CATEGORY_ORDER = ["NAVIGATION", "GEAR", "FIRST_AID", "FOOD_WATER", "DOG"];
const CATEGORY_LABELS = {
  NAVIGATION: "Navigation",
  GEAR: "Gear",
  FIRST_AID: "First Aid",
  FOOD_WATER: "Food & Water",
  DOG: "Dog",
};

function renderChecklist(items) {
  const grouped = new Map();
  for (const item of items) {
    if (!grouped.has(item.category)) {
      grouped.set(item.category, []);
    }
    grouped.get(item.category).push(item);
  }

  let itemId = 0;
  for (const category of CATEGORY_ORDER) {
    const categoryItems = grouped.get(category);
    if (!categoryItems) continue;

    const group = document.createElement("div");
    group.className = "checklist-group";

    const heading = document.createElement("h2");
    heading.textContent = CATEGORY_LABELS[category] ?? category;
    group.appendChild(heading);

    for (const item of categoryItems) {
      itemId++;
      const row = document.createElement("div");
      row.className = "checklist-item";
      if (item.essential) {
        row.classList.add("essential");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `item-${itemId}`;
      row.appendChild(checkbox);

      const label = document.createElement("label");
      label.htmlFor = checkbox.id;

      const name = document.createElement("span");
      name.className = "item-name";
      name.textContent = item.name;
      label.appendChild(name);

      if (item.note) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = item.note;
        label.appendChild(note);
      }

      row.appendChild(label);
      group.appendChild(row);
    }

    checklistEl.appendChild(group);
  }
}

const TERRAIN_LABELS = { EASY: "Easy", MODERATE: "Moderate", STRENUOUS: "Strenuous" };
const SEASON_LABELS = { SPRING: "Spring", SUMMER: "Summer", FALL: "Fall", WINTER: "Winter" };

function buildPlanText() {
  const trailhead = document.getElementById("trailhead").value.trim() || "Not specified";
  const expectedReturnRaw = document.getElementById("expectedReturn").value;
  const expectedReturn = expectedReturnRaw
    ? new Date(expectedReturnRaw).toLocaleString()
    : "Not specified";
  const contactName = document.getElementById("contactName").value.trim();
  const notes = document.getElementById("safetyNotes").value.trim();

  const tripSummary = currentTrip
    ? `${currentTrip.miles} mi, ${TERRAIN_LABELS[currentTrip.terrain]} terrain, ` +
      `${SEASON_LABELS[currentTrip.season]}, ${currentTrip.elevationGainFt} ft elevation gain` +
      `${currentTrip.bringingDog ? ", bringing my dog" : ""}` +
      `${currentTrip.overnight ? ", overnight trip" : ""}`
    : "Not specified";

  return [
    "SOLO HIKE SAFETY PLAN",
    "",
    `Hiker: ${contactName ? `checking in with ${contactName}` : "solo"}`,
    `Trailhead / location: ${trailhead}`,
    `Trip details: ${tripSummary}`,
    `Expected return: ${expectedReturn}`,
    notes ? `Notes: ${notes}` : null,
    "",
    "If you have not heard from me by the expected return time, please try to reach me, " +
      "then contact local park rangers or emergency services (911 in the US) with this information.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function showCopyStatus(message) {
  copyStatusEl.textContent = message;
  setTimeout(() => {
    copyStatusEl.textContent = "";
  }, 3000);
}

document.getElementById("copyPlanBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(buildPlanText());
    showCopyStatus("Copied to clipboard.");
  } catch (err) {
    showCopyStatus("Could not copy — select and copy the text manually.");
  }
});

document.getElementById("emailPlanBtn").addEventListener("click", () => {
  const contactInfo = document.getElementById("contactInfo").value.trim();
  const recipient = contactInfo.includes("@") ? contactInfo : "";
  const subject = encodeURIComponent("My solo hike safety plan");
  const body = encodeURIComponent(buildPlanText());
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});

document.getElementById("textPlanBtn").addEventListener("click", () => {
  const contactInfo = document.getElementById("contactInfo").value.trim();
  const number = !contactInfo.includes("@") ? contactInfo.replace(/[^0-9+]/g, "") : "";
  const body = encodeURIComponent(buildPlanText());
  window.location.href = `sms:${number}?&body=${body}`;
});

/* ---------- Trail map ---------- */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const mapStatusEl = document.getElementById("mapStatus");

const trailMap = L.map("trailMap").setView([47.6062, -122.3321], 11); // default: Seattle, WA

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(trailMap);

let trailLayer = L.layerGroup().addTo(trailMap);
let foundTrails = [];

document.getElementById("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    mapStatusEl.textContent = "Geolocation isn't supported in this browser.";
    return;
  }
  mapStatusEl.textContent = "Finding your location...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      trailMap.setView([position.coords.latitude, position.coords.longitude], 13);
      mapStatusEl.textContent = "Found you. Click \"Search this area\" to load nearby trails.";
    },
    () => {
      mapStatusEl.textContent = "Couldn't get your location — pan the map manually instead.";
    }
  );
});

document.getElementById("searchAreaBtn").addEventListener("click", searchTrailsInView);

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function searchTrailsInView() {
  const bounds = trailMap.getBounds();
  const bbox = [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast(),
  ].join(",");

  mapStatusEl.textContent = "Searching for trails...";
  trailLayer.clearLayers();
  foundTrails = [];

  const query = `[out:json][timeout:25];(way["highway"~"^(path|footway|track)$"]["foot"!="no"](${bbox}););out geom;`;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass responded with ${response.status}`);
    }

    const data = await response.json();
    renderTrails(data.elements ?? []);
  } catch (err) {
    mapStatusEl.textContent = `Could not load trails: ${err.message}`;
  }
}

function renderTrails(ways) {
  let count = 0;

  for (const way of ways) {
    if (!way.geometry || way.geometry.length < 2) continue;

    const latlngs = way.geometry.map((point) => [point.lat, point.lon]);

    let miles = 0;
    for (let i = 1; i < latlngs.length; i++) {
      miles += haversineMiles(latlngs[i - 1][0], latlngs[i - 1][1], latlngs[i][0], latlngs[i][1]);
    }

    const name = way.tags?.name || "Unnamed trail";
    const index = foundTrails.push({ name, miles }) - 1;

    const polyline = L.polyline(latlngs, { color: "#2c6e49", weight: 3 }).addTo(trailLayer);
    polyline.bindPopup(
      `<div class="trail-popup">` +
        `<h3>${escapeHtml(name)}</h3>` +
        `<p>${miles.toFixed(1)} mi</p>` +
        `<button type="button" onclick="useTrail(${index})">Use this trail</button>` +
        `</div>`
    );

    count++;
  }

  mapStatusEl.textContent =
    count > 0
      ? `Found ${count} trail${count === 1 ? "" : "s"}. Click one to use its distance.`
      : "No trails found in this area — try zooming out or panning.";
}

window.useTrail = function (index) {
  const trail = foundTrails[index];
  if (!trail) return;

  document.getElementById("miles").value = trail.miles.toFixed(1);
  document.getElementById("trip-form").scrollIntoView({ behavior: "smooth" });
  mapStatusEl.textContent = `Using "${trail.name}" (${trail.miles.toFixed(1)} mi) — fill in the rest of your trip details below.`;
};
