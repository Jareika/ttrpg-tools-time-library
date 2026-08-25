# Contributing to the TTRPG Tools – Time Community Library

This repository hosts community‑submitted calendar and weather data packs for the TTRPG Tools – Time plugin. All contributions must follow the rules below to ensure compatibility, safety, and legal clarity.

Thank you for contributing a calendar or weather pack.

## Rules

- Submit only JSON files.
- Every entry must be added to `index.json`.
- `id` in `index.json` must match the JSON file id.
- Add a clear description, author name, license, tags and month count.
- Do not add private vault paths.
- Community calendars may include:
  - banner images
  - moon phase images
  - named-day images
  when every asset is stored in `assets/` and declared in the calendar's
  `assets` array in `index.json`.
- Do not use local or private vault paths. Calendar image references must be
  logical repository-relative references such as:
  `assets/my-calendar/moons/full-moon.webp`.
- Do not include copyrighted content unless you have permission or a compatible license.

To clarify: a standard calendar structure does not create copyright issues, even if it comes from a fantasy setting. The following elements are generally safe to use:
- Calendar structure — Basic systems such as years, months, weeks, and day counts are considered factual data and are not protected by copyright.
- Month names — Using official month names (e.g., “Eleint”, “Hammer”, “Sun’s Height”) is typically allowed because names and short labels are not copyrightable.
- Weekday names — Simple names for weekdays or cycles are treated as unprotected factual identifiers.
- Numeric or structural rules — Rules such as “12 months”, “30 days each”, “10‑day week”, or “intercalary days” are functional systems, not creative expressions.
- Pure data — Lists of dates, holiday positions, leap‑day logic, moon cycles, or similar mechanical information are not protected.

What is protected and must not be included:
- Lore descriptions — Any narrative, story, or flavor text from published books.
- Copied rulebook text — Excerpts, paragraphs, or explanations taken directly from official sources.
- Artwork or tables — Images, diagrams, or stylized layouts from licensed products.

Contributors retain all rights to their submitted files. By submitting a calendar or weather pack, you grant permission for it to be publicly listed and downloaded through the community library.
This repository does not apply a global license to contributed content. Each file must declare its own license in its metadata.

## Add a calendar

1. Add the file to `calendars/`.
2. Name it `<id>.calendar.json`.
3. Add a `calendar` entry to `index.json`.
4. Set:
   - `monthCount` to the number of regular calendar months.
   - `weekdayCount` to the number of weekdays.
5. Open a pull request.

## Add a weather pack

1. Add the file to `weather-packs/`.
2. Name it `<id>.weather-pack.json`.
3. Add a `weather-pack` entry to `index.json`.
4. Set `monthCount` to the number of month profiles.
5. Open a pull request.

## Validation

Every pull request runs:

```bash
node scripts/validate-library.mjs

A passing validation does not automatically mean that the content is accepted.
Maintainers may reject or remove submissions that violate copyright, contain inappropriate content, or do not meet quality or metadata requirements.
```
