import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "index.json");

let errors = 0;

function fail(message) {
  errors += 1;
  console.error(`✗ ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Ungültige JSON-Datei: ${path.relative(ROOT, filePath)} (${error.message})`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function resolveEntryFile(entry, index) {
  if (!isNonEmptyString(entry.file)) {
    fail(`entries[${index}]: "file" fehlt.`);
    return null;
  }

  if (entry.file.startsWith("/") || entry.file.includes("\\") || entry.file.includes("..")) {
    fail(`entries[${index}]: Ungültiger Dateipfad "${entry.file}".`);
    return null;
  }

  const absolutePath = path.resolve(ROOT, entry.file);

  if (!absolutePath.startsWith(`${ROOT}${path.sep}`)) {
    fail(`entries[${index}]: Dateipfad verlässt das Repository.`);
    return null;
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    fail(`entries[${index}]: Datei existiert nicht: "${entry.file}".`);
    return null;
  }

  return absolutePath;
}

function hasUnsupportedCalendarAssets(calendar) {
  const definition = calendar.definition ?? {};

  if (isNonEmptyString(calendar.bannerImageRef)) {
    return true;
  }

  if (
    Array.isArray(definition.intercalaryDays) &&
    definition.intercalaryDays.some((day) => isNonEmptyString(day.imageRef))
  ) {
    return true;
  }

  return (
    Array.isArray(definition.moons) &&
    definition.moons.some(
      (moon) =>
        Array.isArray(moon.phaseImages) &&
        moon.phaseImages.length > 0
    )
  );
}

function validateCalendar(entry, file, index) {
  if (!entry.file.endsWith(".calendar.json")) {
    fail(`entries[${index}]: Kalenderdateien müssen auf ".calendar.json" enden.`);
  }

  const calendar = readJson(file);
  if (!calendar) return;

  if (calendar.kind !== "calendar") {
    fail(`entries[${index}]: "${entry.file}" ist keine CalendarFile.`);
  }

  if (calendar.id !== entry.id) {
    fail(
      `entries[${index}]: Index-ID "${entry.id}" stimmt nicht mit Calendar-ID "${calendar.id}" überein.`
    );
  }

  if (calendar.definition?.id !== entry.id) {
    fail(
      `entries[${index}]: definition.id in "${entry.file}" muss "${entry.id}" sein.`
    );
  }

  const months = calendar.definition?.months;
  const weekdays = calendar.definition?.weekdays;

  if (!Array.isArray(months) || months.length === 0) {
    fail(`entries[${index}]: Kalender benötigt mindestens einen regulären Monat.`);
  } else if (entry.monthCount !== months.length) {
    fail(
      `entries[${index}]: monthCount (${entry.monthCount}) stimmt nicht mit Monaten (${months.length}) überein.`
    );
  }

  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    fail(`entries[${index}]: Kalender benötigt mindestens einen Wochentag.`);
  } else if (entry.weekdayCount !== weekdays.length) {
    fail(
      `entries[${index}]: weekdayCount (${entry.weekdayCount}) stimmt nicht mit Wochentagen (${weekdays.length}) überein.`
    );
  }

  if (hasUnsupportedCalendarAssets(calendar)) {
    fail(
      `entries[${index}]: Community-Kalender dürfen aktuell keine Banner-, Mondphasen- oder Interkalartags-Bilder enthalten.`
    );
  }
}

function validateWeatherPack(entry, file, index) {
  if (!entry.file.endsWith(".weather-pack.json")) {
    fail(`entries[${index}]: Wetterpack-Dateien müssen auf ".weather-pack.json" enden.`);
  }

  const pack = readJson(file);
  if (!pack) return;

  if (pack.kind !== "weather-pack") {
    fail(`entries[${index}]: "${entry.file}" ist kein WeatherPackFile.`);
  }

  if (pack.id !== entry.id) {
    fail(
      `entries[${index}]: Index-ID "${entry.id}" stimmt nicht mit Weather-Pack-ID "${pack.id}" überein.`
    );
  }

  const profiles = Array.isArray(pack.monthProfiles) ? pack.monthProfiles : [];

  if (entry.monthCount !== profiles.length) {
    fail(
      `entries[${index}]: monthCount (${entry.monthCount}) stimmt nicht mit Monatsprofilen (${profiles.length}) überein.`
    );
  }
}

const index = readJson(INDEX_PATH);

if (!index) {
  process.exit(1);
}

if (index.schemaVersion !== 1) {
  fail('index.json: "schemaVersion" muss 1 sein.');
}

if (!Array.isArray(index.entries)) {
  fail('index.json: "entries" muss ein Array sein.');
} else {
  const ids = new Set();
  const files = new Set();

  index.entries.forEach((entry, indexNumber) => {
    const prefix = `entries[${indexNumber}]`;

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail(`${prefix}: Eintrag muss ein Objekt sein.`);
      return;
    }

    if (!isNonEmptyString(entry.id)) {
      fail(`${prefix}: "id" fehlt.`);
    } else if (ids.has(entry.id)) {
      fail(`${prefix}: doppelte ID "${entry.id}".`);
    } else {
      ids.add(entry.id);
    }

    if (entry.kind !== "calendar" && entry.kind !== "weather-pack") {
      fail(`${prefix}: "kind" muss "calendar" oder "weather-pack" sein.`);
    }

    for (const field of ["name", "description", "author", "license"]) {
      if (!isNonEmptyString(entry[field])) {
        fail(`${prefix}: "${field}" fehlt oder ist leer.`);
      }
    }

    if (!Array.isArray(entry.tags) || entry.tags.some((tag) => !isNonEmptyString(tag))) {
      fail(`${prefix}: "tags" muss ein String-Array sein.`);
    }

    if (!isNonNegativeInteger(entry.monthCount)) {
      fail(`${prefix}: "monthCount" muss eine ganze Zahl ab 0 sein.`);
    }

    if (entry.kind === "calendar" && !isPositiveInteger(entry.weekdayCount)) {
      fail(`${prefix}: Kalender benötigen "weekdayCount" größer als 0.`);
    }

    const file = resolveEntryFile(entry, indexNumber);
    if (!file) return;

    if (files.has(entry.file)) {
      fail(`${prefix}: Datei "${entry.file}" wird mehrfach im Index verwendet.`);
      return;
    }

    files.add(entry.file);

    if (entry.kind === "calendar") {
      validateCalendar(entry, file, indexNumber);
    }

    if (entry.kind === "weather-pack") {
      validateWeatherPack(entry, file, indexNumber);
    }
  });
}

if (errors > 0) {
  console.error(`\nValidierung fehlgeschlagen: ${errors} Fehler.`);
  process.exit(1);
}

console.log(`✓ Community-Library valide (${index.entries.length} Einträge).`);