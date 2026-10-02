import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure persistent data directory exists for Hostinger database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Could not create data directory:', e);
  }
}

// Health check endpoint for Hostinger monitoring and hPanel status checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gulf Spring Cafe Production Server',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Database API: Get full store
app.get('/api/db', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    }
    res.json(null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database API: Save full store
app.post('/api/db', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, message: 'Database saved successfully on server disk' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API: Append or update order
app.post('/api/orders', (req, res) => {
  try {
    const newOrder = req.body;
    let orders: any[] = [];
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      } catch {}
    }
    const existingIndex = orders.findIndex((o) => o.id === newOrder.id);
    if (existingIndex > -1) {
      orders[existingIndex] = newOrder;
    } else {
      orders.unshift(newOrder);
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    res.json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API: Get all orders
app.get('/api/orders', (req, res) => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    }
    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from dist folder if built
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Catch-all route to serve index.html for SPA (fixes Hostinger 404 error on reload)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist is not yet built, serve informational guidance
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gulf Spring | نبع الدرعيه - Server Active</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf7f2; color: #2c1d11; padding: 40px; text-align: center; }
            .card { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #ded3c3; }
            h1 { color: #4a2e1b; font-family: serif; }
            pre { background: #2c1d11; color: #fde68a; padding: 15px; border-radius: 12px; text-align: left; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Gulf Spring Server is Active</h1>
            <p>Your Node.js Hostinger server is running successfully on port ${PORT}.</p>
            <p>To view your website, run the production build command on your Hostinger terminal or hPanel:</p>
            <pre>npm run build</pre>
            <p>Then refresh this page.</p>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(Number(PORT), HOST, () => {
  console.log(`[Gulf Spring Server] Running on http://${HOST}:${PORT}`);
  console.log(`[Hostinger Database] Persistent storage directory: ${DATA_DIR}`);
});
