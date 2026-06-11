# SettingsEntitySheet Build Fix Report

**Date:** 2026-06-11
**Final Result:** ✅ Build hijau — `✓ Compiled successfully`, `✓ Generating static pages (24/24)`

---

## 1. File Removal Verification

```
ls apps/owner/src/features/dashboard/components/settings/layout/
```

`SettingsEntitySheet.tsx` tidak ada. File sudah terhapus.

```
grep -rn "SettingsEntitySheet" apps/owner/src/
→ 0 results
```

---

## 2. Remaining References

Setelah penghapusan, zero referensi di source code. Error awal (`No such file or directory`) disebabkan oleh **stale `.next` build cache** — Next.js menyimpan module graph dari build sebelumnya.

Fix: `rm -rf apps/owner/.next`

Setelah cache clear, `SettingsEntitySheet` error hilang sepenuhnya.

---

## 3. Barrel Export Audit

`settings/layout/index.ts` — tidak ada lagi export ke `SettingsEntitySheet`. Bersih.

Tidak ada barrel chain lain yang mereferensikan file tersebut.

---

## 4. Cache Audit

Root cause error awal: `.next` build cache. Setelah `rm -rf .next`, error tersebut tidak muncul lagi di build output.

---

## 5. Root Cause: Pre-existing Type Errors

Setelah SettingsEntitySheet clear, build masih gagal karena type errors yang sudah ada sebelumnya (pre-existing) yang sebelumnya "tersembunyi" karena build berhenti lebih awal. Semua error ini adalah bug di file-file lain, tidak ada yang berkaitan dengan SettingsEntitySheet.

---

## 6. Fixes Applied

| File                           | Error                                                                                                                       | Fix                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `layout.tsx`                   | `MobileDrawer`, `MobileHeader`, `isSidebarOpen` unused imports/vars                                                         | Hapus unused imports dan state (komponen dikomentari)                                                              |
| `DashboardBreadcrumb.tsx`      | `Type 'null' cannot be used as index`                                                                                       | `pathname ? PAGE_LABELS[pathname] : null`                                                                          |
| `SettingsDangerZone.tsx`       | `'idx' declared but never read`                                                                                             | Rename ke `_idx`                                                                                                   |
| `LeaveSection.tsx`             | `icon` prop missing on SettingsEmptyState (×2)                                                                              | Tambah `icon={<Users/CalendarX .../>}`                                                                             |
| `ServiceAssignmentSection.tsx` | `icon` prop missing (×2)                                                                                                    | Tambah `icon={<Users/Scissors .../>}`                                                                              |
| `WeeklyScheduleSection.tsx`    | `icon` prop missing                                                                                                         | Tambah `icon={<Users .../>}`                                                                                       |
| `StaffDirectorySection.tsx`    | `icon` prop missing, `label` prop invalid on SettingsAddButton, `Dispatch` type mismatch, `File` not assignable to `string` | Add `icon`, convert to `children`, use `(patch) => setForm(prev => ({...prev, ...patch}))`, fix onChange signature |
| `DashboardSidebar.tsx`         | `Property 'avatar' does not exist`                                                                                          | Remove `.avatar` reference                                                                                         |
| `use-visit-detail.ts`          | `ProofZoom` cannot be named (isolated modules)                                                                              | Export the interface                                                                                               |
| `useTeamController.ts`         | `ServiceAssignment` unused import                                                                                           | Remove import                                                                                                      |
| `use-dashboard-data.ts`        | `pastBookings` unused variable                                                                                              | Remove dead computation                                                                                            |
| `use-booking-payment.ts`       | `_data` and `variables` implicit `any`                                                                                      | Add explicit types                                                                                                 |
| `use-walk-in-flow.ts`          | `e` implicit `any`                                                                                                          | Add `: unknown`                                                                                                    |
| `trpc.ts`                      | Return type inferred type not portable                                                                                      | Use `ReturnType<typeof createTRPCReact<AppRouter>>`                                                                |
| `test-utils.tsx`               | `customRender` return type not portable                                                                                     | Add `: RenderResult` annotation                                                                                    |
| `tsconfig.json`                | `@rara/database` module not found                                                                                           | Add path mapping to `packages/database/src`                                                                        |

---

## 7. Import Replacement Matrix

Tidak ada import `SettingsEntitySheet` yang perlu diganti. File adalah dead code murni.

---

## 8. Build Result

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (24/24)
```

Zero Type errors. Zero missing module errors. Zero SettingsEntitySheet references.
