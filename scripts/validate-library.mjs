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
    fail(`Invalid JSON file: ${path.relative(ROOT, filePath)} (${error.message})`);
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
    fail(`entries[${index}]: missing "file".`);
    return null;
  }

  if (entry.file.startsWith("/") || entry.file.includes("\\") || entry.file.includes("..")) {
    fail(`entries[${index}]: invalid file path "${entry.file}".`);
    return null;
  }

  const absolutePath = path.resolve(ROOT, entry.file);

  if (!absolutePath.startsWith(`${ROOT}${path.sep}`)) {
    fail(`entries[${index}]: file path escapes the repository.`);
    return null;
  }

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    fail(`entries[${index}]: file does not exist: "${entry.file}".`);
    return null;
  }

  return absolutePath;
}

function getCalendarAssetRefs(calendar) {
  const definition = calendar.definition ?? {};
  const refs = new Set();

  if (isNonEmptyString(calendar.bannerImageRef)) {
    refs.add(calendar.bannerImageRef);
  }

  if (Array.isArray(definition.intercalaryDays)) {
    definition.intercalaryDays.forEach((day) => {
      if (isNonEmptyString(day.imageRef)) {
        refs.add(day.imageRef);
      }
    });
  }

  if (Array.isArray(definition.moons)) {
    definition.moons.forEach((moon) => {
      if (!Array.isArray(moon.phaseImages)) {
        return;
      }

      moon.phaseImages.forEach((phaseImage) => {
        if (isNonEmptyString(phaseImage.imageRef)) {
          refs.add(phaseImage.imageRef);
        }
      });
    });
  }

  return refs;
}

function validateAssets(entry, index) {
  if (entry.assets === undefined) {
    return new Set();
  }

  if (!Array.isArray(entry.assets)) {
    fail(`entries[${index}]: "assets" must be an array.`);
    return new Set();
  }

  const refs = new Set();

  entry.assets.forEach((asset, assetIndex) => {
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
      fail(`entries[${index}].assets[${assetIndex}]: asset must be an object.`);
      return;
    }

    if (!isNonEmptyString(asset.ref)) {
      fail(`entries[${index}].assets[${assetIndex}]: missing "ref".`);
      return;
    }

    if (
      asset.ref.startsWith("/") ||
      asset.ref.includes("\\") ||
      asset.ref.includes("..")
    ) {
      fail(`entries[${index}].assets[${assetIndex}]: invalid reference "${asset.ref}".`);
      return;
    }

    if (refs.has(asset.ref)) {
      fail(`entries[${index}].assets[${assetIndex}]: duplicate reference "${asset.ref}".`);
      return;
    }

    refs.add(asset.ref);

    const file = resolveEntryFile(
      { file: asset.file },
      `${index}.assets[${assetIndex}]`
    );

    if (!file) {
      return;
    }

    if (!asset.file.startsWith("assets/")) {
      fail(
        `entries[${index}].assets[${assetIndex}]: asset files must be located under "assets/".`
      );
    }
  });

  return refs;
}

function validateCalendar(entry, file, index) {
  if (!entry.file.endsWith(".calendar.json")) {
    fail(`entries[${index}]: calendar files must end in ".calendar.json".`);
  }

  const calendar = readJson(file);
  if (!calendar) return;

  if (calendar.kind !== "calendar") {
    fail(`entries[${index}]: "${entry.file}" is not a CalendarFile.`);
  }

  if (calendar.id !== entry.id) {
    fail(
      `entries[${index}]: index id "${entry.id}" does not match calendar id "${calendar.id}".`
    );
  }

  if (calendar.definition?.id !== entry.id) {
    fail(
      `entries[${index}]: definition.id in "${entry.file}" must be "${entry.id}".`
    );
  }

  const months = calendar.definition?.months;
  const weekdays = calendar.definition?.weekdays;

  if (!Array.isArray(months) || months.length === 0) {
    fail(`entries[${index}]: calendar requires at least one regular month.`);
  } else if (entry.monthCount !== months.length) {
    fail(
      `entries[${index}]: monthCount (${entry.monthCount}) does not match the number of months (${months.length}).`
    );
  }

  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    fail(`entries[${index}]: calendar requires at least one weekday.`);
  } else if (entry.weekdayCount !== weekdays.length) {
    fail(
      `entries[${index}]: weekdayCount (${entry.weekdayCount}) does not match the number of weekdays (${weekdays.length}).`
    );
  }

  const declaredAssetRefs = validateAssets(entry, index);
  const calendarAssetRefs = getCalendarAssetRefs(calendar);

  calendarAssetRefs.forEach((ref) => {
    if (!declaredAssetRefs.has(ref)) {
      fail(
        `entries[${index}]: calendar asset reference "${ref}" is missing from "assets".`
      );
    }
  });

  declaredAssetRefs.forEach((ref) => {
    if (!calendarAssetRefs.has(ref)) {
      fail(
        `entries[${index}]: asset "${ref}" is not used by the calendar.`
      );
    }
  });
}

