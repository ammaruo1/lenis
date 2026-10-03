import {existsSync} from 'node:fs';
if(!existsSync('server/dist/index.js')||!existsSync('dist/index.html')||!existsSync('admin/dist/index.html'))throw new Error('Run npm run build:all first.');
// Loopback preview uses the existing local database and stable keys from .env.
// Production settings remain enforced by the normal npm start command.
Object.assign(process.env,{NODE_ENV:'development',HOST:'127.0.0.1',PORT:'53000',COOKIE_SECURE:'false',TRUST_PROXY:'false',SERVE_STATIC:'true',ALLOWED_ORIGINS:'http://127.0.0.1:53000,http://localhost:53000'});
await import('../../server/dist/index.js');
