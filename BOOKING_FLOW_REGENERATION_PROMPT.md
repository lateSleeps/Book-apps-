# 🔄 Booking Flow Regeneration Prompt - Complete Specification

**Project:** Rara Beauty Salon Booking App  
**Module:** Customer Booking Flow  
**App:** Next.js 14 + React + Zustand + TypeScript

---

## 📌 Core Instruction

Generate/regenerate the complete **7-step customer booking flow** untuk aplikasi pemesanan salon. Flow harus linear dengan 1 optional step (Step 2). Setiap step mengumpulkan data spesifik, mengupdate Zustand store, dan memiliki navigation logic. Include UI components, state management, validations, dan semua edge cases.

---

## ✅ Complete Requirements

### **Architecture & Setup**

1. **Technology Stack:**

   - Framework: Next.js 14 (App Router)
   - State Management: Zustand dengan persist & devtools middleware
   - UI: Tailwind CSS v4 dengan oklch colors
   - Type Safety: Full TypeScript
   - Form Validation: Custom validators + Zod
   - Storage: LocalStorage (via Zustand persist)

2. **Project Structure:**

   ```
   apps/customer/src/
   ├── app/book/[slug]/
   │   ├── page.tsx                        # Master router/controller
   │   └── _steps/
   │       ├── StepServices.tsx            # 1️⃣
   │       ├── StepServiceDetail.tsx       # 2️⃣ (optional)
   │       ├── StepStylist.tsx             # 3️⃣
   │       ├── StepConfirm.tsx             # 4️⃣
   │       ├── StepContact.tsx             # 5️⃣
   │       ├── StepPayment.tsx             # 6️⃣
   │       └── StepTicket.tsx              # 7️⃣
   ├── features/booking/
   │   ├── hooks/use-booking-store.ts      # Zustand store definition
   │   ├── types/booking.types.ts          # All TypeScript interfaces
   │   ├── constants/booking.constants.ts  # Constants (codes, amounts, etc)
   │   ├── lib/
   │   │   ├── price-calculator.ts         # Price calculation logic
   │   │   └── validators.ts               # Validation functions
   │   └── components/
   │       ├── digital-ticket/
   │       │   ├── DigitalTicket.tsx       # Main ticket display
   │       │   ├── QRCodeDisplay.tsx       # QR code wrapper
   │       │   └── TicketDivider.tsx       # Divider component
   │       ├── booking-summary/
   │       │   ├── BookingSummary.tsx      # Summary panel
   │       │   ├── SummaryItem.tsx         # Individual item
   │       │   └── CountdownTimer.tsx      # Timer display
   │       └── ... (other shared components)
   └── shared/
       └── lib/
           ├── cn.ts                       # classNames utility
           ├── format.ts                   # Date & currency formatting
           └── logger.ts                   # Logging utility
   ```

3. **Type Definitions (booking.types.ts):**

   ```typescript
   interface BookingState {
     // Navigation
     step: number;

     // Step 1 & 2 Data
     category: Category | null;
     services: Service[];
     formAnswers: FormAnswers | null;

     // Step 3 Data
     date: string | null;
     stylist: Stylist | null;
     timeSlot: string | null;

     // Step 4 Data
     addons: SelectedAddon[];
     promoCode: string | null;
     discountAmount: number;

     // Step 5 Data
     customerName: string | null;
     customerPhone: string | null;

     // Step 6 Data
     paymentType: PaymentType; // "FULL" | "DEPOSIT"
     proofImageUrl: string | null;

     // Step 7 Data & Status
     bookingStatus: BookingStatus;
     bookingCode: string | null;
     pin: string | null;

     // Computed
     totalPrice: number;
     depositAmount: number;
     totalDuration: number;
   }

   type Step =
     | "services"
     | "service-detail"
     | "stylist"
     | "confirm"
     | "contact"
     | "payment"
     | "ticket";
   type PaymentType = "FULL" | "DEPOSIT";
   type BookingStatus = "DRAFT" | "PENDING" | "CONFIRMED" | "COMPLETED";
   ```

