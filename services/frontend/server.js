import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Слушаем на всех интерфейсах для доступа из Windows
const port = 8443;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const keyPath = path.resolve(__dirname, './ssl/playlisto.local-key.pem');
  const certPath = path.resolve(__dirname, './ssl/playlisto.local-cert.pem');

  // Проверяем наличие SSL сертификатов
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ SSL certificates not found!');
    console.error('Please create certificates using:');
    console.error('openssl req -x509 -newkey rsa:4096 -keyout ssl/playlisto.local-key.pem -out ssl/playlisto.local-cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Playlisto/OU=Development/CN=playlisto.local"');
    process.exit(1);
  }

  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`✅ Ready on https://${hostname}:${port}`);
      console.log(`   Local:   https://localhost:${port}`);
      console.log(`   Network: https://playlisto.local:${port}`);
      console.log('');
      console.log('⚠️  Note: You may need to accept the self-signed certificate');
    });
});

