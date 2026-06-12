# Settings Database Rollout Plan

**Tanggal:** 2026-06-12
**Input:** SETTINGS_DATABASE_AUDIT.md + SETTINGS_DATABASE_IMPLEMENTATION_PLAN.md
**Prinsip:** Lowest risk first. Fastest validation first. Easiest rollback first.

---

## Scoring Methodology

**Complexity Score (1-10):**
Jumlah tabel baru + kolom baru + mutations + cross-domain dependencies + auth surface area.

**Migration Risk:**

- Low — ADD COLUMN additive; tabel sudah ada; default values aman; tidak ada data transform
- Medium — tabel baru dengan FK ke domain lain; backfill diperlukan; customer app dependencies
- High — menyentuh Supabase Auth; menggantikan sistem yang sedang berjalan; tidak ada rollback bersih

**Rollback Difficulty:**

- Very Easy — revert hook ke mock state; tidak ada DB change yang perlu di-undo
- Easy — DROP TABLE baru; DROP COLUMN yang baru ditambah
- Medium — data sudah ditulis ke tabel yang di-drop; butuh koordinasi dengan customer app
- Hard — auth state sudah berubah; user session terpengaruh; tidak bisa di-rollback tanpa downtime

---

## Prerequisite — Infrastruktur (sebelum Sprint 1)

Ini bukan domain — ini adalah syarat teknis sebelum satu pun domain bisa di-connect.

| Item            | Yang Dibutuhkan                                                                           |
| --------------- | ----------------------------------------------------------------------------------------- |
| tRPC setup      | `apps/owner/src/server/trpc/` — router, context, protectedProcedure middleware            |
| Supabase client | Pisahkan `supabaseAnon` (client-side) dan `supabaseAdmin` (server-side, service_role_key) |
| Storage buckets | Buat 6 bucket di Supabase Storage (lihat Implementation Plan)                             |
| Auth middleware | `protectedProcedure` yang membaca `salonId` dari session                                  |

**Estimasi:** 1-2 hari. Tidak ada PR ke domain apapun sampai ini selesai.

---

## Domain Scoring Summary

| Domain                       | Complexity | Migration Risk | Customer Impact | Rollback Difficulty | Sprint |
| ---------------------------- | ---------- | -------------- | --------------- | ------------------- | ------ |
| Operasional — business_hours | 3          | **Low**        | Sangat Tinggi   | **Very Easy**       | **1**  |
| Brand                        | 4          | **Low**        | Tinggi          | **Easy**            | **1**  |
| Layanan                      | 5          | Low-Medium     | Sangat Tinggi   | Easy-Medium         | **1**  |
| Booking App                  | 5          | **Low**        | Sangat Tinggi   | **Easy**            | **2**  |
| Operasional — sisa           | 4          | **Low**        | Tinggi          | **Easy**            | **2**  |
| Tim                          | 7          | Medium         | Tinggi          | Medium              | **3**  |
| Produk & Paket               | 5          | **Low**        | Rendah          | **Easy**            | **3**  |
| Pengguna & Akses             | 9          | **High**       | Tidak Ada       | **Hard**            | **4**  |

---

## Detail Per Domain

---

### Domain: Operasional — Pilot (business_hours)

**Complexity Score: 3 / 10**

**Migration Risk: Low**

Tidak ada migrasi. Tabel `business_hours` sudah ada dengan kolom yang benar (dikonfirmasi dari komentar di `operational.types.ts`). Ini adalah satu-satunya domain yang bisa di-connect ke DB tanpa menulis satu baris SQL pun.

**Dependencies**

Tidak ada dependency ke domain lain. Hanya butuh tRPC infrastructure selesai.

**Customer App Impact**

Tinggi — customer app membaca `business_hours` untuk menentukan hari buka di kalender booking. Tapi datanya sudah ada di tabel. Risiko aktual: jika query baru mengembalikan format yang salah (mis. `09:00:00` vs `09:00`), customer calendar bisa break.

Mitigasi: `operational.repository.ts` harus trim seconds dari Postgres TIME output sebelum return ke controller. Ini sudah didokumentasikan di `operational.types.ts`.

**Rollback Difficulty: Very Easy**

