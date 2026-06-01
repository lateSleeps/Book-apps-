# Rara Beauty - Customer Booking Flow Documentation

## 📋 Overview

Rara Beauty customer booking app adalah aplikasi pemesanan salon yang memandu customer melalui 7 langkah terstruktur untuk membuat booking appointment. Setiap langkah mengumpulkan informasi spesifik dan menampilkan booking summary di sisi kanan layar.

---

## 🔄 Complete Booking Flow Sequence

### **Step 1: Select Service (StepServices.tsx)**

**Purpose:** Customer memilih kategori layanan salon

- **UI Components:**

  - Service category grid/list
  - Service cards dengan harga dan durasi
  - Booking summary panel di sisi kanan
  - Navigation: Next button (conditional - direct ke stylist jika 1 service, ke detail jika multiple/custom)

- **Data Captured:**

  - `category`: Kategori layanan (Hair, Nails, Skincare, etc.)
  - `services`: Array of selected services

- **State Updates:**

  - `useBookingStore.setCategory(category)`
  - `useBookingStore.addService(service)`

- **Navigation Logic:**
  - Jika user select 1 service standar → langsung ke "stylist"
  - Jika ada multiple services atau special request → ke "service-detail"

---

### **Step 2: Service Details (StepServiceDetail.tsx) [OPTIONAL]**

**Purpose:** Input detail custom untuk layanan (jika diperlukan)

- **UI Components:**

  - Form fields untuk detail request (panjang rambut, warna, treatment, dll)
  - Upload photos/reference
  - Duration calculator
  - Notes field untuk request khusus
  - Back & Next buttons

- **Data Captured:**

  - `formAnswers`: Jawaban dari questionnaire
  - Duration adjustments
  - Attachment/images

- **State Updates:**

  - `useBookingStore.setFormAnswers(answers)`

- **Navigation:**
  - Back → "services"
  - Next → "stylist"

---

### **Step 3: Choose Stylist & Date/Time (StepStylist.tsx)**

**Purpose:** Customer pilih stylist dan jadwal appointment

- **UI Components:**

  - Calendar picker untuk memilih tanggal
  - Available time slots (berdasarkan stylist schedule)
  - Stylist grid/list dengan foto, rating, specialization
  - Countdown timer (jika ada limited time offer)
  - Slot selection dengan status (available/booked)

- **Data Captured:**

  - `date`: Tanggal appointment (YYYY-MM-DD)
  - `stylist`: ID & nama stylist yang dipilih
  - `timeSlot`: Jam appointment (HH:MM format)
  - Duration validation vs stylist availability

- **State Updates:**

  - `useBookingStore.setDate(date)`
  - `useBookingStore.setStylist(stylist)`
  - `useBookingStore.setTimeSlot(timeSlot)`

- **Validations:**

  - Cek conflict dengan booking lain
  - Validasi business hours
  - Minimum advance booking time

- **Navigation:**
  - Back → "services"
  - Next → "confirm"

---

### **Step 4: Confirm Booking (StepConfirm.tsx)**

**Purpose:** Review semua detail sebelum lanjut ke payment

- **UI Components:**

  - Summary lengkap (service, stylist, date, time, price)
  - Breakdown harga (service + addons + tax)
  - Option untuk add-ons (produk, extra treatment)
  - Promo code input field
  - Edit buttons untuk setiap section

- **Data Captured:**

  - `addons`: Optional products/services tambahan
  - `promoCode`: Discount code jika ada
  - `discountAmount`: Calculated discount

- **Calculations:**

  - Total price calculation dengan add-ons
  - Promo code validation
  - Tax calculation (jika applicable)

- **State Updates:**

  - `useBookingStore.addAddon(product)`
  - `useBookingStore.setPromoCode(code, discount)`

- **Navigation:**
  - Edit buttons → kembali ke step sebelumnya
  - Next → "contact"

---

### **Step 5: Contact Information (StepContact.tsx)**