---

## 🔢 Step-by-Step Detailed Specifications

### **STEP 1: Select Service (StepServices.tsx)**

**Purpose:** Customer pilih kategori dan service layanan salon

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Pilih Layanan"                        Progress: 1/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Service Category Grid  │  BOOKING SUMMARY              │
│ ─────────────────────  │  ───────────────────          │
│ [Hair] [Nails]         │  Selected Service: -           │
│ [Skincare] [etc]       │  Date: -                       │
│                        │  Time: -                       │
│ Service Cards (Grid):  │  Stylist: -                    │
│ ┌──────┬──────────┐    │  Duration: -                   │
│ │ Photo│ Service  │    │  Total: Rp 0                   │
│ │      │ Name     │    │                                │
│ │      │ Price    │    │  [Next →]                      │
│ └──────┴──────────┘    │                                │
│ Qty: [±]               │                                │
│                        │                                │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- CategoryFilter (optional)
- ServiceCardGrid (reusable)
- ServiceCard (with quantity selector)
- BookingSummary sidebar (sticky)
- BottomCTA (Next button)

**Data to Capture:**

- `category`: Selected category ID
- `services`: Array of {id, name, price, duration}

**User Actions:**

1. Tap category (optional filter)
2. Select service(s) (single or multiple)
3. Adjust quantity jika applicable
4. Tap "Next" button

**Validation:**

- At least 1 service must be selected
- Maximum service duration check (vs business hours)

**State Updates:**

```typescript
useBookingStore.setCategory(category);
useBookingStore.addService(service);
```

**Navigation Logic:**

```
if (services.length === 1 && !isCustomService)
  → Go to "stylist" (skip service-detail)
else if (services.length > 1 || hasCustomRequest)
  → Go to "service-detail"
```

**Edge Cases:**

- Service out of stock/unavailable
- Service price changes real-time
- Quantity limits per service
- Service combination restrictions

---

### **STEP 2: Service Details (StepServiceDetail.tsx) [OPTIONAL]**

**Purpose:** Input detail custom untuk service (panjang rambut, treatment khusus, reference photos, dll)

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Detail Layanan"                     Progress: 2/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Form Fields:           │  BOOKING SUMMARY              │
│ ─────────────────      │  ───────────────────          │
│ Service: [Hair Cut ▼]  │  Selected Service: Hair Cut   │
│                        │  Duration: 60 min             │
│ Panjang Rambut:        │  Price: Rp 150,000            │
│ ○ Short ○ Medium ●Long │                               │
│                        │  [← Back]  [Next →]           │
│ Warna:                 │                               │
│ [○] Natural            │                               │
│ [○] Dye (Color)        │                               │
│ [○] Bleach             │                               │
│                        │                               │
│ Treatment:             │                               │
│ ☐ Deep Conditioning    │                               │
│ ☐ Keratin             │                               │
│ ☐ Protein             │                               │
│                        │                               │
│ Referensi Foto:        │                               │
│ [+ Upload Photo]       │                               │
│                        │                               │
│ Catatan Khusus:        │                               │
│ [Text area...]         │                               │
│                        │                               │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- DynamicFormBuilder (for questionnaire)
- FileUploader (for reference photos)
- SelectField, RadioGroup, CheckboxGroup
- DurationCalculator (if applicable)
- BackButton, NextButton

**Data to Capture:**

- `formAnswers`: Object dengan semua jawaban form
  ```typescript
  interface FormAnswers {
    [questionKey: string]: string | string[] | File[];
  }
  ```

**User Actions:**

1. Answer questionnaire questions (bisa radio, checkbox, select, text)
2. Upload reference photos (optional, max 5 files)
3. Tambah catatan khusus
4. Review duration impact
5. Tap "Back" atau "Next"

**Validation:**

