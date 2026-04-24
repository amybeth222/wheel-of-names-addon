# 🎡 Wheel of Names — Adobe Express Add-on

An interactive random name picker for Adobe Express. Add names, customize colors, spin, and reveal winners with confetti.

**[Live Demo](https://www.adobe.com/go/addon-cli)** • **[Released](https://github.com/)** • **[MIT License](LICENSE)**

---

## Features

- 📥 **Name Bucket** — Paste or type names in bulk, import all at once
- 🎨 **Color Palettes** — Choose from Vivid, Pastel, Neon, or Earth presets
- 🖼️ **Center Graphic** — Upload a custom image for branding
- 🎡 **Spin Animation** — Physics-eased wheel rotation with winner reveal
- 🎉 **Confetti Celebration** — Animated confetti burst on winner announcement
- 💾 **Session Persistence** — Your wheel state is saved locally

---

## Setup (one-time)

### 1. Enable Developer Mode in Adobe Express
1. Go to [new.express.adobe.com](https://new.express.adobe.com)
2. Click your **avatar** → **Settings**
3. Under **General**, toggle **Add-on Development** ON
4. Reload the page

### 2. Install dependencies
Make sure you have **Node.js 18+** installed, then run:

```bash
cd wheel-of-names-addon
npm install
```

### 3. Start the local dev server
```bash
npm start
```
This starts a local HTTPS server (usually at `https://localhost:5241`).

> **SSL cert:** If your browser blocks the localhost cert, visit `https://localhost:5241` directly and click "Advanced → Proceed" to trust it.

### 4. Load the add-on in Adobe Express
1. Open [new.express.adobe.com](https://new.express.adobe.com)
---

## Scripts

- `npm start` — Start local dev server (HTTPS on localhost:5241)
- `npm build` — Build the add-on to `dist/`
- `npm package` — Create a distributable zip file (`dist.zip`)
- `npm clean` — Clear the dist directory

---

## Deployment

To submit this add-on to the Adobe Express Marketplace:

1. Run `npm package` to generate `dist.zip`
2. Go to [Adobe Exchange](https://exchange.adobe.com/)
3. Submit your add-on with:
   - `dist.zip` file
   - Description, icon, screenshots
   - [Privacy policy](PRIVACY.md) ([included](PRIVACY.md))
   - [EULA](EULA.md) ([included](EULA.md))
   - [Release notes](RELEASE_NOTES.md)

---

## Development

### Tech Stack
- Vanilla JavaScript (no framework)
- HTML5 Canvas for wheel rendering
- CSS Grid & Flexbox responsive layout
- Built with [@adobe/ccweb-add-on-scripts](https://github.com/adobe/ccweb-add-on-scripts)

### Project Structure
```
wheel-of-names-addon/
├── src/
│   ├── index.html       ← main app + styles + scripts
│   └── manifest.json    ← Adobe add-on config
├── dist/                ← build output (generated)
├── package.json
├── README.md
├── LICENSE              ← MIT
├── RELEASE_NOTES.md
├── PRIVACY.md
└── EULA.md
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support

For issues, feature requests, or contributions, please open a GitHub issue or submit a pull request.

---

Made with ❤️ for Adobe Express

---

## Folder structure
```
wheel-of-names-addon/
├── package.json
└── src/
    ├── manifest.json   ← add-on config
    └── index.html      ← the full app
```

## Features
- 📥 **Name Bucket** — paste a bulk list, import all at once
- 🎨 **Color palettes** — Vivid, Pastel, Neon, Earth
- 🖼️ **Center graphic** — upload any image to the hub
- 🎡 **Spin** — physics-eased spin with confetti winner reveal
