# WebDroid 📱

> **Android-style Web Phone Simulator (Next.js, React, & WebAssembly)**

[![CI](https://github.com/shashank4066/webdroid/actions/workflows/ci.yml/badge.svg)](https://github.com/shashank4066/webdroid/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node: >=20.9.0](https://img.shields.io/badge/Node->=20.9.0-blue.svg)](https://nodejs.org/)

WebDroid is a browser-based Android-style smartphone simulation built with React and Next.js. It features a realistic phone chassis with physical hardware buttons, status bar, navigation bar, lock screen, on-device app store (**Droid Store**), and sandboxed web apps stored offline in IndexedDB. An optional **WASM Terminal** app boots a real 64 MB x86 Buildroot Linux virtual machine inside WebAssembly using [v86](https://github.com/copy/v86).

---

## 📸 Architecture & Capabilities

WebDroid is **not** an Android operating system emulator in its entirety—it is an interactive, client-side Android phone experience designed for web browsers:

- **Phone Shell (React 19 & Next.js 16):** Emulates an Android smartphone interface with dynamic status bar, clock, battery status (via Battery Status API), three-button navigation bar, lock screen gesture unlock, app drawer, and recents multi-tasking view.
- **Sandboxed App Runtime:** Apps run inside sandboxed `<iframe>` instances with `sandbox="allow-scripts allow-pointer-lock"`. Crucially, `allow-same-origin` is omitted to isolate apps from the host DOM and parent storage.
- **On-Device Storage Bridge:** Apps use a `postMessage` storage bridge that transparently maps `window.localStorage` calls to isolated per-app key-value stores inside IndexedDB.
- **Droid Store (Local Catalog):** Browse, install, update, and uninstall bundled on-device app packages. Downloads and installations are cancelable via `AbortController` and require zero network connectivity.
- **WebAssembly x86 Linux Guest (Optional):** The built-in WASM Terminal app runs [v86](https://github.com/copy/v86) to boot a 5.7 MB Buildroot Linux demo image on an emulated 32-bit x86 PC with 64 MB RAM, featuring mobile touch keyboard forwarding and background CPU pausing.
- **Offline PWA:** Progressive Web App service worker with on-demand runtime caching for WebAssembly binaries and demo images (saving initial download bandwidth).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.9.0` or higher
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shashank4066/webdroid.git
   cd webdroid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Visit [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the project and generates an optimized static export in `out/`.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint checks with core web vitals and TypeScript rules.
- `npm run typecheck`: Validates TypeScript types across the codebase with `tsc --noEmit`.
- `npm test`: Executes unit tests using Node's native test runner (`node:test`).

---

## 🔒 Security & Sandboxing

WebDroid isolates untrusted web applications using browser-native sandboxing:

1. **Strict Iframe Sandboxing:** App windows execute with `sandbox="allow-scripts allow-pointer-lock"`. Without `allow-same-origin`, app iframes have an opaque origin (`null`), preventing access to:
   - Parent `window` or `document` objects
   - Host cookies, session storage, and parent IndexedDB databases
   - Modification of their own sandbox attributes
2. **Storage Isolation:** App calls to `localStorage` are routed through a sandboxed in-memory polyfill that syncs via `postMessage` to per-app scoped storage partitions in IndexedDB.
3. **HTTP Security Headers:** Configured in `next.config.ts` including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and restrictive `Permissions-Policy`.

---

## 📂 Project Structure

```
├── .github/workflows/    # GitHub Actions CI workflow
├── public/
│   ├── icons/            # App icons and PWA manifest assets
│   ├── v86/              # v86 WebAssembly x86 emulator engine, BIOS, and Linux ISO
│   ├── manifest.webmanifest # PWA Web App Manifest
│   └── sw.js             # Offline-first Service Worker with on-demand engine caching
├── src/
│   ├── app/              # Next.js App Router (layout, styling, root page)
│   ├── components/webdroid/
│   │   ├── os/           # Phone OS components (launcher, chrome, store, drawer, recents)
│   │   ├── service-worker-register.tsx # Production-only SW registration with update alerts
│   │   └── webdroid-phone.tsx # Main phone chassis with responsive desktop & mobile layouts
│   ├── hooks/            # useNow, useBattery, useLongPress hooks
│   └── lib/
│       ├── apps/         # App store catalog, bundled HTML apps, and metadata
│       ├── idb.ts        # IndexedDB connection cache and isolated app storage
│       └── utils.ts      # CSS and class merging utilities
├── tests/                # Unit test suites (node:test)
├── THIRD_PARTY_NOTICES.md# Open source license notices (v86 BSD, Linux GPL-2.0, etc.)
└── package.json
```

---

## 📄 License & Attribution

- WebDroid source code is licensed under the [MIT License](LICENSE).
- The x86 virtualization engine ([v86](https://github.com/copy/v86)) is licensed under the BSD 2-Clause License.
- The Buildroot Linux demo image (`demo-linux.iso`) contains the Linux kernel and userspace binaries licensed under the GNU General Public License v2.0 (GPL-2.0).
- See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for full attribution and license texts.