**Purpose:** Kumpulkan data kontak customer

- **UI Components:**

  - Name input field
  - Phone number input (with formatting)
  - Form validation real-time
  - Optional: Email field
  - Terms & conditions checkbox

- **Data Captured:**

  - `customerName`: Full name
  - `customerPhone`: Phone number (dengan format Indonesia)
  - Contact validation

- **State Updates:**

  - `useBookingStore.setContact(name, phone)`

- **Validations:**

  - Name minimum 2 characters
  - Phone format validation (diawali 0 atau +62)
  - Phone length validation

- **Navigation:**
  - Back → "confirm"
  - Next → "payment"

---

### **Step 6: Payment Method (StepPayment.tsx)**

**Purpose:** Pilih metode pembayaran dan jenis pembayaran

- **UI Components:**

  - Payment method options (Transfer Bank, e-Wallet, Cash, Credit Card)
  - Payment type selector (FULL vs DEPOSIT)
  - Proof of payment upload (jika transfer)
  - Countdown for payment deadline
  - Amount display

- **Data Captured:**

  - `paymentType`: "FULL" atau "DEPOSIT"
  - `proofImageUrl`: Bukti transfer (jika diperlukan)

- **Calculations:**

  - Deposit amount = 30-50% dari total (configurable)
  - Remaining amount after deposit

- **State Updates:**

  - `useBookingStore.setPaymentType(type)`
  - `useBookingStore.setProofImage(url)`

- **Validations:**

  - Proof image required untuk transfer
  - File format & size validation
  - Payment amount validation

- **Navigation:**
  - Back → "contact"
  - Next → "ticket" (after payment confirmation/verification)

---

### **Step 7: Booking Confirmation Ticket (StepTicket.tsx)**

**Purpose:** Tampilkan booking confirmation dengan QR code untuk check-in

- **UI Components:**

  - **DigitalTicket Component:**
    - Salon header (nama, logo)
    - Service details (nama service, stylist, duration)
    - Booking information (ID, PIN, date, time)
    - Total price breakdown
    - QR code untuk check-in (contains: `rara-beauty:{bookingCode}:{pin}`)
    - Check-in instructions
  - **Controls:**
    - Download ticket button (generates PNG)
    - Share ticket option
    - Complete/Done button

- **Data Displayed:**

  - Semua data yang sudah dikumpulkan dari step 1-6
  - Auto-generated `bookingCode` (format: RB-MMDD-XXXX)
  - Auto-generated `pin` (4 digit random)
  - `bookingStatus`: "CONFIRMED"

- **Features:**

  - Generate QR code canvas dari `qrcode` library
  - Download ticket sebagai PNG (canvas to blob conversion)
  - Display DigitalTicket untuk preview
  - Countdown timer (optional, untuk show urgency)

- **State Updates:**

  - `useBookingStore.confirmBooking()`
  - `useBookingStore.completeBooking()`

- **Post-Booking:**
  - Show farewell screen dengan salon policies
  - Reset booking state untuk booking baru
  - Redirect ke home atau booking list

---

## 📊 State Structure (Zustand Store)

```typescript
interface BookingState {
  // Navigation
  step: number;

  // Service Selection
  category: Category | null;
  services: Service[];
  formAnswers: FormAnswers | null;

  // Stylist & Schedule
  date: string | null;
  stylist: Stylist | null;
  timeSlot: string | null;

  // Addons & Promos
  addons: SelectedAddon[];
  promoCode: string | null;
  discountAmount: number;

  // Customer Info
  customerName: string | null;
  customerPhone: string | null;

  // Payment
  paymentType: PaymentType; // "FULL" | "DEPOSIT"
  proofImageUrl: string | null;

  // Booking Status
  bookingStatus: BookingStatus; // "DRAFT" | "PENDING" | "CONFIRMED" | "COMPLETED"
  bookingCode: string | null; // RB-MMDD-XXXX
  pin: string | null; // 4 digit

  // Computed Properties
  totalPrice: number;
  depositAmount: number;
  totalDuration: number;
}
```