- Required fields must be filled
- File format validation (jpg, png only)
- File size < 5MB each
- Text input character limits

**State Updates:**

```typescript
useBookingStore.setFormAnswers(formAnswers);
// Optionally update duration based on answers
```

**Navigation:**

- Back → "services"
- Next → "stylist"

**Edge Cases:**

- Large file uploads (show progress)
- Photo preview before upload
- Clear/reset form option
- Auto-save form answers to localStorage

---

### **STEP 3: Choose Stylist & DateTime (StepStylist.tsx)**

**Purpose:** Customer pilih stylist dan jadwal appointment

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Pilih Stylist & Jadwal"               Progress: 3/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Tanggal:               │  BOOKING SUMMARY              │
│ [May 2024 ◀ ▶]         │  ───────────────────          │
│ S  M  T  W  T  F  S    │  Service: Hair Cut            │
│    1  2  3  4  5  6    │  Duration: 60 min             │
│ 7  8  9 10 11 12 13    │  Stylist: -                   │
│14 15 16 17 18 19 20    │  Date: -                      │
│21 22 23 24 25 26 27    │  Time: -                      │
│28 29 30 31             │  Total: Rp 150,000            │
│ [◀ Prev] [Today] [Next▶]│                               │
│                        │  [← Back]  [Next →]           │
│ Stylist Available:     │                               │
│ ┌──────────────────┐   │                               │
│ │ Photo │ Name     │   │                               │
│ │       │ ⭐⭐⭐⭐⭐ │   │                               │
│ │       │ Spec:    │   │                               │
│ │       │ Hair Cut │   │                               │
│ └──────────────────┘   │                               │
│                        │                               │
│ Available Time:        │                               │
│ [09:00] [10:00]        │                               │
│ [11:00] [13:00]        │                               │
│ [14:00] [15:30]        │                               │
│                        │                               │
│ ⏰ Limited Time:        │ Offer expires in: 15:23      │
│                        │                               │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- Calendar (date picker, dapat custom range)
- StylistCard/Grid (dengan foto, rating, specialization)
- TimeSlotSelector (grid of available times)
- CountdownTimer (limited offer)
- DateRangeValidator
- AvailabilityChecker
- BackButton, NextButton

**Data to Capture:**

- `date`: ISO string (YYYY-MM-DD)
- `stylist`: {id, name, specialties, rating}
- `timeSlot`: HH:MM format

**User Actions:**

1. Select date dari calendar
2. View available stylists untuk date tersebut
3. Tap stylist untuk melihat available times
4. Select time slot
5. Tap "Back" atau "Next"

**Validation:**

- Date must be in future (minimum: next available date)
- Date tidak bisa > 60 hari (configurable)
- Time slot must exist di stylist schedule
- No double-booking (check existing reservations)
- Minimum duration available untuk selected service

**API/Data Requirements:**

```typescript
// Get available stylists untuk date & service
fetchAvailableStylists(date, serviceIds);

// Get available time slots untuk stylist & date
fetchAvailableTimeSlots(stylistId, date, durationMinutes);

// Check conflict
checkTimeConflict(stylistId, date, startTime, endTime);
```

**State Updates:**

```typescript
useBookingStore.setDate(date);
useBookingStore.setStylist(stylist);
useBookingStore.setTimeSlot(timeSlot);
```

**Navigation:**

- Back → "services" (or "service-detail" jika applicable)
- Next → "confirm"

**Edge Cases:**

- No available slots (show message, suggest nearby dates)
- Stylist unavailable (filter out)
- Real-time slot updates (websocket or polling)
- Timezone handling
- Business hours constraints

---

### **STEP 4: Confirm Booking (StepConfirm.tsx)**

