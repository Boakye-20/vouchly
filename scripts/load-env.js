// scripts/load-env.js
// This file uses CommonJS syntax to be robustly compatible with Node's --require flag.
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

dotenv.config({ path: envPath });

console.log(`[load-env.js] Loading environment variables from: ${envPath}`);