Jika tRPC gagal, revert `useOperasionalController` ke mock state. Tidak ada DB change yang perlu di-undo — tabel tidak disentuh sama sekali.

**Recommended Sprint: 1**

Alasan: Ini adalah proof-of-concept untuk seluruh tRPC stack. Berhasil di sini memvalidasi bahwa infrastruktur berjalan sebelum domain yang lebih kompleks di-connect.

---

### Domain: Brand

**Complexity Score: 4 / 10**

**Migration Risk: Low**

Hanya ADD COLUMN IF NOT EXISTS ke `salons`. Semua kolom baru memiliki safe defaults (`DEFAULT ''`). Kolom nullable (`logo_url`, `cover_image_url`) tidak memerlukan backfill. Tidak ada tabel baru. Tidak ada FK baru.

**Satu risiko nyata:** Nama kolom `name` di `salons` diasumsikan ada — belum diverifikasi dari Supabase Dashboard. Jika kenyataannya `salon_name`, repository harus disesuaikan. **Verifikasi schema aktual di Supabase Dashboard sebelum menulis repository.**

**Dependencies**

Tidak ada dependency ke domain lain. Migration `0001_alter_salons_brand_booking.sql` mencakup kolom Brand dan Booking App sekaligus — jalankan sekali, implement Brand di Sprint 1 dan Booking App di Sprint 2.

**Customer App Impact**

Tinggi — customer app menampilkan `name`, `tagline`, `logoUrl`, `address`, dll di booking page. Tapi kolom baru di-ADD dengan safe defaults, jadi customer app yang sudah berjalan tidak akan break. Data lama tetap ada. Data baru kosong sampai owner isi via Settings.

**Rollback Difficulty: Easy**

`DROP COLUMN` untuk kolom yang baru ditambah. Hook dikembalikan ke mock. Tidak ada data migrasi yang bisa hilang karena semua kolom baru dimulai dari empty.

**Recommended Sprint: 1**

Alasan: Migration-nya additive dan safe. Implementasinya straightforward (satu tabel, satu query, satu mutation). Cocok sebagai domain kedua setelah Operasional pilot untuk memvalidasi pola repository yang lebih umum.

---

### Domain: Layanan

**Complexity Score: 5 / 10**

**Migration Risk: Low-Medium**

ADD COLUMN ke `categories` (5 kolom) dan `services` (2 kolom). Semua additive dengan safe defaults.

Satu **risiko medium**: kolom `service_flow` perlu backfill manual. Nilai default `'TREATMENT'` adalah aman tapi salah untuk service yang seharusnya `STYLING_HAIR` atau `STYLING_COLOUR`. Customer app menggunakan `service_flow` untuk routing — jika semua service di-backfill ke `'TREATMENT'`, flow stylist selection tidak akan muncul.

**Backfill harus dilakukan manual oleh owner** (via Settings > Layanan > edit service) sebelum customer app mendapat nilai yang benar. Ini adalah data migration yang tidak bisa diotomasi — perlu koordinasi dengan owner salon.

**Dependencies**

Tidak ada dependency ke domain lain yang belum ada. `categories` dan `services` sudah ada. Tabel `service_bundle_items` bergantung pada `services.id` tapi itu Sprint 3.

**Customer App Impact**

Sangat tinggi. Customer app membaca `categories` dan `services` setiap kali halaman booking dibuka. Kolom baru additive — tidak breaking. Tapi `service_flow` yang salah bisa menyebabkan routing customer ke flow yang salah (booking treatment di-route sebagai styling). Ini bukan breaking secara teknis tapi salah secara bisnis.

**Rollback Difficulty: Easy-Medium**

DROP COLUMN additive = easy. Tapi jika data sudah diisi oleh owner dan rollback dilakukan, owner kehilangan data yang sudah diinput.

**Recommended Sprint: 1**

Alasan: Tabel sudah ada, migration additive. Lebih baik diselesaikan Sprint 1 agar Sprint 3 (Tim, yang bergantung pada `services.id` untuk assignment) tidak terhambat. Komunikasikan ke owner tentang kebutuhan backfill `service_flow`.

**Urutan implementasi dalam Sprint 1:**

