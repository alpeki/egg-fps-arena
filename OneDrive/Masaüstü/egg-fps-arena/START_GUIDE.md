# 🥚 Egg-FPS Arena - Başlatma Rehberi

## Sorun Çözümü
"Connecting..." durumunda kalma sorunu çözüldü.

## Yapılan Düzeltmeler

### 1. **Vite Konfigürasyonu Eklendi**
- `packages/client/vite.config.js` oluşturuldu
- Port 3000'de çalışacak şekilde ayarlandı
- WebSocket proxy desteği eklendi

### 2. **HTML Script Tag'leri Düzeltildi**
- Duplicate Colyseus script tag'i kaldırıldı
- Script yükleme sırası düzeltildi
- Module type kaldırıldı (browser-compatible)

### 3. **Bağlantı Mantığı İyileştirildi**
- Auto-connect için 1 saniye delay eklendi
- Hata durumunda otomatik retry mekanizması
- Detaylı error logging

### 4. **Package Scripts Güncellendi**
- `dev:all` - Server ve client'ı birlikte çalıştırır
- `install:all` - Tüm dependencies'leri yükler

## Kurulum Adımları

### 1. Dependencies Yükle
```bash
npm run install:all
```

### 2. Server'ı Başlat (Terminal 1)
```bash
npm run server
```

Şunu görmelisiniz:
```
🚀 Game server running on ws://localhost:2567
🎮 Available rooms: arena
✅ Server started successfully!
```

### 3. Client'ı Başlat (Terminal 2)
```bash
npm run client
```

Tarayıcı otomatik açılacak: `http://localhost:3000`

### 4. Alternatif: Her İkisini Birden Başlat
```bash
npm run dev:all
```
(Not: Bu için `concurrently` package'ı gerekli: `npm install -D concurrently`)

## Sorun Giderme

### Server Başlamıyorsa
1. Port 2567'nin boş olduğundan emin olun:
   ```bash
   netstat -ano | findstr :2567
   ```
2. Eğer kullanımdaysa, process'i sonlandırın veya farklı port kullanın

### Client Bağlanamıyorsa
1. Server'ın çalıştığından emin olun
2. Browser console'u kontrol edin (F12)
3. Şu mesajları görmelisiniz:
   - "✅ Colyseus client initialized"
   - "🔗 Connecting to server at ws://localhost:2567..."
   - "✅ Joined Arena room successfully!"

### Firewall/Antivirus Sorunu
- Windows Defender Firewall'da Node.js'e izin verin
- Antivirus'ün WebSocket bağlantılarını engellemediğinden emin olun

## Test Etme

1. Server console'da şunu görmelisiniz:
   ```
   Arena room created
   Player [sessionId] joined
   ```

2. Client'ta:
   - Status: "Connected" (yeşil)
   - Player ID görünür olmalı
   - Players: 1 (veya daha fazla)

## Bağlantı Akışı

```
Client (Port 3000) → WebSocket → Server (Port 2567)
                                    ↓
                              Arena Room
                                    ↓
                              Game State
```

## Önemli Notlar

- Server her zaman client'tan **önce** başlatılmalı
- Client otomatik olarak 1 saniye sonra bağlanmaya çalışır
- Bağlantı başarısız olursa 3 saniyede bir retry yapar
- "Reconnect" butonuna basarak manuel bağlanabilirsiniz

## Gelişmiş Kullanım

### Production Build
```bash
npm run build
npm start
```

### Sadece Server
```bash
npm run server
```

### Sadece Client
```bash
npm run client
```

## Başarı Kriterleri ✅

- [ ] Server 2567 portunda çalışıyor
- [ ] Client 3000 portunda açılıyor
- [ ] Browser console'da bağlantı mesajları görünüyor
- [ ] Status "Connected" gösteriyor
- [ ] Player ID görünüyor
- [ ] Oyun canvas'ı yükleniyor
