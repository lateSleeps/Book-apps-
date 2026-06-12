# Settings V2 Release Triage

**Tanggal:** 2026-06-12
**Sumber:** SETTINGS_V2_PRE_PR_AUDIT.md
**Pertanyaan:** Apakah release ini benar-benar tidak aman, atau hanya tidak sempurna?

---

## Methodology

Setiap item dievaluasi berdasarkan tiga pertanyaan:

1. Apa yang terjadi kalau ini masuk ke production hari ini?
2. Siapa yang terekspos?
3. Berapa effort fix-nya dibanding risiko menundanya?

---

## Triage per Item

---

### [SF-01] `SettingsSideSheet.tsx:28` — `p-4` bukan `p-s16`

**Release Risk:** Low

`p-4` (Tailwind) = 16px. `p-s16` (token) = 16px. Nilai identik. Tidak ada perubahan visual yang bisa dilihat user. Ini adalah penyimpangan dari konvensi, bukan dari output.

**User Impact:** Internal only — tidak ada perubahan yang terlihat di layar.

**Merge Recommendation:** Fix in follow-up PR

---

### [SF-02] `BookingAppPageClient.tsx` — Toast timer tidak dibersihkan

**Release Risk:** Medium

Ini adalah bug nyata dengan skenario yang realistis: owner upload QRIS, konfirmasi berhasil, lalu langsung hapus QRIS dalam < 3.5 detik. Timer pertama masih berjalan dan akan menghapus toast sukses kedua sebelum selesai. Owner menekan "Hapus" → toast "Foto QRIS dihapus" menghilang dalam sepersekian detik → owner tidak yakin aksinya berhasil.

Ini adalah domain baru yang baru pertama kali dirilis. Bug ada di flow utama (QRIS management). Fix-nya adalah 5 baris dengan pola yang sudah ada di `OperationalPageClient`.

**User Impact:** Visible — feedback toast hilang terlalu cepat atau tidak muncul sama sekali.

**Merge Recommendation:** Must fix before merge

---

### [SF-03] `BookingAppPageClient.tsx` — Header typography `text-ts-sub` bukan `text-ts-t3`

**Release Risk:** Low

`text-ts-sub` dan `text-ts-t3` berbeda ukuran. Section heading di Booking App akan terlihat lebih kecil dari heading di Operasional, Pengguna, dan domain lain. Visible, tapi tidak mengganggu fungsionalitas. Owner tetap bisa menggunakan semua fitur tanpa hambatan.

**User Impact:** Visible — heading Booking App sedikit lebih kecil dari halaman settings lainnya.

**Merge Recommendation:** Fix in follow-up PR

---

### [SF-04] `PenggunaPageClient.tsx:141` — Space key tidak ditangani

**Release Risk:** Low

Keyboard users tidak bisa membuka detail pengguna dengan menekan Space pada row tabel. Enter masih berfungsi. Target user (owner salon) sangat dominan menggunakan mouse. Ini adalah violation WCAG 2.1, tapi tidak memblokir akses — semua fungsi tetap bisa diakses lewat mouse atau lewat EntityActionMenu yang ada di setiap row.

**User Impact:** Visible — tapi hanya untuk keyboard-only users yang merupakan minoritas kecil dari user base dashboard ini.

**Merge Recommendation:** Fix in follow-up PR

---

### [SF-05] `PenggunaPageClient.tsx:519` — Unsafe cast `user.role as InvitableRole`

**Release Risk:** Low

`canSaveEdit()` mengembalikan `false` jika `user.role === 'OWNER'`, sehingga `handleEditSave` tidak pernah dieksekusi dengan OWNER sebagai subject. Cast salah secara semantik, tapi tidak pernah mengeksekusi path yang berbahaya. Tidak ada runtime error, tidak ada state corruption yang mungkin terjadi dari path yang terbuka.