**Purpose:** Review lengkap dan add-ons sebelum lanjut ke payment

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Konfirmasi Pemesanan"                 Progress: 4/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Service Summary:       │  BOOKING SUMMARY              │
│ ─────────────────      │  ───────────────────          │
│ Hair Cut 60 min        │  Service: Hair Cut            │
│ Rp 150,000       [Edit]│  Date: 31 May 2024            │
│                        │  Time: 14:00                  │
│ Stylist:               │  Stylist: Ani (⭐⭐⭐⭐⭐)      │
│ Ani              [Edit]│                               │
│                        │  Subtotal: Rp 150,000         │
│ Schedule:              │  Addons: Rp 50,000            │
│ 31 May 2024 14:00 [Edit]│  Discount: -Rp 10,000       │
│                        │  Tax (10%): Rp 19,000         │
│ ┌─────────────────┐   │  ──────────────────           │
│ │ ADD-ONS         │   │  TOTAL: Rp 209,000            │
│ │ ────────────── │   │                               │
│ │ ☐ Deep Cond.   │   │  [← Back]  [Next →]           │
│ │   Rp 50,000     │   │                               │
│ │ ☐ Protein       │   │                               │
│ │   Rp 75,000     │   │                               │
│ │ ☐ Hair Mask     │   │                               │
│ │   Rp 45,000     │   │                               │
│ └─────────────────┘   │                               │
│                        │                               │
│ Promo Code:            │                               │
│ [Enter code...]  [Apply]│                               │
│ ✓ WELCOME2024 applied  │                               │
│ Discount: Rp 10,000 (5%)│                               │
│                        │                               │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- SummarySection (service, stylist, schedule)
- AddonsSelector (checkboxes with prices)
- PriceBreakdown (subtotal, addons, discount, tax, total)
- PromoCodeInput (dengan validation & apply button)
- EditButtons (untuk setiap section)
- BackButton, NextButton

**Data to Capture:**

- `addons`: Array of {id, name, price}
- `promoCode`: String (if valid)
- `discountAmount`: Calculated discount

**User Actions:**

1. Review summary (dapat tap "Edit" untuk kembali ke step sebelumnya)
2. Select optional add-ons
3. Enter promo code (optional, dengan instant validation)
4. Review final total
5. Tap "Back" atau "Next"

**Calculations:**

```typescript
subtotal = servicePrice + addonsPrice;
tax = subtotal * 0.1; // Default 10%, configurable
discount = promoCode ? calculateDiscount(promoCode, subtotal) : 0;
totalPrice = subtotal + tax - discount;
depositAmount = paymentType === "DEPOSIT" ? totalPrice * 0.5 : 0;
```

**Promo Code Logic:**

- Validate format
- Check jika kode valid & active
- Calculate discount (fixed amount atau percentage)
- Show discount amount real-time
- Handle expired codes

**State Updates:**

```typescript
useBookingStore.addAddon(product);
useBookingStore.setPromoCode(code, discount);
```

**Navigation:**

- Edit links → back to respective step
- Back → "contact" (atau langsung ke step yang ingin di-edit)
- Next → "contact"

**Edge Cases:**

- Invalid/expired promo code
- Add-on unavailable untuk service tertentu
- Price changes (real-time sync)
- Multiple promo codes (only 1 valid)
- Minimum purchase requirements

---

### **STEP 5: Contact Information (StepContact.tsx)**

**Purpose:** Kumpulkan data personal customer

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Informasi Kontak"                     Progress: 5/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Nama Lengkap:          │  BOOKING SUMMARY              │
│ [_________________]    │  ───────────────────          │
│ ⓘ Minimal 2 karakter   │  Service: Hair Cut            │
│                        │  Total: Rp 209,000            │
│ Nomor Telepon:         │  Stylist: Ani                 │
│ [_________________]    │  Date: 31 May 2024 14:00      │
│ ⓘ Format: 08xx atau    │                               │
│    +628xx              │  [← Back]  [Next →]           │
│                        │                               │
│ Email (Opsional):      │                               │
│ [_________________]    │                               │
│                        │                               │
│ ☐ Saya setuju dengan   │                               │
│   Syarat & Ketentuan   │                               │
│                        │                               │
│ Error Messages:        │                               │
│ ⚠ Nama wajib diisi     │                               │
│ ⚠ Telepon tidak valid  │                               │
│                        │                               │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- TextInput (with validation & error messages)
- PhoneInput (with formatting & validation)
- EmailInput (optional)
- TermsCheckbox
- ValidationErrorDisplay
- BackButton, NextButton (NextButton disabled sampai form valid)

