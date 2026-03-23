const coords = mapData?.coordinates || [77.2090, 28.6139];

const map = L.map('map').setView(
  [coords[1], coords[0]],
  10
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

L.marker([coords[1], coords[0]])
  .addTo(map)
  .bindPopup(`
    <b>${mapData?.title || "Listing"}</b><br>
    ${mapData?.location || ""}
  `)
  .openPopup();