1. Operasional (business_hours) — validasi tRPC stack
2. Brand — validasi pola ALTER + repository
3. Layanan — ADD COLUMN dengan backfill consideration

---

### Domain: Booking App

**Complexity Score: 5 / 10**

**Migration Risk: Low**

Kolom di `salons` sudah di-ADD bersamaan dengan Brand di migration `0001` (sudah dijalankan di Sprint 1). Satu tabel baru: `bank_accounts` — greenfield, tidak ada data existing, CASCADE delete aman.

Kolom `payment_methods` menggunakan `DEFAULT ARRAY['qris','transfer']` — ini adalah nilai yang benar untuk salon yang belum mengkonfigurasi. Tidak perlu backfill.

Kolom `confirmation_mode` menggunakan `DEFAULT 'auto'` — aman.

**Dependencies**

Migration `0001` (Sprint 1). Tidak ada dependency ke domain lain.

**Customer App Impact**

Sangat tinggi. Customer app membaca:

- `payment_methods` → checkout step
- `qris_image_url` → QRIS payment screen
- `bank_accounts` → transfer payment screen
- `confirmation_mode` → booking result behavior
- `salon_policy` → pre-booking confirmation modal

Semuanya additive dengan safe defaults. Customer app tidak akan break — salons yang belum mengkonfigurasi akan menggunakan defaults.

**QRIS adalah financial asset:** Repository dan service untuk `qrisImageUrl` harus include audit log write setelah setiap operasi sukses (tabel `audit_logs` perlu dibuat bersamaan).

**Rollback Difficulty: Easy**

`DROP TABLE bank_accounts` (CASCADE safe karena tabel baru). Kolom `salons` sudah ada dari Sprint 1 migration — DROP COLUMN jika perlu. Hook kembali ke mock.

**Recommended Sprint: 2**

Alasan: Bergantung pada migration `0001` yang selesai di Sprint 1. Bukan Sprint 1 karena Sprint 1 sudah cukup padat (3 domain). Booking App adalah domain terbaru (baru selesai dibuat) — Sprint 2 memberikan waktu untuk memverifikasi Phase 1 UI benar-benar stabil sebelum connecting ke DB.

---

### Domain: Operasional — Sisa (special_closing_dates + booking_policies)

**Complexity Score: 4 / 10**

**Migration Risk: Low**

Dua tabel baru, tidak ada dependency ke domain lain yang belum ada. `UNIQUE (salon_id, date)` di `special_closing_dates` mencegah duplikat secara otomatis. `UNIQUE (salon_id)` di `booking_policies` mengaktifkan UPSERT pattern yang clean.

**Dependencies**

Domain Operasional pilot (Sprint 1) sudah selesai — `operational.repository.ts` sudah ada. Sprint 2 hanya extend file yang sama.

**Customer App Impact**

Tinggi. `booking_policies.slot_interval_minutes` **menggantikan** `SESSION_TIMES` hardcode di customer app. Ini adalah **breaking change terencana** — customer app harus diupdate untuk membaca dari DB, bukan dari konstanta. Koordinasikan dengan customer app sebelum deploy.

`special_closing_dates` additive — customer app perlu ditambahkan logika untuk membaca dan mendisable tanggal ini di kalender. Jika tidak diimplementasikan di customer app, fitur tetap berjalan di owner tapi tidak berpengaruh ke customer.

**Rollback Difficulty: Easy**

DROP TABLE kedua tabel baru. Revert `booking_policies` query di customer app ke `SESSION_TIMES` konstanta.

**Recommended Sprint: 2**

Alasan: Sudah punya fondasi dari Sprint 1. Dua tabel baru yang simple. Customer app impact untuk `booking_policies` perlu dikoordinasikan di Sprint ini.

**Urutan implementasi dalam Sprint 2:**

1. Booking App (tabel baru `bank_accounts`, paling high-value untuk owner)
2. Operasional sisa (extend existing repository, koordinasi customer app untuk `slot_interval_minutes`)

---

### Domain: Tim

**Complexity Score: 7 / 10**

**Migration Risk: Medium**

4 tabel baru dengan inter-dependencies. `staff_service_assignments` bergantung pada `staff_members` (baru) dan `services` (sudah ada). `staff_schedules` bergantung pada `staff_members`. Multi-table transaction diperlukan untuk `setAssignments`.

