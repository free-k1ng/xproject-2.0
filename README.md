# StreamFinder & Stremio Toolset 🎬

A collection of tools for searching media, managing Stremio tokens, and finding high-quality streams.

## 📁 Project Structure

| Component | Description |
| :--- | :--- |
| **[streamfinder-web](./streamfinder-web)** | Full Node.js/Express web application for movie/TV discovery and streaming. |
| **[stremio-token-manager](./stremio-token-manager)** | CLI utility to extract and manage your Stremio authentication tokens. |
| **[docs](./docs)** | Static documentation site (hosted on GitHub Pages). |
| **tmdb to vix _ v2.html** | Standalone, single-file versions of the search tool. |

---

## 🚀 Getting Started

### 1. StreamFinder Web (Full App)
The main web application provides a rich interface for searching TMDB and finding streams.
- **Location:** `/streamfinder-web`
- **Setup:**
  ```bash
  cd streamfinder-web
  npm install
  npm start
  ```
- **Features:** TMDB proxying, Stremio token integration, VixSrc integration.

### 2. Stremio Token Manager
Use this to extract your Stremio `authKey` which allows the web app to automatically log you into Stremio Web.
- **Location:** `/stremio-token-manager`
- **Login:**
  ```bash
  cd stremio-token-manager
  npm install
  npm run login
  ```

---

## 🛠 Features

- **TMDB Integration**: Browse trending movies and TV shows.
- **Stremio Sync**: Inject your authentication token directly into Stremio Web.
- **Multiple Sources**: Integration with VixSrc, VidSrc, Embed.su, and more.
- **Responsive Design**: Works on Desktop and Mobile.

## ⚠️ Security Warning

- **Never** share your `token.json` or `authKey`. It provides full access to your Stremio account.
- The `.gitignore` in this repository is configured to ignore `token.json` and `.env` files. Ensure they are never committed to version control.

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.
