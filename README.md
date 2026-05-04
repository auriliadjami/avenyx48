# Avenyx48 Website

Website ini adalah aplikasi statis sederhana dengan file:
- `index.html`
- `login.html`
- `admin.html`
- `app.js`
- `style.css`

## Hosting dengan GitHub Pages
1. Push semua file ke repositori GitHub di branch `main`.
2. Buka `Settings` → `Pages` di repositori GitHub.
3. Pilih `Branch: main` dan `Folder: /root`.
4. Klik `Save`.
5. Setelah beberapa menit, situs akan tersedia di `https://<username>.github.io/<repo>`.

### Jika memakai GitHub Actions
File `.github/workflows/pages.yml` sudah ditambahkan untuk deploy otomatis pada setiap push ke `main`.

## Pratinjau lokal
Jalankan server lokal untuk melihat website dulu:

- Dengan Python:
  ```bash
  python -m http.server 8000
  ```
- Atau pasang ekstensi `Live Server` di VS Code dan klik `Go Live`.

Lalu buka `http://localhost:8000`.

## Catatan
Jika menggunakan GitHub Actions, aktifkan Pages di Settings setelah push pertama.