**Risiko yang perlu diwaspadai:**

1. `specialty` field — nullable tapi business rule-nya ketat. Jika owner memasukkan staff STYLIST tanpa specialty, customer app tidak bisa routing dengan benar. Service layer harus enforce.

2. `staff_schedules` UPSERT pattern — INSERT ON CONFLICT (staff_id, day) DO UPDATE harus benar. Jika unique constraint tidak ada, UPSERT akan INSERT duplikat.

3. Customer app membaca `staff_schedules` untuk slot availability — jika jadwal belum diisi, customer tidak bisa booking (tergantung implementasi customer app). Ini adalah **data completeness risk**, bukan migration risk.

4. `profiles.staff_id` FK akan di-enforce di Sprint 4 — Di Sprint 3, `staff_members` harus ada dulu agar Sprint 4 tidak blocked.

**Dependencies**

Domain Layanan harus selesai (Sprint 1) — `staff_service_assignments` bergantung pada `services.id`. Tidak ada dependency ke domain lain di Sprint 3.

**Customer App Impact**

Tinggi. Customer app menggunakan `staff_members` + `staff_schedules` untuk stylist selection dan slot availability. Jika `staff_members` kosong atau `staff_schedules` tidak terisi, customer tidak bisa booking service yang `requires_specialist = true`.

**Strategi mitigation:** Deploy `staff_members` tabel dan biarkan owner mengisi data via Settings > Tim sebelum customer app membaca dari DB (feature flag atau sequential deploy).

**Rollback Difficulty: Medium**

DROP TABLE 4 tabel baru (CASCADE aman). Tapi jika owner sudah mengisi data staff dan rollback dilakukan, data hilang. Lebih complex dari domain sebelumnya karena melibatkan data yang sudah dioperasikan.

**Recommended Sprint: 3**

Alasan: Butuh Layanan selesai (services.id) dan customer app harus siap menerima data staff dari DB (koordinasi lebih besar). 4 tabel baru berarti lebih banyak surface area untuk error.

---

### Domain: Produk & Paket

**Complexity Score: 5 / 10**

**Migration Risk: Low**

3 tabel baru. Tidak ada tabel existing yang di-ALTER. Tidak ada dependency ke domain lain yang belum ada kecuali `services.id` untuk `service_bundle_items`.

**Kenapa di Sprint 3, bukan Sprint 2?**

Customer app belum mengimplementasikan add-on checkout. Tidak ada customer-facing urgency. Sprint 2 lebih baik diisi Booking App yang langsung dirasakan customer.

**Dependencies**

Domain Layanan harus selesai (Sprint 1) — `service_bundle_items.service_id` bergantung pada `services.id`. `services` sudah ada di DB tapi kolom `sort_order` baru tersedia setelah Sprint 1.

**Customer App Impact**

Rendah. Customer app belum memiliki add-on atau bundle UI. Tabel dibuat tapi customer app tidak membacanya. Tidak ada risk ke customer.

**Rollback Difficulty: Easy**

DROP TABLE 3 tabel baru. Tidak ada customer app yang terpengaruh.

**Recommended Sprint: 3**

Alasan: Low urgency, no customer app dependency. Dijadikan Sprint 3 bersama Tim karena bisa di-parallelize (tidak ada dependency satu sama lain).

**Urutan implementasi dalam Sprint 3:**

1. Tim (urgency lebih tinggi — customer app needs staff data)
2. Produk & Paket (paralel atau setelah Tim, tidak ada dependency)

---

### Domain: Pengguna & Akses

**Complexity Score: 9 / 10**

**Migration Risk: High**

Domain ini berbeda secara fundamental dari domain lain. Semua domain sebelumnya hanya menambah tabel/kolom — domain ini mengganti sistem autentikasi yang sedang berjalan.

**Tiga sumber risiko high:**

1. **Supabase Auth Admin API** — butuh `service_role_key` dari server. Jika konfigurasi salah, invite user bisa gagal diam-diam atau memanggil API dari client (security risk).

2. **Email provider** — `inviteUserByEmail` membutuhkan SMTP/Resend yang dikonfigurasi. Jika provider tidak dikonfigurasi, invite request sukses di API tapi email tidak terkirim. Owner tidak tahu undangan gagal.

