const fs = require('fs');
let cfg = fs.readFileSync('vite.config.ts', 'utf8');
cfg = cfg.replace(/cssFileName:\s*'index',/g, '');
cfg = cfg.replace(/\}\s*as\s+any,/g, '},');
fs.writeFileSync('vite.config.ts', cfg);
