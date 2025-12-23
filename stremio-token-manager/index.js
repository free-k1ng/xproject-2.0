/**
 * Stremio Token Manager - Main Entry Point
 * 
 * This script demonstrates how to reuse a saved authKey to:
 *   1. Get user profile info
 *   2. List installed addons
 *   3. List library items
 * 
 * Usage: npm start
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserInfo, getAddons, getDatastore } from './stremio-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(__dirname, 'token.json');

async function main() {
    console.log('\n🎬 Stremio Token Manager\n');
    console.log('='.repeat(50));

    // Load token
    if (!fs.existsSync(TOKEN_FILE)) {
        console.error('❌ No token found. Run "npm run login" first.');
        process.exit(1);
    }

    const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    const authKey = tokenData.authKey;

    console.log(`📧 Account: ${tokenData.email}`);
    console.log(`🔑 Token saved: ${tokenData.savedAt}`);
    console.log('='.repeat(50));

    try {
        // 1. Get User Info
        console.log('\n📋 Fetching user info...');
        const userInfo = await getUserInfo(authKey);
        console.log('   ✓ User ID:', userInfo._id || userInfo.user?._id || 'N/A');
        console.log('   ✓ Email:', userInfo.email || userInfo.user?.email || 'N/A');

        // 2. Get Addons
        console.log('\n📦 Fetching installed addons...');
        const addons = await getAddons(authKey);
        console.log(`   ✓ Found ${addons.length} addon(s):`);
        addons.slice(0, 5).forEach((addon, i) => {
            console.log(`     ${i + 1}. ${addon.manifest?.name || addon.transportUrl || 'Unknown Addon'}`);
        });
        if (addons.length > 5) {
            console.log(`     ... and ${addons.length - 5} more`);
        }

        // 3. Get Library Items
        console.log('\n📚 Fetching library items...');
        const library = await getDatastore(authKey, 'libraryItem');
        console.log(`   ✓ Found ${library.length} library item(s)`);

        console.log('\n✅ Token is valid and working!\n');
        console.log('='.repeat(50));
        console.log('Your authKey can be reused in other applications.');
        console.log(`AuthKey: ${authKey}\n`);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.log('\nYour token may have expired. Run "npm run login" to refresh it.');
        process.exit(1);
    }
}

main();
