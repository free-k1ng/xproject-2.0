# StreamFinder Web 🎬

A dynamic Node.js application for discovering and streaming media with Stremio integration.

## 🚀 Deployment

This is a **Node.js application** (using Express). It requires a Node.js runtime environment to function safely and securely.

### Why Node.js?
- **Security**: Proxies requests to TMDB to protect API keys.
- **Authentication**: Securely handles Stremio login and token management.
- **Proxying**: Fetches links from the WebStreamr addon to bypass CORS issues.

### Recommended Hosting
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Heroku](https://heroku.com)
- [Glitch](https://glitch.com)

---

## 🛠 Setup & Local Usage

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Set Environment Variables** (Optional):
   Create a `.env` file or set environment variables:
   - `PORT`: Server port (default: 3000)
   - `TMDB_API_KEY`: Your TMDB API Key (optional, defaults to built-in key)
3. **Start the Server**:
   ```bash
   npm start
   ```
4. **Access**:
   Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Stremio Token Integration

StreamFinder Web can automatically inject your Stremio credentials if you use the [Stremio Token Manager](../stremio-token-manager).

1. Run the login script in `stremio-token-manager`.
2. The `token.json` file will be shared with the web app.
3. When you open a stream, the app will automatically log you into Stremio Web in a new tab.

---

## ⚠️ Important Note

This application **CANNOT** be hosted on static services like GitHub Pages or Tiiny.host. Those services only support HTML/CSS/JS and do not provide the Node.js backend required for the API endpoints (/api/search, /api/login, etc.).
