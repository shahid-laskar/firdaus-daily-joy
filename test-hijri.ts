import { islamicMarker } from "./src/lib/hijri";
let found = false;
for (let i = 0; i < 400; i++) {
  const d = new Date(2026, 7, 14 + i);
  const marker = islamicMarker(d);
  if (marker) {
    console.log(d.toISOString().split("T")[0], marker);
    found = true;
  }
}
if (!found) console.log("No markers found");