**User Impact:** Internal only — tidak ada perubahan yang terlihat di layar dalam kondisi apapun.

**Merge Recommendation:** Fix in follow-up PR

---

### [SF-06] `SettingsIconPicker.tsx:158` — Trigger button tanpa `aria-label`

**Release Risk:** Low

Tombol tidak bisa diidentifikasi oleh screen reader. Tapi `SettingsIconPicker` hanya digunakan di domain Layanan untuk memilih icon kategori — fitur sekunder yang tidak berada di critical path. User yang pakai screen reader tidak bisa menggunakan picker ini, tapi mereka masih bisa membuat dan menyimpan kategori dengan nilai default.

**User Impact:** Internal only — hanya terekspos lewat assistive technology, bukan visual UI.

**Merge Recommendation:** Fix in follow-up PR

---

### [SF-07] 11 Icon weight violations

**Release Risk:** Low

`weight="bold"` menghasilkan icon yang lebih tebal dari `weight="duotone"`. Ini terlihat, tapi konsisten di seluruh release ini — bukan regresi yang muncul dari milestone ini saja. Beberapa icon ini sudah ada sebelum Settings V2 (mis: `SettingsAddButton`, `EntityActionMenu`). User sudah melihatnya di versi sebelumnya.

Pengecualian yang perlu dicatat: `SettingsDangerZone` menggunakan `Warning weight="fill"` di danger zone header — ini adalah pilihan yang bisa dipertahankan secara intentional karena `fill` memberikan penekanan visual yang lebih kuat pada konteks destruktif.

**User Impact:** Visible — icon terlihat lebih tebal dari spec, tapi tidak ada yang terlihat rusak atau broken.

**Merge Recommendation:** Fix in follow-up PR

---

## Release Safety Assessment

| Item                        | Risk   | Impact                  | Recommendation            |
| --------------------------- | ------ | ----------------------- | ------------------------- |
| SF-01 — `p-4` spacing token | Low    | Internal                | Follow-up PR              |
| SF-02 — Toast timer leak    | Medium | Visible                 | **Must fix before merge** |
| SF-03 — Header typography   | Low    | Visible                 | Follow-up PR              |
| SF-04 — Space key missing   | Low    | Visible (keyboard only) | Follow-up PR              |
| SF-05 — Unsafe OWNER cast   | Low    | Internal                | Follow-up PR              |
| SF-06 — aria-label missing  | Low    | Internal                | Follow-up PR              |
| SF-07 — 11 icon weights     | Low    | Visible                 | Follow-up PR              |

---

## Final Verdict

```
SAFE TO MERGE
```

dengan satu syarat: **SF-02 (toast timer) harus diperbaiki sebelum merge.**

Semua item lain tidak membuat release ini tidak aman. Mereka membuat release ini tidak sempurna — yang berbeda.

13 dari 15 SHOULD FIX adalah design system compliance dan accessibility polish. Tidak ada yang menyebabkan data corruption, state yang salah, atau fungsionalitas yang tidak bisa digunakan. Mereka layak masuk follow-up PR yang bisa dikerjakan paralel dengan development milestone berikutnya.

SF-02 adalah satu-satunya item yang menyentuh: bug nyata, domain baru, flow utama, fix trivial. Tidak ada alasan untuk tidak memperbaikinya sebelum merge.

---

## Follow-up PR Scope (Setelah Merge)

Semua item berikut bisa dikerjakan dalam satu PR kecil:

- SF-01 — 1 baris, `SettingsSideSheet.tsx`
- SF-03 — 3 baris, `BookingAppPageClient.tsx`
- SF-04 — 1 baris, `PenggunaPageClient.tsx`
- SF-05 — 1 baris, `PenggunaPageClient.tsx`
- SF-06 — 1 baris, `SettingsIconPicker.tsx`
- SF-07 — 11 baris, 8 file

Total: ~18 baris. Satu PR kecil, tidak butuh review berat.
