// scripts/load-env.ts
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');

dotenv.config({ path: envPath });

console.log(`Loading environment variables from: ${envPath}`);
