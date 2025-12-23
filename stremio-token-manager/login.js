/**
 * Stremio Login Script
 * 
 * Run this to login and save your authKey to token.json.
 * Usage: npm run login
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { login } from './stremio-api.js';
import readlineSync from 'readline-sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(__dirname, 'token.json');

async function main() {
    console.log('\n🎬 Stremio Token Manager - Login\n');
    console.log('This script will login to your Stremio account and save the authKey.\n');

    // Get credentials from user
    const email = readlineSync.question('Email: ');
    const password = readlineSync.question('Password: ', { hideEchoBack: true });

    if (!email || !password) {
        console.error('❌ Email and password are required.');
        process.exit(1);
    }

    try {
        console.log('\n⏳ Logging in...');
        const result = await login(email, password);

        // Save token AND credentials to file
        const tokenData = {
            authKey: result.authKey,
            email: result.user?.email || email,
            password: password, // Storing password to allow auto-refresh
            userId: result.user?._id,
            savedAt: new Date().toISOString()
        };

        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));

        console.log('\n✅ Login successful!');
        console.log(`📁 Token saved to: ${TOKEN_FILE}`);
        console.log(`🔑 AuthKey: ${tokenData.authKey.substring(0, 20)}...`);
        console.log('\nYou can now use "npm start" to test your token.\n');

    } catch (error) {
        console.error(`\n❌ Login failed: ${error.message}`);
        process.exit(1);
    }
}

main();