3. **localStorage auth replacement** — saat ini `AuthContext` menggunakan localStorage mock. Mengganti ini ke Supabase Auth menyentuh setiap halaman owner dashboard. Ini adalah perubahan cross-cutting dengan surface area terbesar di seluruh rollout.

**Dependencies**

- Domain Tim harus selesai (Sprint 3) — `profiles.staff_id` FK bergantung pada `staff_members`
- Email provider harus dikonfigurasi sebelum Sprint 4
- `supabaseAdmin` client (service_role_key) harus ada sebelum Sprint 4
- RLS policies untuk `profiles` harus di-test sebelum deploy

**Customer App Impact**

Tidak ada. Customer tidak menggunakan `profiles` atau `invitations`. Customer auth (jika ada) adalah sistem terpisah.

**Rollback Difficulty: Hard**

Jika auth sudah migrated ke Supabase dan rollback diperlukan, semua user yang sudah login via Supabase Session akan kehilangan session. localStorage mock tidak bisa di-restore tanpa deploy ulang. Ini adalah titik tidak-bisa-kembali.

**Recommended Sprint: 4**

Alasan: Paling kompleks, paling berisiko, paling sulit di-rollback. Tidak ada fitur yang di-block sampai ini selesai. Customer app tidak terpengaruh. Butuh email provider setup sebagai external dependency. Dijadikan Sprint 4 karena semua domain lain yang relevan (terutama Tim untuk `profiles.staff_id`) harus stabil terlebih dahulu.

---

## Rollout Plan

---

### Pre-Sprint — Infrastruktur

**Tidak ada domain yang bisa di-connect sampai ini selesai.**

| Item                            | Keterangan                                                    |
| ------------------------------- | ------------------------------------------------------------- |
| tRPC router + context           | `apps/owner/src/server/trpc/`                                 |
| `protectedProcedure` middleware | Baca `salonId` dari session; reject jika tidak ada            |
| `supabaseAdmin` client          | Service role key, server-side only, jangan expose ke client   |
| Supabase Storage buckets        | 6 bucket — logos, covers, qris, avatars, products, bundles    |
| Supabase Dashboard audit        | Verifikasi nama kolom aktual di `salons` dan `business_hours` |

---

### Sprint 1 — Foundation

**Tema:** Connect domain yang paling aman. Validasi bahwa tRPC + repository pattern berjalan end-to-end.

**Migrasi yang dijalankan:**

- `0001_alter_salons_brand_booking.sql` (Brand + Booking App columns, semua additive)
- `0002_alter_categories_services.sql` (Layanan columns, additive)

**Tidak ada tabel baru di Sprint 1.**

---

#### Sprint 1, Step 1 — Operasional (business_hours)

**Kenapa pertama:** Tidak ada migrasi. Satu-satunya domain yang bisa langsung di-connect. Validasi tRPC stack sebelum domain lain di-connect.

**Yang dikerjakan:**

1. Implement `operational.repository.ts` — `getBusinessHours`, `upsertBusinessHours`
2. Implement `operational.service.ts` — validasi closeTime > openTime
3. Implement `operational.router.ts` — query + mutation
4. Refactor `useOperasionalController` — replace mock dengan tRPC calls
5. Smoke test: buka Settings > Operasional, simpan jam buka, refresh — data harus persist

**Verification gate sebelum lanjut:** `business_hours` data benar-benar tersimpan dan customer app kalender masih berfungsi.

---

#### Sprint 1, Step 2 — Brand

**Kenapa kedua:** Migration additive, tidak ada tabel baru. Validasi pola ALTER TABLE + repository untuk `salons`.

**Yang dikerjakan:**

1. Jalankan `0001_alter_salons_brand_booking.sql` (seluruh file — kolom Booking App juga ikut di-ADD, tidak apa-apa)
2. Implement `brand.repository.ts` — `getBrandProfile`, `upsertBrandProfile`, `updateLogoUrl`, `updateCoverUrl`
3. Implement `brand.service.ts` — validasi email, URL, phone format
4. Implement `brand.router.ts` — query + mutation + presigned upload URL
5. Refactor `useBrandProfileController`
6. Smoke test: upload logo, simpan nama salon, refresh — data harus persist + customer booking page menampilkan data baru

