// Runs on Netlify during deploy: writes config.js from environment variables.
const fs = require('fs');
const cfg = {
  GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
};
const missing = Object.keys(cfg).filter(k => !cfg[k]);
if (missing.length) console.warn('Warning: missing environment variables:', missing.join(', '));
fs.writeFileSync('config.js', 'window.ADH_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n');
console.log('config.js written');
