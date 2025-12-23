# Stremio Token Manager

A Node.js application to manage and reuse your Stremio account authentication token (`authKey`).

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd stremio-token-manager
npm install
```

### 2. Login to Your Account
```bash
npm run login
```

This will prompt you for your Stremio email and password, then save your `authKey` to `token.json`.

### 3. Test Your Token
```bash
npm start
```

This will use your saved token to:
- Fetch your user profile
- List your installed addons
- List your library items

---

## 📁 Project Structure

```
stremio-token-manager/
├── package.json       # Project dependencies
├── stremio-api.js     # API client module
├── login.js           # Login script (saves token)
├── index.js           # Main script (uses token)
├── token.json         # Your saved authKey (created after login)
└── README.md          # This file
```

---

## 🔑 Manual Token Extraction

If you prefer to extract your token manually from the Stremio web client:

1. Go to [web.stremio.com](https://web.stremio.com/) and log in.
2. Open browser DevTools (F12) → Console.
3. Paste this command:
   ```javascript
   JSON.parse(localStorage.getItem("profile")).auth.key
   ```
4. Copy the output (without quotes) and save it to `token.json`:
   ```json
   {
     "authKey": "YOUR_KEY_HERE",
     "email": "your-email@example.com",
     "savedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

---

## 🛠 API Reference

The `stremio-api.js` module exports these functions:

| Function | Description |
| :--- | :--- |
| `login(email, password)` | Authenticate and get an authKey |
| `getUserInfo(authKey)` | Get user profile data |
| `getAddons(authKey)` | List installed addons |
| `getDatastore(authKey, collection)` | Get library items or notifications |

---

## ⚠️ Disclaimer

This tool is for personal use only. Do not share your `authKey` as it provides full access to your Stremio account.