**Data to Capture:**

- `customerName`: String (min 2 chars, max 100)
- `customerPhone`: String (formatted, validated)
- `customerEmail`: String (optional, email format)

**User Actions:**

1. Type nama lengkap
2. Type nomor telepon (auto-format)
3. Type email (optional)
4. Accept terms & conditions (checkbox)
5. Tap "Back" atau "Next"

**Validation Rules:**

```typescript
// Nama
- Required field
- Minimum 2 characters
- Maximum 100 characters
- Only letters, spaces, hyphens allowed
- Error: "Nama minimal 2 karakter"

// Telepon
- Required field
- Format: 08xx atau +628xx (Indonesia)
- Length: 10-13 characters
- Regex: /^(08|\\+628)[0-9]{8,11}$/
- Error: "Format telepon tidak valid"

// Email
- Optional field
- Valid email format
- Error: "Format email tidak valid"

// Terms
- Must be checked
- Error: "Harap setujui Syarat & Ketentuan"
```

**User Experience:**

- Real-time validation feedback
- Input masking untuk phone (auto add leading 0)
- Auto-capitalize nama
- Phone number format helper text
- Disable Next button jika ada validation errors

**State Updates:**

```typescript
useBookingStore.setContact(customerName, customerPhone);
```

**Navigation:**

- Back → "confirm"
- Next → "payment" (only if form valid)

**Edge Cases:**

- Phone number formatting dari paste
- International numbers (handle +62)
- Typo detection untuk phone
- Whitespace trimming

---

### **STEP 6: Payment Method (StepPayment.tsx)**

