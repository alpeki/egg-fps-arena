# 🚀 DEPLOYMENT GUIDE - Egg-FPS Arena

## Quick Deploy Checklist

### 1️⃣ Local Development (İlk Test)
```bash
cd egg-fps-arena
pnpm install
pnpm dev

# Aç: http://localhost:5173
# Server: ws://localhost:2567
```

### 2️⃣ Server Deploy (Render / Railway)

#### Render.com
1. GitHub repo'yu bağla
2. **New Web Service** oluştur
3. Ayarlar:
   - Build Command: `pnpm install && pnpm --filter server build`
   - Start Command: `cd packages/server && node dist/index.js`
   - Environment:
     ```
     PORT=2567
     NODE_ENV=production
     TICK_RATE=20
     ROOM_CAPACITY=16
     REGION=eu-tr
     ```

#### Railway.app
1. GitHub repo'yu bağla
2. **Deploy** > **Deploy from GitHub**
3. Root directory: `/packages/server`
4. Environment variables yukarıdaki ile aynı
5. Public networking'i aktif et

**📝 Not:** Deploy edince WebSocket URL'ini kaydet! (örn: `wss://your-app.render.com`)

---

### 3️⃣ Client Deploy (Vercel / Netlify)

#### Vercel
1. GitHub repo'yu import et
2. Framework Preset: **Vite**
3. Settings:
   - Build Command: `cd packages/client && pnpm install && pnpm build`
   - Output Directory: `packages/client/dist`
   - Install Command: `pnpm install`
4. Environment Variables:
   ```
   VITE_WS_URL=wss://your-server-url.render.com
   ```

#### Netlify
1. **Add new site** > **Import from Git**
2. Build settings:
   - Base directory: `packages/client`
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `dist`
3. Environment:
   ```
   VITE_WS_URL=wss://your-server-url.render.com
   ```

---

### 4️⃣ Production Checklist

#### Server
- [ ] WebSocket URL public ve erişilebilir
- [ ] CORS ayarları (gerekirse)
- [ ] Health check endpoint ekle
- [ ] Monitoring (Sentry)
- [ ] Rate limiting
- [ ] Redis (opsiyonel, oda persistence için)

#### Client
- [ ] `VITE_WS_URL` production server'a point ediyor
- [ ] HTTPS (Vercel/Netlify otomatik)
- [ ] PWA manifest (opsiyonel, mobil için)
- [ ] Analytics (Mixpanel/PostHog)

---

### 5️⃣ Docker Production Deploy

```bash
# Build production image
docker build -f packages/server/Dockerfile -t egg-fps-server:prod --target production .

# Run
docker run -p 2567:2567 \
  -e NODE_ENV=production \
  -e PORT=2567 \
  egg-fps-server:prod
```

#### Docker Compose (Full Stack)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

### 6️⃣ TR Optimization (Türkiye İçin)

#### Server
- Region: `eu-tr` (Istanbul)
- CDN: Cloudflare (automatically)
- Hosting: Render EU region

#### Client
- Vercel edge: Automatic
- Domain: `.tr` domain (opsiyonel)
- Language: Turkish UI (future)

---

### 7️⃣ Monitoring & Analytics

#### Gerçek zamanlı izleme
```typescript
// Server (logger.ts)
- Active players
- Room count
- Tick latency (p95, p99)
- Memory usage

// Client
- FPS
- Ping (p50, p95)
- Connection drops
```

#### Analytics (Mixpanel/PostHog)
- D1/D7 retention
- Avg session length
- Match completion rate
- Top weapons used

---

### 8️⃣ Troubleshooting

#### "Cannot connect to server"
- Server URL doğru mu kontrol et
- WebSocket (ws:// veya wss://) kullanılıyor mu?
- CORS headers doğru mu?
- Server çalışıyor mu?

#### "High ping / lag"
- Server location kontrol et (EU-TR için optimize edildi)
- Client interpolation artır: `INTERPOLATION_DELAY: 150`
- Tick rate düşür: `TICK_RATE: 15` (daha az yük)

#### "Players teleporting"
- Reconciliation threshold artır
- Server tick rate kontrol et
- Network diagnostics çalıştır

---

## 🎯 Next Steps After Deploy

1. **Test** 10 concurrent players ile
2. **Measure** ping distribution (hedef: p95 <200ms)
3. **Optimize** based on metrics
4. **Add** analytics events
5. **Monitor** crash rate (<1%)
6. **Iterate** based on player feedback

---

## 💬 Support

- Server logs: Render/Railway dashboard
- Client errors: Browser console + Sentry
- Network: WebSocket inspector (Chrome DevTools)

---

**Ready to deploy! 🚀**