# SF-02 Toast Timer Fix Report

**Tanggal:** 2026-06-12
**File:** `apps/owner/src/features/dashboard/components/settings/components/booking-app/BookingAppPageClient.tsx`

---

## Root Cause

`showToast` memanggil `setTimeout` tanpa menyimpan referensinya. Setiap panggilan membuat timer baru yang tidak bisa dibatalkan.

```tsx
// Sebelum — tidak ada referensi ke timer
function showToast(msg: string) {
  setToast(msg);
  setTimeout(() => setToast(null), 3500);
}
```

Skenario bug yang terjadi:

1. Owner upload QRIS → `showToast('Foto QRIS berhasil diperbarui.')` → timer T1 dimulai
2. Owner hapus QRIS dalam < 3.5 detik → `showToast('Foto QRIS dihapus.')` → timer T2 dimulai
3. T1 berakhir → `setToast(null)` → toast T2 menghilang lebih awal dari seharusnya
4. Owner melihat feedback yang hilang sebelum selesai dibaca

Selain itu, jika komponen unmount sebelum timer berakhir, `setToast(null)` dipanggil pada komponen yang sudah tidak ada — React mengeluarkan warning "Can't perform a React state update on an unmounted component" di development.

---

## Code Changed

### Import — tambah `useEffect` dan `useRef`

```tsx
// Sebelum
import { useState } from "react";

// Sesudah
import { useEffect, useRef, useState } from "react";
```

### Toast state block — tambah ref, cleanup effect, dan guard di showToast

```tsx
// Sebelum
const [toast, setToast] = useState<string | null>(null);

function showToast(msg: string) {
  setToast(msg);
  setTimeout(() => setToast(null), 3500);
}

// Sesudah
const [toast, setToast] = useState<string | null>(null);
const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  return () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };
}, []);

function showToast(msg: string) {
  if (toastTimer.current) clearTimeout(toastTimer.current);
  setToast(msg);
  toastTimer.current = setTimeout(() => setToast(null), 3500);
}
```

Tiga perubahan:

1. `toastTimer` ref — menyimpan ID timer aktif
2. `useEffect` cleanup — membatalkan timer jika komponen unmount sebelum 3.5 detik
3. Guard di `showToast` — membatalkan timer lama sebelum membuat timer baru

Pola identik dengan `OperationalPageClient.tsx` (implementasi referensi).

---

## Why Fix Is Safe

- Tidak ada perubahan pada render output, props, atau state yang diekspor
- `useRef` tidak menyebabkan re-render
- `useEffect` dengan dependency array kosong hanya berjalan sekali pada mount dan cleanup pada unmount — tidak ada efek samping selama komponen hidup
- Tidak ada logika timer yang berubah selain penambahan `clearTimeout` sebelum `setTimeout`
- `tsc --noEmit` — 0 errors setelah perubahan

---

## Verification Steps

1. Buka `/dashboard/settings/booking`
2. Upload foto QRIS → konfirmasi save → toast "Foto QRIS berhasil diperbarui." harus muncul selama penuh 3.5 detik
3. Segera setelah toast muncul (< 1 detik), hapus QRIS → toast pertama harus langsung digantikan toast "Foto QRIS dihapus." yang bertahan penuh 3.5 detik
4. Navigasi keluar dari halaman sebelum 3.5 detik berakhir — tidak boleh ada warning React di console
