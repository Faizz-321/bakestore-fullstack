# CampBread Project

Project ini sekarang dipisahkan menjadi dua folder terpisah:

- `frontend/` — aplikasi React
- `backend/` — server Node.js dengan Sequelize dan JWT

## Jalankan Frontend

Masuk ke folder frontend lalu install dan jalankan:

```bash
cd frontend
npm install
npm start
```

Akses aplikasi di `http://localhost:3000`.

## Jalankan Backend

Masuk ke folder backend lalu install dan jalankan:

```bash
cd backend
npm install
npm start
```

Backend akan berjalan di `http://localhost:5000`.

Sebelum menjalankan backend, salin `.env.example` menjadi `.env` dan sesuaikan parameter MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campbread
DB_USER=root
DB_PASSWORD=
JWT_SECRET=campbread_secret_key
PORT=5000
```

Buat database `campbread` secara manual terlebih dahulu sebelum menjalankan backend. Kamu juga bisa menjalankan skrip SQL berikut:

```sql
source backend/db-init.sql;
```

Atau buka `backend/db-init.sql` di editor dan jalankan isinya di MySQL.

Setelah database dibuat, jalankan backend seperti biasa.

## Struktur Folder

- `frontend/`
  - `package.json`
  - `package-lock.json`
  - `src/`
  - `public/`
  - `README.md`

- `backend/`
  - `package.json`
  - `server.js`
  - `config/`
  - `models/`
  - `routes/`
  - `middleware/`
  - `.env.example`

## Catatan

- `frontend/node_modules/` ada di dalam folder `frontend`
- `backend/node_modules/` akan dibuat saat `npm install` dijalankan di folder backend
- File `.gitignore` di root sudah mengabaikan `node_modules/`