**Purpose:** Pilih metode pembayaran dan jenis pembayaran (full/deposit)

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: "Metode Pembayaran"                    Progress: 6/7 │
├────────────────────────┬───────────────────────────────┤
│                        │                               │
│ Jenis Pembayaran:      │  BOOKING SUMMARY              │
│ ○ FULL (Lunas) Rp 209K │  ───────────────────          │
│ ● DEPOSIT (DP) Rp 104K │  Service: Hair Cut            │
│                        │  Total: Rp 209,000            │
│ Sisa Pembayaran:       │  Payment: DP Rp 104,500       │
│ Rp 104,500 (saat ini)  │  Remaining: Rp 104,500        │
│                        │  Due: Before appointment      │
│ ────────────────────   │                               │
│                        │  [← Back]  [Next →]           │
│ Metode Pembayaran:     │                               │
│ ○ Transfer Bank        │                               │
│   BCA a/n Rara Beauty  │                               │
│   1234567890           │                               │
│   Mohon SS bukti ke    │                               │
│   WA admin             │                               │
│                        │                               │
│ ● e-Wallet             │                               │
│   [GCash] [GrabPay]    │                               │
│   [LinkAja] [OVO]      │                               │
│                        │                               │
│ ○ Tunai                │                               │
│   Bayar saat datang    │                               │
│                        │                               │
│ Bukti Pembayaran:      │                               │
│ [+ Upload Screenshot] (jika transfer) │                               │
│                        │                               │
│ ⏰ Deadline Pembayaran: │                               │
│ 30 May 2024 16:00      │                               │
│ Expires in: 23:45      │                               │
│                        │                               │
└────────────────────────┴───────────────────────────────┘
```

**Components:**

- PaymentTypeSelector (radio: FULL vs DEPOSIT)
- PaymentMethodButtons (transfer, ewallet, cash)
- BankTransferInfo (bank details, copy button)
- FileUploader (for payment proof screenshot)
- PaymentDeadlineTimer (countdown)
- PriceDisplay (total vs deposit amount)
- BackButton, NextButton

**Data to Capture:**

- `paymentType`: "FULL" | "DEPOSIT"
- `paymentMethod`: "transfer" | "ewallet" | "cash"
- `proofImageUrl`: URL string (jika applicable)

**Constants:**

```typescript
DEPOSIT_PERCENTAGE = 0.5; // 50% dari total
PAYMENT_DEADLINE_HOURS = 24; // Bayar dalam 24 jam
BANK_ACCOUNT = {
  bank: "BCA",
  name: "Rara Beauty Jakarta",
  number: "1234567890",
};
EWALLETS = ["GCash", "GrabPay", "LinkAja", "OVO"];
```

**User Actions:**

1. Select "FULL" atau "DEPOSIT"
2. Select payment method (transfer, ewallet, cash)
3. Jika transfer:
   - Lihat bank account details
   - Copy account number (1-click copy)
   - Upload bukti transfer screenshot
4. Tap "Back" atau "Next"

**Validations:**

- Payment type required
- Payment method required
- Proof image required (jika transfer/ewallet)
- File format: jpg, png only
- File size: < 5MB
- Image content: must show transfer/payment confirmation
- Deadline countdown: warn jika < 1 jam tersisa

**File Upload:**

- Accept: image/jpeg, image/png
- Max size: 5MB
- Preview before upload
- Error handling (network, invalid file)

**State Updates:**

```typescript
useBookingStore.setPaymentType(paymentType);
useBookingStore.setProofImage(proofImageUrl);
```

**Navigation:**

- Back → "contact"
- Next → "ticket" (setelah payment verified atau pending)

**Post-Payment:**

- Show success message
- Generate booking code & PIN
- Move ke Step 7 (Ticket)

**Edge Cases:**

- Deadline expired (show re-payment option)
- Payment proof verification pending (show status)
- Multiple proof uploads (latest overrides)
- Network error during upload (retry)
- E-wallet direct redirect (if integrated)

---

### **STEP 7: Booking Confirmation Ticket (StepTicket.tsx)**

**Purpose:** Tampilkan confirmation ticket dengan QR code untuk check-in

**UI Layout:**

```
┌──────────────────────────────────────────────────────┐
│ Booking Confirmation                        Progress: 7/7 │
├──────────────────────────────────────────────────────┤
│                                                      │
│        ┌─────────────────────────────────┐          │
│        │  RARA BEAUTY JAKARTA            │          │
│        │  31 May 2024                    │          │
│        ├─────────────────────────────────┤          │
│        │ Layanan        │ Stylist       │          │
│        │ Hair Cut       │ Ani ⭐⭐⭐⭐⭐ │          │
│        ├─────────────────────────────────┤          │
│        │ Booking ID     │ PIN           │          │
│        │ RB-0531-7228   │ 7228          │          │
│        ├─────────────────────────────────┤          │
│        │ Tanggal        │ Waktu         │          │
│        │ 31 May 2024    │ 14:00 - 15:00 │          │
│        ├─────────────────────────────────┤          │
│        │ Total Pembayaran (DP)           │          │
│        │            Rp 104,500           │          │
│        ├─────────────────────────────────┤          │
│        │        [QR CODE HERE]           │          │
│        │   Ukuran: 200x200px             │          │
│        │   Value: rara-beauty:RB-0531-   │          │
│        │          7228:7228              │          │
│        ├─────────────────────────────────┤          │
│        │ Tunjukkan QR code ini saat      │          │
│        │ check-in                        │          │
│        └─────────────────────────────────┘          │
│                                                      │
│  [Download Ticket] [Share Ticket] [Done]            │
│                                                      │
│ ┌──────────────────────────────────────────┐        │
│ │ Policy Info:                             │        │
│ │ • Datang tepat waktu (tolerance 15 min) │        │
│ │ • Reschedule max H-1, max 2x            │        │
│ │ • Pembatalan: DP tidak dapat di-refund  │        │
│ └──────────────────────────────────────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Components:**