function validateWeatherPack(entry, file, index) {
  if (!entry.file.endsWith(".weather-pack.json")) {
    fail(`entries[${index}]: weather-pack files must end in ".weather-pack.json".`);
  }

  const pack = readJson(file);
  if (!pack) return;

  if (pack.kind !== "weather-pack") {
    fail(`entries[${index}]: "${entry.file}" is not a WeatherPackFile.`);
  }

  if (pack.id !== entry.id) {
    fail(
      `entries[${index}]: index id "${entry.id}" does not match weather-pack id "${pack.id}".`
    );
  }

  const profiles = Array.isArray(pack.monthProfiles) ? pack.monthProfiles : [];

  if (entry.monthCount !== profiles.length) {
    fail(
      `entries[${index}]: monthCount (${entry.monthCount}) does not match the number of month profiles (${profiles.length}).`
    );
  }
}

const index = readJson(INDEX_PATH);

if (!index) {
  process.exit(1);
}

if (index.schemaVersion !== 1) {
  fail('index.json: "schemaVersion" must be 1.');
}

if (!Array.isArray(index.entries)) {
  fail('index.json: "entries" must be an array.');
} else {
  const ids = new Set();
  const files = new Set();

  index.entries.forEach((entry, indexNumber) => {
    const prefix = `entries[${indexNumber}]`;

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail(`${prefix}: entry must be an object.`);
      return;
    }

    if (!isNonEmptyString(entry.id)) {
      fail(`${prefix}: missing "id".`);
    } else if (ids.has(entry.id)) {
      fail(`${prefix}: duplicate id "${entry.id}".`);
    } else {
      ids.add(entry.id);
    }

    if (entry.kind !== "calendar" && entry.kind !== "weather-pack") {
      fail(`${prefix}: "kind" must be "calendar" or "weather-pack".`);
    }

    for (const field of ["name", "description", "author", "license"]) {
      if (!isNonEmptyString(entry[field])) {
        fail(`${prefix}: "${field}" is missing or empty.`);
      }
    }
	
    if (
      !isNonEmptyString(entry.language) ||
      !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(entry.language)
    ) {
      fail(`${prefix}: "language" must be a valid language code, for example "de" or "en".`);
    }

    if (!Array.isArray(entry.tags) || entry.tags.some((tag) => !isNonEmptyString(tag))) {
      fail(`${prefix}: "tags" must be an array of strings.`);
    }

    if (!isNonNegativeInteger(entry.monthCount)) {
      fail(`${prefix}: "monthCount" must be a non-negative integer.`);
    }

    if (entry.kind === "calendar" && !isPositiveInteger(entry.weekdayCount)) {
      fail(`${prefix}: calendar entries require a "weekdayCount" greater than 0.`);
    }

    const file = resolveEntryFile(entry, indexNumber);
    if (!file) return;

    if (files.has(entry.file)) {
      fail(`${prefix}: file "${entry.file}" is used more than once in the index.`);
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
  console.error(`\nValidation failed: ${errors} error${errors === 1 ? "" : "s"}.`);
  process.exit(1);
}

console.log(
  `✓ Community library is valid (${index.entries.length} ${
    index.entries.length === 1 ? "entry" : "entries"
  }).`
);