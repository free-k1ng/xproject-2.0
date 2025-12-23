/**
 * StreamFinder Web - Express Server
 * 
 * A web application to search TMDB and open streams in Stremio or embed players.
 * Now with Stremio token integration!
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { login } from './stremio-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'e0f8c3121386db3c0c8a93f2da63804f';

// Path to the token file from stremio-token-manager
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// API endpoint to get the saved Stremio token
app.get('/api/stremio-token', (req, res) => {
  // Check cookies first (Client-side storage)
  if (req.cookies.stremio_authKey) {
    return res.json({
      hasToken: true,
      authKey: req.cookies.stremio_authKey,
      email: req.cookies.stremio_email
    });
  }

  // Fallback to server-side file (Legacy)
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      res.json({
        hasToken: true,
        authKey: tokenData.authKey,
        email: tokenData.email
      });
    } else {
      res.json({ hasToken: false });
    }
  } catch (error) {
    res.json({ hasToken: false, error: error.message });
  }
});

// Redirect page that injects auth into Stremio Web
app.get('/stremio-redirect', async (req, res) => {
  const { type, id, season, episode } = req.query;

  // Build the target URL
  let targetPath = type === 'movie'
    ? `/detail/movie/${id}`
    : `/detail/series/${id}`;

  if (type === 'series' && season && episode) {
    targetPath += `/${season}/${episode}`;
  }

  // Read token from COOKIES first
  let authKey = req.cookies.stremio_authKey;
  let email = req.cookies.stremio_email;
  let password = req.cookies.stremio_password;

  try {
    if (fs.existsSync(TOKEN_PATH)) {
      let tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));

      // Check if we have credentials to refresh
      if (tokenData.email && tokenData.password) {
        try {
          console.log('🔄 refreshing Stremio token...');
          const result = await login(tokenData.email, tokenData.password);

          // Update token data with new key/date but keep password
          tokenData = {
            ...tokenData,
            authKey: result.authKey,
            user: result.user,
            savedAt: new Date().toISOString()
          };

          // Save back to file
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
          console.log('✅ Token refreshed successfully');
        } catch (refreshError) {
          console.error('⚠️ Token refresh failed, using cached token:', refreshError.message);
        }
      }

      authKey = tokenData.authKey;
      email = tokenData.email;
    }
  } catch (e) {
    console.error('Failed to read/refresh token:', e);
  }

  // ... (rest of the HTML generation)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to Stremio...</title>
  <style>
    body {
      background: #141414;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #333;
      border-top-color: #8a5cf5;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Opening in Stremio Web...</p>
    <p style="font-size: 12px; opacity: 0.6;">Authenticating with your account</p>
  </div>
  <script>
    (function() {
      const authKey = ${authKey ? JSON.stringify(authKey) : 'null'};
      const email = ${email ? JSON.stringify(email) : 'null'};
      const targetPath = ${JSON.stringify(targetPath)};
      
      if (authKey) {
        // Create a profile object similar to what Stremio stores
        const profile = {
          auth: {
            key: authKey,
            user: {
              email: email
            }
          }
        };
        
        try {
          localStorage.setItem('profile', JSON.stringify(profile));
          console.log('Auth injected successfully');
        } catch (e) {
          console.error('Failed to inject auth:', e);
        }
      }
      
      // Redirect to Stremio Web
      window.location.href = 'https://web.stremio.com/#' + targetPath;
    })();
  </script>
</body>
</html>
  `;

  res.send(html);
});

// API endpoint to get external IDs (IMDB) from TMDB
app.get('/api/external-ids/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/external_ids?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch external IDs' });
  }
});

// API endpoint to search TMDB
app.get('/api/search/:type', async (req, res) => {
  const { type } = req.params;
  const { query } = req.query;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// API endpoint to get TV show details (for episode info)
app.get('/api/tv/:id/season/:season', async (req, res) => {
  const { id, season } = req.params;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch season data' });
  }
});

// API endpoint to fetch streams from WebStreamr (VixSrc)
app.get('/api/webstreamr/:type/:id/:season?/:episode?', async (req, res) => {
  const { type, id, season, episode } = req.params;

  // Construct Stremio ID (e.g., tt1234567 or tt1234567:1:1)
  let stremioId = id;
  if (type === 'tv' || type === 'series') {
    stremioId = `${id}:${season}:${episode}`;
  }

  const typeStr = (type === 'tv' || type === 'series') ? 'series' : 'movie';
  const addonUrl = `https://webstreamr.hayd.uk/stream/${typeStr}/${encodeURIComponent(stremioId)}.json`;

  try {
    console.log(`Fetching streams from: ${addonUrl}`);
    const response = await fetch(addonUrl);
    const data = await response.json();

    if (!data.streams || data.streams.length === 0) {
      return res.json({ found: false });
    }

    // Find VixSrc stream
    const vixStream = data.streams.find(s =>
      s.name && (s.name.includes('VixSrc') || s.description?.includes('VixSrc'))
    );

    if (vixStream) {
      res.json({
        found: true,
        url: vixStream.url,
        name: vixStream.name,
        description: vixStream.description
      });
    } else {
      // Return the first available stream if VixSrc not found
      res.json({
        found: true,
        url: data.streams[0].url,
        name: data.streams[0].name,
        description: data.streams[0].description
      });
    }
  } catch (error) {
    console.error('WebStreamr Error:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

// API endpoint to login (Cookie-based)
app.post('/api/login', express.json(), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    console.log(`🔐 Attempting login for ${email}...`);
    const result = await login(email, password);

    console.log('✅ Login successful - Setting Cookies');

    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true // Secure from XSS
    };

    res.cookie('stremio_authKey', result.authKey, cookieOptions);
    res.cookie('stremio_email', email, cookieOptions);
    res.cookie('stremio_password', password, cookieOptions);

    res.json({
      success: true,
      authKey: result.authKey,
      email: email
    });

  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Catch-all: serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎬 StreamFinder Web is running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);

  // Check if token exists
  if (fs.existsSync(TOKEN_PATH)) {
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    console.log(`   🔑 Stremio Token: Loaded (${tokenData.email})\n`);
  } else {
    console.log(`   ⚠️  No Stremio token found. Run 'npm run login' in stremio-token-manager\n`);
  }
});
