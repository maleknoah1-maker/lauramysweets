// Values derived from the editable data files, so nothing here is ever typed twice.
import fs from "node:fs";

const read = (name) => JSON.parse(fs.readFileSync(new URL(`./${name}`, import.meta.url), "utf8"));

export default function () {
  const quick = read("quickOrder.json");
  const menu = read("menu.json");
  const settings = read("settings.json");

  const available = quick.designs.filter((d) => d.available);
  const quickPrices = available.flatMap((d) => [d.price6, d.price8]).filter((n) => typeof n === "number");
  const quickFrom = quickPrices.length ? Math.min(...quickPrices) : null;

  const cakeFrom = Math.min(...menu.cakes.items.map((i) => i.price));
  const cupcakeFrom = Math.min(...menu.cupcakes.items.filter((i) => i.unit === "dozen").map((i) => i.price));
  const cakePopFrom = Math.min(...menu.cakePops.items.map((i) => i.price));

  // "Order by 11 AM Sunday for Friday pickup" and so on, generated from noticeDays.
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [h, m] = quick.cutoffTime.split(":").map(Number);
  const cutoffLabel = `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`;
  const cutoffSchedule = days.map((orderDay, i) => ({
    orderDay,
    pickupDay: days[(i + quick.noticeDays) % 7],
  }));

  // Phone links need +1 and digits only; Laura only ever edits the readable number.
  const tel = "+1" + settings.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

  return {
    tel,
    quickFrom,
    quickAvailable: available,
    cakeFrom,
    cupcakeFrom,
    cakePopFrom,
    cutoffLabel,
    cutoffSchedule,
  };
}