- DigitalTicket (main ticket display)
- QRCodeDisplay (QR code wrapper using `qrcode` library)
- TicketDivider (separator lines)
- DownloadButton (export as PNG)
- ShareButton (social share)
- PolicyPanel (salon policies)
- BottomCTA (Done button)

**DigitalTicket Component:**

```typescript
interface DigitalTicketProps {
  code: string;
  pin: string;
  date: string;
  timeSlot: string;
  serviceName: string;
  stylistName: string;
  totalPrice: number;
  paymentType: "FULL" | "DEPOSIT";
}

// Displays:
// - Salon name & date header
// - Service & stylist info (2-column grid)
// - Booking ID & PIN (2-column grid)
// - Date & time (2-column grid)
// - Total payment breakdown
// - QR code (200x200px)
// - Check-in instructions
```

**QRCodeDisplay Component:**

```typescript
// Uses: qrcode library for canvas-based generation
// Value: `rara-beauty:{bookingCode}:{pin}`
// Size: 200x200 pixels
// Colors: Black code on white background
// Error correction: Medium (M)

const qrValue = `rara-beauty:${bookingCode}:${pin}`;
const qrCanvas = await QRCode.toCanvas(qrValue, {
  width: 200,
  margin: 0,
  color: { dark: "#111110", light: "#ffffff" },
});
```

**Download Ticket Functionality:**

```typescript
// 1. Create main canvas (800x1200px)
// 2. Draw ticket design elements (background, salon name, etc)
// 3. Generate QR code canvas
// 4. Draw QR code onto main canvas
// 5. Convert canvas to blob (PNG format)
// 6. Trigger download via anchor tag

async function downloadTicket() {
  const canvas = await renderTicketToCanvas();
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiket-${bookingCode}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
```

**Data Displayed:**

- Semua data dari step 1-6
- Auto-generated `bookingCode` (RB-MMDD-XXXX)
- Auto-generated `pin` (4 digit)
- `bookingStatus`: "CONFIRMED"

**State Updates:**

```typescript
useBookingStore.confirmBooking(); // Set status to CONFIRMED
useBookingStore.completeBooking(); // Final state after done
```

**User Actions:**

1. View digital ticket
2. Download as PNG
3. Share via WhatsApp/Email (optional)
4. Read policies
5. Tap "Done" → show farewell screen

**Post-Completion:**

```typescript
// Farewell Screen
- Show "Terima kasih" message
- Display salon policies
- Show booking summary
- Close button → reset store & redirect to home
- Reset all booking state untuk booking baru
```

**Edge Cases:**

- QR code generation failure (fallback to text code)
- Download not supported (copy booking code & PIN)
- Large file size (optimize PNG)
- Browser storage limitation
- Print ticket option (optional)

---

## 📊 Zustand Store Implementation

**File:** `use-booking-store.ts`

**Key Middleware:**

- `persist`: Save to localStorage (key: `booking-session`)
- `devtools`: Redux DevTools integration
- Custom middleware untuk price calculation

**Main Actions:**

```typescript
// Navigation
setStep(step: number)
goNext()
goBack()

// Data setters
setCategory(category)
addService(service)
removeService(serviceId)
setFormAnswers(answers)
setDate(date)
setStylist(stylist)
setTimeSlot(timeSlot)
clearTimeSlot()
addAddon(product)
removeAddon(id)
setPaymentType(type)
setProofImage(url)
setContact(name, phone)
setPromoCode(code, discount)
removePromoCode()

// State transitions
confirmBooking() // Generate booking code & PIN
completeBooking()
reset()

// Error handling
setError(error)
setValidationError(field, error)
clearAllErrors()
```

