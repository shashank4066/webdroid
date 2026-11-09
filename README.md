# WebDroid 📱

> **Android-style Phone in Your Browser (WebAssembly & Next.js)**

WebDroid is a browser-based Android smartphone emulator and OS experience. Boot it, unlock it, customize wallpapers, and install and run apps and games directly from the built-in local Play Store. Fully offline-capable, zero installation required, and powered by modern web technologies including WebAssembly (v86), Next.js, React, and Tailwind CSS.

---

## ✨ Features

- **Realistic Phone Frame & Interactions:**
  - Interactive device frame with dynamic scaling
  - Status bar with clock, battery level, Wi-Fi, and signal indicators
  - Punch-hole camera and physical buttons (Power, Volume Up / Down)
  - Android-style navigation (Back, Home, Recents)
  - Realistic boot splash animation and lock screen swipe to unlock
  - Notification shade and toast notification system

- **Local Play Store & App Ecosystem:**
  - Browse featured, top, and categorized apps and games
  - Install, launch, update, and uninstall apps locally
  - Offline app storage powered by IndexedDB
  - Built-in system utilities: Settings, Wallpapers, Device Info

- **Interactive Apps & Games:**
  - Built-in games and utilities running smoothly in the simulated runtime
  - Responsive app window manager with multi-tasking / Recents view
  - Context menus and app drawer with search

- **Modern Tech Stack:**
  - **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Radix UI
  - **State Management:** Zustand
  - **Storage:** IndexedDB (`idb-keyval` / custom IDB layer)
  - **Virtualization / Emulation:** [v86](https://github.com/copy/v86) (x86 WebAssembly emulator)
  - **Offline Support:** Progressive Web App (PWA) with Service Worker

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher) or [Bun](https://bun.sh/)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/webdroid.git
   cd webdroid
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Run the development server:**
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to start using WebDroid.

---

## 🛠️ Building for Production

To create an optimized production build:

```bash
bun run build
# or
npm run build
```

To start the production server:

```bash
bun start
# or
npm start
```

---

## 📂 Project Structure

```
├── prisma/               # Database schema (if applicable)
├── public/               # Static assets, icons, v86 wasm & BIOS binaries
│   ├── icons/            # App icons and PWA assets
│   ├── v86/              # WebAssembly x86 emulator engine and binaries
│   └── sw.js             # Service Worker for offline PWA support
├── src/
│   ├── app/              # Next.js App Router pages and layout
│   ├── components/
│   │   ├── ui/           # Radix UI and Shadcn components
│   │   └── webdroid/     # Android OS UI components (Phone, Launcher, Play Store)
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   ├── apps/         # App store catalog, bundled apps & metadata
│   │   └── idb.ts        # IndexedDB storage utilities
│   └── types/            # TypeScript definitions
└── package.json
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