---

#### Sprint 1, Step 3 — Layanan

**Kenapa ketiga:** Tabel sudah ada. Migration additive. Blocker untuk Sprint 3 (Tim butuh `services.id`).

**Yang dikerjakan:**

1. Jalankan `0002_alter_categories_services.sql`
2. Implement `services.repository.ts` — semua CRUD + reorder
3. Implement `services.service.ts` — validasi unique name, delete guard
4. Implement `services.router.ts`
5. Refactor `useServicesController`
6. Manual backfill `service_flow` — review setiap service dan assign flow yang benar
7. Smoke test: buat kategori baru, buat service baru, refresh — data persist + customer app menampilkan service baru

**Catatan backfill:** `service_flow` default `'TREATMENT'` adalah safe tapi bisa salah secara bisnis. Owner harus review dan update setiap service via Settings > Layanan setelah deploy. Buat checklist backfill.

---

### Sprint 2 — Customer-Facing Completion

**Tema:** Connect domain yang langsung dirasakan customer. Booking flow end-to-end harus benar.

---

#### Sprint 2, Step 4 — Booking App

**Kenapa pertama di Sprint 2:** High customer value. Kolom `salons` sudah di-ADD di Sprint 1. Hanya butuh `bank_accounts` tabel baru.

**Yang dikerjakan:**

1. Jalankan `0005_create_bank_accounts.sql`
2. Buat `audit_logs` tabel (bersamaan — QRIS operations wajib diaudit)
3. Implement `booking-app.repository.ts`
4. Implement `booking-app.service.ts` — validasi min-1-payment-method, QRIS + transfer guard, audit log write
5. Implement `booking-app.router.ts`
6. Refactor `useBookingAppController`
7. Smoke test: set payment methods, upload QRIS, tambah bank account, refresh — semua persist. Check `audit_logs` ada entry.

---

#### Sprint 2, Step 5 — Operasional sisa (special_closing_dates + booking_policies)

**Kenapa kedua:** Extend existing `operational.repository.ts`. Koordinasi customer app diperlukan untuk `slot_interval_minutes`.

**Yang dikerjakan:**

1. Jalankan `0003_create_special_closing_dates.sql` + `0004_create_booking_policies.sql`
2. Extend `operational.repository.ts` — tambah functions untuk `special_closing_dates` dan `booking_policies`
3. Extend `operational.service.ts` — validasi range values
4. Extend `operational.router.ts`
5. Refactor `useOperasionalController` — tambah state dan mutations untuk sisa domain
6. **Customer app coordination:** Update customer app untuk membaca `slot_interval_minutes` dari `booking_policies` API, bukan dari `SESSION_TIMES` konstanta. Deploy ini bersamaan atau segera setelahnya.
7. Smoke test: tambah tanggal tutup, set slot interval 15 menit, buka customer app — tanggal harus disable, slot harus 15 menit

---

### Sprint 3 — Staff & Catalog

**Tema:** Domain yang butuh data completeness sebelum customer bisa booking. Lebih complex tapi tidak ada auth risk.

---

#### Sprint 3, Step 6 — Tim

**Kenapa pertama:** Customer app lebih butuh ini daripada Produk & Paket (yang belum ada customer UI-nya).

**Yang dikerjakan:**

1. Jalankan `0008_create_staff_members.sql` + `0009_create_staff_relations.sql`
2. Implement `team.repository.ts` — staff CRUD, assignments, schedule UPSERT, leaves
3. Implement `team.service.ts` — specialty enforcement, schedule validation, cross-salon validation untuk assignments
4. Implement `team.router.ts`
5. Refactor `useTeamController`
6. Customer app coordination: update stylist selection step untuk membaca dari `staff_members` + `staff_schedules` DB
7. Smoke test: tambah stylist, set jadwal, assign service, buka customer app — stylist harus muncul dan slot harus berdasarkan jadwal

**Data completeness gate:** Sebelum customer app membaca dari DB, pastikan owner sudah mengisi semua data staff via Settings > Tim. Pertimbangkan feature flag di customer app.

---

#### Sprint 3, Step 7 — Produk & Paket