---

## 🎯 Key Features

### **Booking Summary Panel**

- Menampilkan di sisi kanan (desktop) atau bottom (mobile)
- Real-time update setiap ada perubahan data
- Sticky positioning
- Countdown timer untuk limited offers
- Summary items breakdown

### **Navigation Logic**

- Linear flow dengan conditional branching (Step 2 optional)
- Back button selalu enabled (kecuali step 1)
- Direct editing dari any step

### **Data Persistence**

- Zustand store dengan persist middleware
- LocalStorage backup (`STORAGE_KEY: "booking-session"`)
- Auto-resume jika browser ditutup

### **Validations**

- Real-time field validation
- Step-level validation sebelum proceed
- Conflict checking (time slots)
- Payment verification

### **QR Code & Download**

- `qrcode` library untuk generate QR
- Canvas rendering untuk ticket PNG
- Fallback untuk browser tanpa canvas support

---

## 📱 Responsive Design

- **Desktop:** 2-column layout (step form + summary)
- **Tablet:** Stacked layout dengan floating summary
- **Mobile:** Full-width form, summary di bottom

---

## 🔗 File Structure

```
apps/customer/src/
├── app/book/[slug]/
│   ├── page.tsx                      # Main booking router
│   └── _steps/
│       ├── StepServices.tsx
│       ├── StepServiceDetail.tsx
│       ├── StepStylist.tsx
│       ├── StepConfirm.tsx
│       ├── StepContact.tsx
│       ├── StepPayment.tsx
│       └── StepTicket.tsx
├── features/booking/
│   ├── hooks/
│   │   └── use-booking-store.ts      # Zustand store
│   ├── types/
│   │   └── booking.types.ts          # TypeScript interfaces
│   ├── components/
│   │   ├── digital-ticket/
│   │   │   ├── DigitalTicket.tsx
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   └── TicketDivider.tsx
│   │   ├── booking-summary/
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── SummaryItem.tsx
│   │   │   └── CountdownTimer.tsx
│   │   └── ... (other components)
│   └── lib/
│       └── price-calculator.ts
└── shared/
    └── lib/
        ├── cn.ts                    # classNames utility
        └── format.ts                # Date/number formatting
```

---

## 💾 Booking Code & PIN Generation

- **Booking Code Format:** `RB-{MMDD}-{XXXX}`

  - RB = Rara Beauty prefix
  - MMDD = Month + Day (e.g., 0531 untuk May 31)
  - XXXX = Random 4-digit number

- **PIN Format:** 4-digit random number (0000-9999)

---

## 🎨 UI/UX Highlights

1. **Progress Indicator:** Show current step (1/7, 2/7, etc.)
2. **Error Handling:** Clear error messages & recovery options
3. **Loading States:** Spinners saat fetch data stylist/availabilty
4. **Animations:** Smooth transitions between steps
5. **Mobile-first:** Touch-friendly buttons & inputs
6. **Accessibility:** Proper labels, ARIA attributes, keyboard navigation

---

## 📋 Testing Checklist

- [ ] All 7 steps render correctly
- [ ] Navigation forward & backward works
- [ ] State persists across page refresh
- [ ] QR code generates correctly
- [ ] Ticket downloads as PNG
- [ ] Responsive pada mobile/tablet/desktop
- [ ] Form validations trigger
- [ ] Promo code calculation works
- [ ] Payment method selection works
- [ ] Booking code & PIN unique

---

## 🚀 Future Enhancements

1. **Email confirmation** setelah Step 7
2. **SMS reminder** sebelum appointment
3. **Rescheduling flow** untuk existing bookings
4. **Multi-language support** (ID/EN)
5. **Payment gateway integration** (Midtrans, Xendit)
6. **Waitlist feature** jika slot penuh
7. **Loyalty points** pada completion