**Computed Properties:**

- `totalPrice`: Sum of services + addons - discount + tax
- `depositAmount`: 50% of totalPrice
- `totalDuration`: Sum of service durations
- `formattedDate`: Localized date string

---

## ✔️ Validation & Error Handling

**Global Error Display:**

- ErrorAlert component (top of page, dismissible)
- Inline field errors (under input)
- Toast notifications (for confirmations)

**Field-Level Validators:**

```typescript
// Use custom validator functions atau Zod schemas
const validators = {
  name: (value) => value.length >= 2,
  phone: (value) => /^(08|\\+628)[0-9]{8,11}$/.test(value),
  email: (value) => value === "" || /^[^@]+@[^@]+\\.[^@]+$/.test(value),
  date: (value) => new Date(value) > new Date(),
  // ... etc
};
```

**Step-Level Validations:**

```typescript
canProceedToNext(): boolean {
  switch(step) {
    case "services": return services.length > 0;
    case "stylist": return date && stylist && timeSlot;
    case "contact": return name && phone && termsAccepted;
    case "payment": return paymentMethod &&
                          (paymentMethod !== "transfer" || proofImage);
    default: return true;
  }
}
```

---

## 📱 Responsive Design Requirements

**Desktop (1024px+):**

- 2-column layout: Form (60%) + Summary (40%)
- Summary sticky on scroll

**Tablet (768-1023px):**

- 1-column layout
- Summary floating (dismissible)
- Sticky footer for CTA

**Mobile (< 768px):**

- Full-width form
- Summary above (collapsible) or below form
- Sticky bottom CTA button
- Touch-friendly inputs & buttons (48px+ height)

---

## 🎨 UI/UX Standards

- Use Tailwind v4 dengan oklch colors
- Component: BottomCTA untuk call-to-action buttons
- Component: BookingSummary untuk sticky summary
- Component: ErrorAlert untuk error messages
- Icons: Lucide React untuk consistent iconography
- Animations: Smooth transitions (framer-motion optional)
- Loading states: Skeleton screens atau spinners
- Empty states: Helpful messaging & suggestions

---

## 📋 Complete Checklist

- [ ] All 7 steps render correctly
- [ ] Navigation (next/back) works seamlessly
- [ ] State persists across page refresh
- [ ] QR code generates dengan correct value
- [ ] Ticket downloads as PNG
- [ ] Responsive pada mobile/tablet/desktop
- [ ] Form validations trigger correctly
- [ ] Promo code calculation works
- [ ] Payment deadline countdown displays
- [ ] Booking code & PIN unique setiap booking
- [ ] Zustand store devtools working
- [ ] LocalStorage persist/hydrate working
- [ ] Error handling & recovery options
- [ ] Loading states untuk async operations
- [ ] Accessibility (labels, ARIA, keyboard nav)
- [ ] Type safety (no `any` types)
- [ ] All edge cases handled
- [ ] Performance optimized (no unnecessary re-renders)

---

## 🚀 Testing Scenarios

1. **Happy Path:** Complete booking flow end-to-end
2. **Skip Optional Step:** Service dengan 1 pilihan → skip detail
3. **Error Recovery:** Invalid input → correct → proceed
4. **Promo Code:** Valid code → discount applied correctly
5. **Payment Proof:** Upload image → verify file validation
6. **Expired Deadline:** Payment deadline passed → show message
7. **Browser Refresh:** Mid-booking → state restored
8. **QR Code Scan:** Scan ticket QR → extract correct data
9. **Mobile Navigation:** All steps touch-friendly
10. **Concurrent Bookings:** Different stylist/time available

---

## 📚 Reference & Resources

- **Zustand Docs:** https://github.com/pmndrs/zustand
- **Next.js 14:** https://nextjs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Best Practices:** https://react.dev

---

**Last Updated:** May 31, 2024  
**Version:** 1.0 Complete Specification  
**Status:** Ready for Implementation
