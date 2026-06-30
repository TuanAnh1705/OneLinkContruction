# Deploy OLCO FE lên VPS (kế hoạch tương lai)

Hiện tại FE chạy trên **Vercel** (bỏ qua thư mục này). Khi chuyển sang **VPS** (Strapi
đã ở VPS), làm theo checklist dưới — **code không cần sửa**, chỉ env + hạ tầng.

> Kiến trúc: Nginx (rate limit + SSL) → Node `next start` (cổng 3000) → Strapi (CMS).
> `proxy.ts` lo flat URL `/slug`, 301 legacy `/blog/slug`, 307 unknown→`/`, `/dev`→CMS.

---

## 1. Env trên VPS (`.env.local` hoặc `.env.production`)

```bash
NEXT_PUBLIC_STRAPI_URL=https://cms.olco.com.au
NEXT_PUBLIC_SITE_URL=https://olco.com.au

REVALIDATE_SECRET=<chuỗi-ngẫu-nhiên-đã-tạo>      # giống hệt trên Strapi webhook

# QUAN TRỌNG (chỉ VPS): proxy lookup slug đi thẳng vào Node, không vòng ra ngoài.
INTERNAL_BASE_URL=http://127.0.0.1:3000

# Rate limit form contact (giống VNS) — thiếu thì tự tắt, không crash.
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

HUBSPOT_PORTAL_ID=46681098
HUBSPOT_FORM_GUID=d4206b98-f717-4b50-bcae-a73045f15e3f
# (tuỳ) DEV_REDIRECT_URL=https://cms.olco.com.au/admin
```

## 2. Build & chạy (pm2)

```bash
npm ci
npm run build
pm2 start "npm run start" --name olco-fe        # Next nghe cổng 3000
pm2 save && pm2 startup                          # tự bật lại sau reboot
# Cập nhật về sau:
git pull && npm ci && npm run build && pm2 restart olco-fe
```

> Lợi thế so với Vercel: Node chạy 1 process bền → cache slug in-memory trong
> `proxy.ts` cực hiệu quả, và việc xoá cache ảnh trên đĩa (`/api/revalidate` khi
> có sự kiện `media.*`) hoạt động thật.

## 3. Nginx (rate limit + reverse proxy + SSL)

1. Áp `deploy/nginx-rate-limit.conf` (xem hướng dẫn dán block `http{}` / `server{}`
   ngay trong file). Đã chỉnh sẵn `server_name olco.com.au`.
2. AlmaLinux/RHEL (SELinux): `sudo setsebool -P httpd_can_network_connect 1`
3. SSL: `sudo certbot --nginx -d olco.com.au -d www.olco.com.au`
4. `sudo nginx -t && sudo systemctl reload nginx`

Nginx đã set `X-Real-IP` / `X-Forwarded-For` → rate limit form contact (Upstash)
nhận đúng IP thật. Không cần cấu hình thêm trong code.

## 4. Strapi webhook (CMS trên VPS → gọi ra FE)

Strapi → Settings → Webhooks:
- URL: `https://olco.com.au/api/revalidate?secret=<REVALIDATE_SECRET>`
- Events: entry publish/unpublish (+ media.* nếu muốn xoá cache ảnh đã tối ưu).

Test nhanh: `curl "https://olco.com.au/api/revalidate?secret=<secret>"` → `{"revalidated":true,...}`.

## 5. Khác biệt Vercel ↔ VPS (đã tính sẵn trong code)

| Mục | Vercel (hiện tại) | VPS (tương lai) |
|---|---|---|
| `INTERNAL_BASE_URL` | bỏ trống | `http://127.0.0.1:3000` |
| `deploy/nginx-rate-limit.conf` | bỏ qua | áp dụng |
| Xoá cache ảnh đĩa (`node:fs`) | no-op vô hại | có tác dụng |
| Cache slug in-memory (proxy) | kém bền (serverless) | rất bền (1 process) |
| Webhook URL | domain Vercel | domain VPS |

Chỉ cần đổi 4 dòng env + áp nginx + đổi URL webhook là xong, không động vào source.
