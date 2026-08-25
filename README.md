# TTRPG Tools – Time Community Library

This repository contains community-created calendars and weather packs for the **TTRPG Tools – Time** Obsidian plugin.

The plugin can browse this library and install entries directly from its Community Downloads screen.

## Contents

- `index.json` — public library index used by the plugin
- `calendars/` — calendar JSON files
- `weather-packs/` — weather-pack JSON files
- `assets/` — optional images used by community calendars
- `scripts/validate-library.mjs` — validation script run by GitHub Actions

## Add a new entry

To contribute a calendar or weather pack:

1. Fork this repository.
2. Create a new branch.
3. Add your JSON file in the appropriate folder.
4. Add a matching entry to `index.json`.
5. Run the validation script locally:
   ```bash
   node scripts/validate-library.mjs
   ```
6. Open a Pull Request.

Every Pull Request is validated automatically.

## General rules

All entries must:

- Use a unique, stable `id`.
- Include a name, description, author, license, language, tags, and month count.
- Use only JSON files.
- Be listed in `index.json`.
- Use file names matching their entry id.
- Avoid private vault paths, local machine paths, and personal data.
- Only include content you are allowed to publish.

The `id` in `index.json` must match the `id` inside the JSON file.

> [!IMPORTANT]
> Do not include copied lore text, rulebook excerpts, artwork, maps, or other copyrighted material unless you own it or have permission to redistribute it.

Calendar structures, month names, weekday names, numeric date systems, leap rules, and similar functional data are generally appropriate contributions. Original descriptions and metadata are encouraged.

---

# Adding a calendar

## 1. Create the calendar JSON file

Add your file to:

```text
calendars/<calendar-id>.calendar.json
```

For example:

```text
calendars/my-fantasy-calendar.calendar.json
```

## 2. Add an entry to `index.json`

Add an object to the `entries` array.

### Blank calendar entry

```json
{
  "id": "my-fantasy-calendar",
  "kind": "calendar",
  "name": "My Fantasy Calendar",
  "description": "A short description of the calendar and its intended setting or rules.",
  "author": "Your Name",
  "license": "CC0-1.0",
  "language": "en",
  "tags": [
    "fantasy",
    "homebrew"
  ],
  "monthCount": 12,
  "weekdayCount": 7,
  "file": "calendars/my-fantasy-calendar.calendar.json",
  "assets": [
   {
      "ref": "assets/my-fantasy-calendar/banner.webp",	←←←←The file path in the calendar.json
      "file": "assets/my-fantasy-calendar/banner.webp"	←←←←The file path in the repository
    }
  ]
}
```

### Calendar entry fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Unique stable identifier. Use lowercase letters, digits, and hyphens. |
| `kind` | Yes | Must be `"calendar"`. |
| `name` | Yes | Display name shown in the plugin. |
| `description` | Yes | Short explanation of the calendar. |
| `author` | Yes | Creator or contributor name. |
| `license` | Yes | License for this specific contribution, for example `CC0-1.0`, `CC-BY-4.0`, or `MIT`. |
| `language` | Yes | Language code such as `en`, `de`, `fr`, or `pt-BR`. |
| `tags` | Yes | Array of searchable tags. |
| `monthCount` | Yes | Number of regular months in `definition.months`. |
| `weekdayCount` | Yes | Number of weekdays in `definition.weekdays`. |
| `file` | Yes | Repository-relative path to the calendar JSON file. |
| `assets` | No | Optional array of images used by the calendar. Use `[]` when no assets are needed. |

---

# Adding a weather pack

## 1. Create the weather-pack JSON file

Add your file to:

```text
weather-packs/<weather-pack-id>.weather-pack.json
```

For example:

```text
weather-packs/coastal-temperate.weather-pack.json
```

## 2. Add an entry to `index.json`

### Blank weather-pack entry

```json
{
  "id": "coastal-temperate",
  "kind": "weather-pack",
  "name": "Coastal Temperate",
  "description": "A mild coastal climate with frequent rain, moderate winds, and cool winters.",
  "author": "Your Name",
  "license": "CC0-1.0",
  "language": "en",
  "tags": [
    "weather",
    "coastal",
    "temperate"
  ],
  "monthCount": 12,
  "file": "weather-packs/coastal-temperate.weather-pack.json",
  "assets": []
}
```

