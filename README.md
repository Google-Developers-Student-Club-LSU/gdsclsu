# GDSC Chapter Website

A modern web platform built for the Google Developer Student Club (GDSC) community. The platform centralizes chapter operations, member engagement, leadership visibility, event discovery, and sponsorship resources.

---

# Table of Contents

* [Overview](#overview)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Development](#development)
* [Build & Production](#build--production)
* [Contributors](#contributors)
* [License](#license)

---

# Overview

The GDSC Chapter Website functions as a central hub for the student developer community. It enables members to:

* Discover upcoming events
* Track engagement rankings via live leaderboards
* Explore organizational goals and initiatives
* View leadership and officer profiles
* Access sponsor and partnership resources

---

# Tech Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| Frontend Framework | Svelte                  |
| Meta Framework     | SvelteKit               |
| Styling            | Tailwind CSS            |
| Animation Engine   | GSAP                    |
| Smooth Scrolling   | Lenis                   |
| Authentication     | Firebase Authentication |
| Database           | Cloud Firestore         |
| Deployment         | Vercel                  |

---

# Project Structure

```text
src/
├── routes/
│   ├── officers/
│   ├── events/
│   ├── leaderboard/
│   └── taskboard/
│
├── lib/
│   ├── components/
│   └── firebase/
│
├── app.html
└── hooks.server.js
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Implycitt/gdsclsu.git
cd gdsc
```

## Install Dependencies

```bash
bun i
```

---

# Environment Variables

Create a `.env` file in the project root:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

---

# Development

Run the local development server:

```bash
bun run dev
```

Open:

```text
http://localhost:5173
```

---

# Build & Production

## Production Build

```bash
bun run build
```

## Preview Production Output

```bash
bun run preview
```

---

# Contributors

Developed and maintained by the GDSC Chapter Technical Team.

Contributions, pull requests, and feature suggestions are welcome.

---

# License

This project is licensed under the MIT License.
