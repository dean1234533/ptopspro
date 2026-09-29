# PT Ops Pro: a toolkit for mobile personal trainers

**A business operations app for mobile personal trainers. It covers client enquiries, outreach tracking, prospect scouting, scheduling, and an operations playbook, and runs as a web app, a PWA, or an Electron desktop app.**

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Gumroad](https://img.shields.io/badge/Gumroad-FF90E8?style=flat-square&logo=gumroad&logoColor=black)

---

## Screenshots

<!-- Add images to docs/screenshots/ and uncomment. -->
<!--
| Client enquiries | Outreach | Playbook |
|---|---|---|
| ![](docs/screenshots/clients.png) | ![](docs/screenshots/outreach.png) | ![](docs/screenshots/playbook.png) |
-->

_Screenshots coming soon._

---

## Features

- **Client enquiries.** Log and manage incoming enquiries, including manual entry.
- **Outreach tracker** with outreach history for agencies, studios, and gyms
- **Prospect tracker** that scouts new opportunities from RSS feeds
- **Schedule** for managing sessions
- **Operations playbook.** Step-by-step guidance for running a mobile PT business.
- **Business templates** for cold outreach and client communication (see
  [`docs/business-templates.md`](docs/business-templates.md))
- **Gumroad licensing.** A Cloudflare Pages Function webhook grants access
  after purchase.
- Runs on the **web and as an Electron desktop app** (`com.ptops.pro`)

The repo also includes the companion ebooks, *Mobile PT Survival Guide* and
*Mobile PT Manifesto*, in `pt cheat sheet doc/`, along with the scripts that
generate their PDFs.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Firebase Auth and Firestore |
| Edge | Cloudflare Workers static assets and a Pages Function (Gumroad webhook) |
| Desktop | Electron and electron-builder |
| Documents | Puppeteer-based PDF generation |

---

## Getting started

```bash
git clone https://github.com/dean1234533/ptopspro.git
cd ptopspro
npm install
npm run dev              # web app
npm run electron:dev     # desktop app (dev)
npm run electron:build   # package desktop app
```

Add your Firebase web config to the environment. The Gumroad webhook needs
`WEBHOOK_SECRET` and a Firebase service account, set as Cloudflare
environment variables.

---

## Project structure

```
src/components/   ClientList, EnquiryForm, LeadDashboard, RssScout, Schedule, Playbook, Settings, AuthScreen
functions/api/    gumroad-webhook.js (Cloudflare Pages Function → Firestore REST)
main.cjs, preload.cjs   Electron main + preload
docs/             PT business templates (MD + PDF)
generate-pdfs.cjs PDF generation
```

---

## Author

Built by **Dean Da Dev**, a UK full-stack developer building web apps, websites,
and AI tools.

🌐 [dean-da-dev.co.uk](https://www.dean-da-dev.co.uk/) · 💼 [More projects](https://www.dean-da-dev.co.uk/portfolio) · 🐙 [GitHub](https://github.com/dean1234533)