**Kenapa kedua:** No customer urgency. Paralel dengan Tim jika resources memungkinkan.

**Yang dikerjakan:**

1. Jalankan `0006_create_add_on_products.sql` + `0007_create_service_bundles.sql`
2. Implement `produk-paket.repository.ts` — CRUD AddOn + Bundle (dengan `service_bundle_items` transaction)
3. Implement `produk-paket.service.ts` — validasi bundlePrice, serviceIds cross-salon check
4. Implement `produk-paket.router.ts`
5. Refactor `useProdukPaketController`
6. Smoke test: buat bundle dengan 2 service, hapus satu service dari bundle, refresh — bundle masih ada dengan 1 service. Check `service_bundle_items` cascade.

**Tidak ada customer app step** — customer checkout belum diimplementasikan.

---

### Sprint 4 — Authentication

**Tema:** Ganti seluruh auth sistem. Satu-satunya sprint yang tidak bisa di-rollback dengan mudah.

**Prerequisite sebelum memulai Sprint 4:**

- [ ] Email provider dikonfigurasi (Resend/SMTP) dan diverifikasi
- [ ] `supabaseAdmin` client dengan service_role_key sudah berjalan
- [ ] `profiles` table design sudah di-review dan disetujui
- [ ] Test plan auth flow sudah disiapkan (invite → accept → login → role check)
- [ ] Semua Sprint 1-3 sudah stable di production

---

#### Sprint 4, Step 8 — Pengguna & Akses

**Yang dikerjakan:**

1. Jalankan `0010_create_profiles.sql` + RLS policies
2. Jalankan `0011_create_invitations.sql`
3. Implement `pengguna.repository.ts`
4. Implement `pengguna.service.ts` — OWNER protection, unique invite guard, self-revoke guard
5. Implement `pengguna.router.ts` — semua procedures butuh `requireRole('OWNER')` middleware
6. Refactor `AuthContext` — ganti localStorage mock dengan Supabase session
7. Refactor `usePenggunaController`
8. Full auth flow test: invite STAFF, accept invite, login, cek role di dashboard, deactivate, cek tidak bisa login
9. Smoke test: logout, cek semua protected routes redirect ke login

**Deployment note:** Deploy Sprint 4 sebagai atomic deployment — jangan deploy `profiles` migration tanpa juga deploy `AuthContext` baru. Jika terpisah, ada window di mana auth mock masih aktif tapi `profiles` tabel sudah ada — bisa menyebabkan confusion.

---

## Rollout Summary

```
Pre-Sprint   Infrastruktur tRPC + Supabase clients + Storage buckets
             Verifikasi schema aktual di Supabase Dashboard

Sprint 1     1. Operasional (business_hours)     — no migration, tRPC validation
             2. Brand                             — ALTER salons (additive)
             3. Layanan                           — ALTER categories + services
                                                   + service_flow backfill

Sprint 2     4. Booking App                      — CREATE bank_accounts + audit_logs
             5. Operasional sisa                  — CREATE special_closing_dates
                                                   + booking_policies
                                                   + customer app coordination

Sprint 3     6. Tim                               — CREATE 4 staff tables
                                                   + customer app coordination
             7. Produk & Paket                    — CREATE 3 catalog tables

Sprint 4     8. Pengguna & Akses                 — CREATE profiles + invitations
                                                   + replace localStorage auth
                                                   + Supabase Auth integration
```

---

## Go / No-Go Gates

Setiap sprint harus lulus gate ini sebelum sprint berikutnya dimulai:

| Gate         | Kondisi                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Pre-Sprint   | tRPC handler returning 200, `protectedProcedure` reject unauthenticated request                                                    |
| Sprint 1 end | `business_hours` tersimpan dan persist, customer calendar masih berjalan, `service_flow` backfill selesai                          |
| Sprint 2 end | Booking App data persist, customer payment screen menampilkan data dari DB, `slot_interval_minutes` dibaca dari DB di customer app |
| Sprint 3 end | Staff data persist, customer stylist selection membaca dari DB, tidak ada data completeness gap yang memblok booking               |
| Sprint 4 end | Full auth flow berhasil (invite → accept → login → role → deactivate), tidak ada localStorage auth sisa                            |