### Weather-pack entry fields

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Unique stable identifier. Use lowercase letters, digits, and hyphens. |
| `kind` | Yes | Must be `"weather-pack"`. |
| `name` | Yes | Display name shown in the plugin. |
| `description` | Yes | Short climate description. |
| `author` | Yes | Creator or contributor name. |
| `license` | Yes | License for this specific contribution. |
| `language` | Yes | Language code such as `en` or `de`. |
| `tags` | Yes | Array of searchable tags. |
| `monthCount` | Yes | Number of entries in `monthProfiles`. |
| `file` | Yes | Repository-relative path to the weather-pack JSON file. |
| `assets` | No | Usually empty; weather packs currently do not require assets. |

> [!NOTE]
> Weather-pack entries do **not** use `weekdayCount`.

---

# Calendar assets

Calendars may include optional images, such as:

- Calendar banner images
- Moon-phase images
- Named-day or intercalary-day images

Store all assets under:

```text
assets/<calendar-id>/
```

For example:

```text
assets/my-fantasy-calendar/banner.webp
assets/my-fantasy-calendar/moons/full-moon.webp
assets/my-fantasy-calendar/holidays/midwinter.webp
```

Every image reference used inside the calendar JSON must be declared in the calendar entry’s `assets` array.

### Example asset declaration

```json
{
  "id": "my-fantasy-calendar",
  "kind": "calendar",
  "name": "My Fantasy Calendar",
  "description": "Example calendar with optional image assets.",
  "author": "Your Name",
  "license": "CC0-1.0",
  "language": "en",
  "tags": ["fantasy"],
  "monthCount": 12,
  "weekdayCount": 7,
  "file": "calendars/my-fantasy-calendar.calendar.json",
  "assets": [
    {
      "ref": "assets/my-fantasy-calendar/banner.webp",	   ←←←←The file path in the calendar.json
      "file": "assets/my-fantasy-calendar/banner.webp"	   ←←←←The file path in the repository
    },
    {
      "ref": "assets/my-fantasy-calendar/moons/full-moon.webp",		←←←←The file path in the calendar.json
      "file": "assets/my-fantasy-calendar/moons/full-moon.webp"		←←←←The file path in the repository
    }
  ]
}
```

The `ref` value must match the corresponding `imageRef` or `bannerImageRef` used in the calendar JSON.

For example:

```json
{
  "bannerImageRef": "assets/my-fantasy-calendar/banner.webp"
}
```

## Asset requirements

- Assets must be located inside `assets/`.
- Use repository-relative paths.
- Do not use `..`, absolute paths, Windows paths, or private vault paths.
- Only submit images you are legally allowed to redistribute.
- Every declared asset must be used by the calendar.
- Every asset referenced by the calendar must be declared in `index.json`.

---

# Validation

Before opening a Pull Request, run:

```bash
node scripts/validate-library.mjs
```

The validator checks, among other things:

- `index.json` syntax and schema version
- Required metadata fields
- Unique ids and file paths
- Calendar and weather-pack file naming
- Matching ids between index entries and JSON files
- Calendar month and weekday counts
- Weather-pack month-profile counts
- Calendar image asset declarations

A successful validation means the repository structure is valid. It does not guarantee that a contribution will be accepted.

## Pull Request checklist

Before submitting, confirm that:

- [ ] My JSON file is in the correct folder.
- [ ] My file name matches the required format.
- [ ] My `id` matches in `index.json` and in the JSON file.
- [ ] My metadata is complete.
- [ ] `monthCount` is correct.
- [ ] `weekdayCount` is correct for calendar entries.
- [ ] All calendar assets are inside `assets/` and declared in `index.json`.
- [ ] I have the right to publish all submitted content.
- [ ] `node scripts/validate-library.mjs` passes successfully.

Thank you for helping grow the TTRPG Tools – Time community library.
