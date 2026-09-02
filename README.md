# PRABODHA

**Awakening through knowledge** — a monthly, newspaper-style front page covering technology, science, and innovation. Built as static HTML/CSS/JS (no backend, no build step).

## Overview

PRABODHA renders each month's "issue" from a plain JS data file into a broadsheet-newspaper-style front page. Past issues stay permanently accessible and full-text searchable in the Archive.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Current issue front page (or a specific issue via `?edition=` query param) |
| `archive.html` | List of all past issues with full-text search |
| `about.html` | About / masthead explanation page |
<!-- | `editor.html` | Standalone visual editor for authoring new issues (generates a `window.ISSUE = {...}` data file + live preview) | -->

## Data / Logic Files

| File | Purpose |
|---|---|
| `script.js` | Renders `window.ISSUE` data into the DOM on `index.html` (highlights, lead story, market watch, infographic, footer, etc.) and handles the article overlay |
| `archive-data.js` | Registry of all published issues — add one entry per month here (newest first) |
<!-- | `data-sample.js` | Example/sample issue data file (shape reference for `window.ISSUE`) |
| `issues/VOL-1/issue-1.js` | Actual issue data file (referenced from `archive-data.js`) | -->
| `qrcode-gen.js` | Generates the QR code in each page's footer, linking back to that exact edition |
| `html2canvas-gen.js` | Powers the "Download as Image" button on `index.html` |
| `style.css` | All styling — newsprint palette, typography (Fraunces / Source Serif 4 / JetBrains Mono), light + dark theme via `[data-theme="dark"]` |

## How an Issue is Structured

Each issue is a JS file that sets `window.ISSUE` to an object containing:
- `motto`, `issueline` — masthead text
- `highlights` — top headline strip
- `lead` — cover story
- `demoTab` — table/section below the cover story
- `inBrief` — "Short Story" sidebar items
- `market` — Market Watch table
- `startupSpotlight` — sidebar spotlight block
- `secondary` — 3-column secondary stories
- `featured`, `featured2` — featured story pair
- `infographic` — donut-chart infographic data
- `bottomStrip` — anchor stories row
- `footer` — links, tag, extra text

See `data-sample.js` for a full working example.

## Publishing a New Issue

1. Open `editor.html`, fill in the fields (or paste/edit JSON), and use the live preview.
2. Export the generated `window.ISSUE = {...}` data file and save it under `issues/VOL-X/issue-Y.js`.
3. Add a new entry to the **top** of the array in `archive-data.js`:
   ```js
   {
     date: "MONTH YEAR",
     issue: "VOL. X · ISSUE Y",
     headline: "Lead story headline",
     data: "issues/VOL-X/issue-Y.js",
   }
   ```
4. The new issue automatically becomes the current issue on `index.html` and appears in the Archive.

## Features

- **Archive search** — fuzzy, typo-tolerant full-text search across every issue's headlines and body text (indexed client-side on load).
- **QR code per issue** — every page footer embeds a QR code linking to that exact edition.
- **Download as Image** — exports the current front page as a PNG (via `html2canvas-gen.js`).
- **Light/Dark theme** — toggle persisted in `localStorage`.
- **Live masthead clock** — current date/time/timezone shown in the header.
- **Auto-updating copyright year** — footer copyright (`© YYYY PRABODHA...`) is generated with `new Date().getFullYear()`, so it always shows the current year with no manual updates needed.

## Tech Stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build tools, no server required. Fonts loaded from Google Fonts (Fraunces, Source Serif 4, JetBrains Mono).



# Copyright and License Notice

Copyright © 2026 Tanmay Saha. All rights reserved.

## Source Code

This project's source code is proprietary and is **not licensed for reuse, modification, redistribution, sublicensing, publication, or commercial use**.

No permission is granted to copy, reproduce, modify, merge, adapt, distribute, sublicense, sell, publish, or incorporate any portion of this source code into another project, software, product, or service without prior **written permission from the copyright holder**.

Viewing, accessing, or downloading the source code does not grant any license or other rights to use the source code beyond what is expressly permitted by the copyright holder.

## Project Name, Trademarks, and Branding

The project's name, trademarks, logo, favicon, branding, visual identity, and related materials are **not licensed for use**.

No permission is granted to use these materials to represent, advertise, promote, or imply an official association with, endorsement by, sponsorship by, or affiliation with the original project or its author.

## Original Creative Content

The project's original written content, articles, documentation, illustrations, graphics, artwork, photographs, images, and other creative assets are Copyright © 2026 Tanmay Saha. All rights reserved.

These materials may not be copied, reproduced, modified, adapted, distributed, republished, or used in another project or brand without prior written permission.

## Third-Party Materials

Third-party software, libraries, dependencies, fonts, images, or other materials included in or used by this project remain subject to their respective licenses and copyright notices. Nothing in this notice is intended to override those licenses.

## Permission Requests

If you wish to use, modify, redistribute, incorporate, or commercially exploit any portion of this project's source code or copyrighted materials, you must obtain prior written permission from Tanmay Saha.

Unless such permission is expressly granted in writing, **all rights are reserved**.
