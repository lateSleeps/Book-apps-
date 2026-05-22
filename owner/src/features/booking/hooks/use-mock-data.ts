'use client';

import type { Category, Product, Service, Stylist, TimeSlot } from '../types/booking.types';
import { SESSION_TIMES } from '../constants/booking.constants';

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Hair',
    description: 'Haircut, wash, styling & braiding',
    color: 'bg-c-peach',
    blobColor: '#f5c4ab',
    icon: '✂️',
  },
  {
    id: 'cat-2',
    name: 'Colour & Treatment',
    description: 'Colouring, keratin & hair spa',
    color: 'bg-c-blue',
    blobColor: '#b8d6f0',
    icon: '🎨',
  },
  {
    id: 'cat-3',
    name: 'Face & Lashes',
    description: 'Facial, make up & lash extensions',
    color: 'bg-c-mint',
    blobColor: '#a8e6d4',
    icon: '💆',
  },
  {
    id: 'cat-4',
    name: 'Massage',
    description: 'Full body, reflexology & scrub',
    color: 'bg-c-yellow',
    blobColor: '#f5d98a',
    icon: '🪷',
  },
  {
    id: 'cat-5',
    name: 'Nail',
    description: 'Manicure, pedicure & nail art',
    color: 'bg-c-lilac',
    blobColor: '#c8bef0',
    icon: '💅',
  },
];

// ── Services ──────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  // ── Hair (STYLING_HAIR) ──
  { id: 'svc-1',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Ladies Haircut + Wash',         description: 'Dapatkan potongan presisi yang disesuaikan dengan bentuk wajah dan tekstur rambutmu, dilengkapi keramas menggunakan produk premium untuk hasil yang bersih dan segar.',                                          price: 180_000, duration: 45 },
  { id: 'svc-2',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Men Haircut + Wash + Dry',       description: 'Potongan rapi dan modern untuk pria, diakhiri dengan keramas dan blow-dry agar penampilanmu tetap fresh sepanjang hari.',                                                                                          price: 150_000, duration: 40 },
  { id: 'svc-3',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Hair Trim (Incl. Wash)',         description: 'Rapikan ujung rambut yang bercabang dan kembalikan bentuk potonganmu tanpa mengubah panjang secara signifikan. Termasuk keramas.',                                                                                   price: 120_000, duration: 30 },
  { id: 'svc-4',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Fringe Trim',                   description: 'Rapikan poni yang terlalu panjang agar tetap bingkai wajah dengan sempurna. Cepat, presisi, dan tanpa drama.',                                                                                                     price:  80_000, duration: 15 },
  { id: 'svc-5',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Beard Trim',                    description: 'Bentuk dan rapikan jenggotmu agar selalu terlihat groomed dan rapi. Cocok untuk tampilan kasual maupun profesional.',                                                                                               price:  90_000, duration: 20 },
  { id: 'svc-6',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Ladies Hair Wash + Styling',    description: 'Keramas bersih dengan kondisioner ekstra lembut, lalu di-styling dengan blow-dry dan finishing untuk tampilan yang polished dan tahan lama.',                                                                       price: 150_000, duration: 45 },
  { id: 'svc-7',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Hair Braiding Simple',          description: 'Kepang simpel yang elegan — cocok untuk aktivitas sehari-hari maupun acara casual. Rapi, kuat, dan nyaman dipakai seharian.',                                                                                       price: 100_000, duration: 30 },
  { id: 'svc-8',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Full Braiding',                 description: 'Kepang menyeluruh di seluruh rambut dengan teknik yang teliti dan rapi. Tampil bold dan percaya diri untuk acara spesial maupun sehari-hari.',                                                                       price: 250_000, duration: 90 },
  { id: 'svc-9',  categoryId: 'cat-1', serviceFlow: 'STYLING_HAIR', name: 'Balinese Creambath',            description: 'Ritual perawatan rambut khas Bali menggunakan krim herbal yang menutrisi dari akar hingga ujung, dilengkapi pijat kepala, leher, dan bahu yang menenangkan.',                                                        price: 200_000, duration: 60 },

  // ── Colour & Treatment ──
  { id: 'svc-10', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Root Colour',                   description: 'Tutup akar rambut yang mulai terlihat dan kembalikan warna yang merata dan segar. Solusi cepat agar rambut selalu tampak terawat.',                                                                                  price: 300_000, duration: 60 },
  { id: 'svc-11', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Basic Full Colour',             description: 'Transformasi warna menyeluruh dengan satu warna pilihan. Formulasi cat premium menjaga rambut tetap sehat, berkilau, dan warna tahan lama.',                                                                         price: 450_000, duration: 90 },
  { id: 'svc-12', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Balayage',                      description: 'Teknik pewarnaan tangan bebas yang menghasilkan gradasi natural seperti terkena sinar matahari. Efek dimensional yang cantik dan tidak perlu touch-up terlalu sering.',                                              price: 750_000, duration: 150 },
  { id: 'svc-13', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Full Highlight',                description: 'Highlight foil menyeluruh yang menambah dimensi, cahaya, dan kedalaman warna pada rambutmu. Hasil dramatis namun tetap natural.',                                                                                    price: 650_000, duration: 120 },
  { id: 'svc-14', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Money Piece',                   description: 'Highlight di sekitar wajah yang langsung memberikan efek glowing dan cerah. Teknik cepat dengan dampak visual yang besar.',                                                                                          price: 350_000, duration: 60 },
  { id: 'svc-15', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Bleaching',                     description: 'Proses lightening rambut yang dikerjakan dengan hati-hati untuk mempersiapkan warna vivid atau pastel impianmu. Hasil cerah maksimal dengan meminimalkan kerusakan.',                                               price: 500_000, duration: 90 },
  { id: 'svc-16', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Keratin Hair Treatment',        description: 'Treatment keratin premium Alfaparf Milano yang menghaluskan kutikula rambut, melawan frizz, dan memberikan kilau luar biasa. Efek lurus semi-permanen hingga 3–5 bulan.',                                           price: 1_300_000, duration: 180 },
  { id: 'svc-17', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Smoothing Treatment',           description: 'Luruskan dan haluskan rambut secara semi-permanen dengan formula yang meresap ke dalam serat rambut. Rambut lebih mudah diatur dan bebas frizz hingga berbulan-bulan.',                                             price: 800_000, duration: 150 },
  { id: 'svc-18', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Classic Perm',                  description: 'Ciptakan gelombang atau keriting yang tahan lama dengan teknik perm klasik. Tambahkan volume dan tekstur pada rambut lurus yang ingin tampil berbeda.',                                                             price: 600_000, duration: 120 },
  { id: 'svc-19', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Hair Spa (Short)',              description: 'Perawatan spa intensif untuk rambut pendek yang kehilangan kelembapan dan kilau. Nutrisi mendalam dari luar dan dalam untuk rambut yang kembali sehat.',                                                             price: 150_000, duration: 45 },
  { id: 'svc-20', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Hair Spa (Medium–Long)',        description: 'Spa rambut menyeluruh untuk panjang medium hingga panjang. Formula kaya nutrisi meresap dalam-dalam untuk memulihkan kelembapan dan elastisitas rambut.',                                                            price: 200_000, duration: 60 },
  { id: 'svc-21', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Hair Mask (Short)',             description: 'Masker kondisioner intensif untuk rambut pendek yang butuh dorongan hidrasi ekstra. Rambut lebih lembut, lebih mudah diatur, dan lebih berkilau.',                                                                  price: 120_000, duration: 30 },
  { id: 'svc-22', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Hair Mask (Medium–Long)',       description: 'Masker reparasi mendalam untuk rambut medium hingga panjang yang rusak atau kering. Pulihkan kekuatan dan kelembapan rambut dari akar ke ujung.',                                                                    price: 160_000, duration: 45 },
  { id: 'svc-23', categoryId: 'cat-2', serviceFlow: 'STYLING_COLOUR', name: 'Ice Scrub Scalp Ritual',        description: 'Ritual signature kami — eksfoliasi kulit kepala dengan scrub berformula pendingin untuk membersihkan pori, mengurangi ketombe, dan menstimulasi pertumbuhan rambut baru.',                                           price: 250_000, duration: 60 },

  // ── Face & Lashes ──
  { id: 'svc-24', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Classic Facial',                description: 'Facial pembersihan mendalam yang mengangkat kotoran, minyak, dan sel kulit mati, dilanjutkan dengan hidrasi intensif agar kulit tampak cerah dan segar sepanjang hari.',                                           price: 250_000, duration: 60 },
  { id: 'svc-25', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Facial Detox',                  description: 'Detoksifikasi kulit dari paparan polusi dan radikal bebas sehari-hari. Formulasi aktif membersihkan pori secara mendalam dan mengembalikan keseimbangan kulit.',                                                     price: 300_000, duration: 75 },
  { id: 'svc-26', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Totok Wajah',                   description: 'Pijat wajah tradisional Jawa yang merangsang titik akupresur untuk melancarkan sirkulasi, mengencangkan otot wajah, dan memberikan efek glow alami tanpa jarum.',                                                   price: 200_000, duration: 45 },
  { id: 'svc-27', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Make Up',                       description: 'Tampil memukau di setiap kesempatan dengan aplikasi makeup profesional. Dari tampilan natural sehari-hari hingga bold glam untuk acara spesial — sesuai keinginanmu.',                                              price: 350_000, duration: 60 },
  { id: 'svc-28', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Make Up + Hair Do',             description: 'Paket lengkap glam — makeup profesional plus penataan rambut cantik dalam satu sesi. Tampil sempurna dari ujung rambut hingga ujung kaki untuk momen istimewa.',                                                    price: 600_000, duration: 120 },
  { id: 'svc-29', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Natural Lash Extensions',       description: 'Ekstensi bulu mata ringan yang memperpanjang dan memperindah matamu secara natural. Tidak terasa berat, nyaman dipakai, dan tahan hingga 3–4 minggu.',                                                              price: 280_000, duration: 75 },
  { id: 'svc-30', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Volume Lash Extensions',        description: 'Set bulu mata volume penuh untuk tampilan dramatis dan memukau. Teknik multi-lash memberikan efek tebal dan lebat yang sempurna untuk kamu yang suka tampil bold.',                                                  price: 380_000, duration: 90 },
  { id: 'svc-31', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Lash Lift + Tint',             description: 'Angkat dan gelapkan bulu matamu sendiri tanpa ekstensi. Efek mata lebih besar dan ekspresif yang tahan hingga 6–8 minggu — bangun tidur langsung cantik.',                                                          price: 320_000, duration: 60 },
  { id: 'svc-32', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Eyebrow Tint + Shaping',       description: 'Definisikan alis dengan pewarnaan dan pembentukan presisi menggunakan wax. Alis lebih tegas, rapi, dan frame wajahmu dengan sempurna.',                                                                              price: 180_000, duration: 30 },
  { id: 'svc-33', categoryId: 'cat-3', serviceFlow: 'TREATMENT', name: 'Refill Lash Extensions',       description: 'Isi kembali bulu mata ekstensi yang mulai rontok agar tetap penuh dan sempurna. Direkomendasikan setiap 2–3 minggu untuk hasil optimal.',                                                                            price: 200_000, duration: 45 },

  // ── Massage ──
  { id: 'svc-34', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Full Body Massage',             description: 'Lepaskan ketegangan otot dan kelelahan dengan pijat seluruh tubuh menggunakan teknik relaksasi yang menenangkan. Tubuh segar, pikiran jernih, dan tidur lebih berkualitas.',                                        price: 250_000, duration: 60 },
  { id: 'svc-35', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Full Body Massage + Scrub',     description: 'Kombinasi pijat relaksasi dan eksfoliasi tubuh menyeluruh untuk kulit yang glowing dan halus. Angkat sel kulit mati sekaligus manjakan otot yang tegang dalam satu sesi.',                                          price: 380_000, duration: 90 },
  { id: 'svc-36', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Stone Massage',                 description: 'Batu vulkanik panas diletakkan di titik-titik ketegangan tubuh untuk merelaksasi otot secara mendalam. Sensasi hangat yang menenangkan dan memulihkan energi.',                                                      price: 320_000, duration: 60 },
  { id: 'svc-37', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Reflexology (30 min)',          description: 'Pijat refleksi kaki yang merangsang titik-titik saraf yang terhubung dengan organ tubuh. Tingkatkan sirkulasi dan rasakan relaksasi menyeluruh dalam waktu singkat.',                                               price: 150_000, duration: 30 },
  { id: 'svc-38', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Reflexology (60 min)',          description: 'Sesi refleksi kaki yang lebih panjang dan mendalam untuk pemulihan total. Ideal setelah seharian berdiri atau beraktivitas intens.',                                                                                 price: 250_000, duration: 60 },
  { id: 'svc-39', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Back Massage (30 min)',         description: 'Fokus pada punggung, bahu, dan leher — area paling sering tegang akibat duduk lama atau stres. Redakan nyeri dan kembalikan postur tubuh yang nyaman.',                                                             price: 180_000, duration: 30 },
  { id: 'svc-40', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Head Massage',                  description: 'Pijat kepala dan kulit kepala yang menstimulasi aliran darah, meredakan sakit kepala, dan membantu kamu rileks total. Sempurna di sela hari yang panjang.',                                                         price: 120_000, duration: 30 },
  { id: 'svc-41', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Body Scrub',                    description: 'Eksfoliasi seluruh tubuh menggunakan scrub berbahan alami untuk mengangkat sel kulit mati dan membuka pori. Hasilnya? Kulit lebih halus, cerah, dan siap menyerap pelembap.',                                       price: 220_000, duration: 45 },
  { id: 'svc-42', categoryId: 'cat-4', serviceFlow: 'TREATMENT', name: 'Ear Candle',                    description: 'Terapi lilin telinga yang lembut untuk membersihkan kotoran dan tekanan di saluran telinga. Dikenal membantu meredakan migrain, tinnitus, dan memberikan ketenangan mendalam.',                                     price: 100_000, duration: 30 },

  // ── Nail ──
  { id: 'svc-43', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Manicure Express',              description: 'Bersihkan, kikir, dan poles kuku tangan dalam waktu singkat. Solusi cepat agar tangan selalu terlihat rapi dan terawat meski jadwal padat.',                                                                        price: 100_000, duration: 30 },
  { id: 'svc-44', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Manicure Spa',                  description: 'Perawatan kuku tangan lengkap dengan merendam tangan di air hangat beraroma, eksfoliasi lembut, pijat tangan yang menenangkan, dan finishing cat kuku pilihan.',                                                    price: 180_000, duration: 60 },
  { id: 'svc-45', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Pedicure Express',              description: 'Perawatan kuku kaki cepat dan efisien — bersih, rapi, dan segar. Kaki terawat tanpa harus menyisihkan waktu lama.',                                                                                                  price: 120_000, duration: 30 },
  { id: 'svc-46', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Signature Pedicure Spa',        description: 'Ritual kaki mewah kami — rendam kaki beraroma, scrub eksfoliasi, pijat betis dan telapak kaki, serta finishing cat kuku. Kaki halus, rileks, dan siap melangkah penuh percaya diri.',                               price: 220_000, duration: 75 },
  { id: 'svc-47', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Pedicure Spa Gel',              description: 'Semua kemewahan Signature Pedicure Spa ditambah aplikasi cat gel berkualitas tinggi yang tahan lama hingga 2–3 minggu. Kuku kaki tampil sempurna lebih lama.',                                                      price: 260_000, duration: 75 },
  { id: 'svc-48', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Nail Art',                      description: 'Ekspresikan dirimu lewat desain kuku kreatif dan unik oleh nail artist kami. Dari motif minimalis hingga detail intrikat — sesuaikan dengan mood dan gayamu.',                                                      price: 150_000, duration: 45 },
  { id: 'svc-49', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Basic Gel Polish',              description: 'Aplikasi cat gel warna pilihan yang mengering sempurna di bawah UV lamp. Hasil kilap, tidak mudah mengelupas, dan tahan hingga 2–3 minggu tanpa sentuhan ulang.',                                                   price: 180_000, duration: 45 },
  { id: 'svc-50', categoryId: 'cat-5', serviceFlow: 'STYLING_NAIL', name: 'Gel Removal',                   description: 'Lepas cat gel lama dengan teknik yang aman — tanpa merusak kuku alami. Proses hati-hati menggunakan remover khusus agar kuku tetap sehat dan kuat.',                                                                price:  80_000, duration: 20 },
];

// ── Stylists ──────────────────────────────────────────────────────────────────

/**
 * Generate seeded booked slots for a stylist (deterministic, based on stylist id).
 * Approximately 30% of slots are booked.
 */
function seededBookedSlots(stylistId: string): string[] {
  const allSlots = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const seed = stylistId.charCodeAt(stylistId.length - 1);
  return allSlots.filter((_, i) => (seed + i * 3) % 10 < 3);
}

const STYLISTS: Stylist[] = [
  {
    id: 'sty-1',
    name: 'Dewi Rahayu',
    specialty: 'Coloring & Highlight',
    avatarInitials: 'DR',
    avatarColor: '#ddedf8',
    bookedSlots: seededBookedSlots('sty-1'),
  },
  {
    id: 'sty-2',
    name: 'Sinta Wulandari',
    specialty: 'Perawatan & Keratin',
    avatarInitials: 'SW',
    avatarColor: '#d8f3ec',
  bookedSlots: seededBookedSlots('sty-2'),
  },
  {
    id: 'sty-3',
    name: 'Rina Kusuma',
    specialty: 'Potong & Styling',
    avatarInitials: 'RK',
    avatarColor: '#fde8dc',
    bookedSlots: seededBookedSlots('sty-3'),
  },
  {
    id: 'sty-4',
    name: 'Andi Pratama',
    specialty: 'Barbering & Perm',
    avatarInitials: 'AP',
    avatarColor: '#e8e2f8',
    bookedSlots: seededBookedSlots('sty-4'),
  },
];

// ── Products ──────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Makarizo Shampoo', description: 'Shampoo rambut sehat 200ml', price: 45_000, imageEmoji: '🧴' },
  { id: 'prod-2', name: "L'Oreal Conditioner", description: 'Kondisioner nutrisi intensif 175ml', price: 55_000, imageEmoji: '💧' },
  { id: 'prod-3', name: 'Gatsby Pomade', description: 'Pomade styling kuat tahan lama', price: 35_000, imageEmoji: '🪮' },
  { id: 'prod-4', name: 'TRESemmé Serum', description: 'Serum rambut anti-frizz 50ml', price: 65_000, imageEmoji: '✨' },
  { id: 'prod-5', name: 'Wella Hair Mask', description: 'Masker rambut moisture 150ml', price: 75_000, imageEmoji: '🌿' },
];

// ── Time Slots ────────────────────────────────────────────────────────────────

function buildTimeSlots(bookedSlots: string[]): TimeSlot[] {
  const allSlots: Array<{ time: string; session: TimeSlot['session'] }> = [
    ...SESSION_TIMES.PAGI.map((t) => ({ time: t, session: 'PAGI' as const })),
    ...SESSION_TIMES.SIANG.map((t) => ({ time: t, session: 'SIANG' as const })),
    ...SESSION_TIMES.SORE.map((t) => ({ time: t, session: 'SORE' as const })),
  ];

  return allSlots.map(({ time, session }) => ({
    time,
    session,
    available: !bookedSlots.includes(time),
  }));
}

// ── Unavailable services (all stylists fully booked for these) ────────────────
// Mock: Balayage, Keratin Treatment, Volume Lash Extensions, Stone Massage
const UNAVAILABLE_SERVICE_IDS = new Set(['svc-12', 'svc-16', 'svc-30', 'svc-36']);

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns all mock data for the booking flow.
 * In v2.0, swap these with API calls.
 */
export function useMockData() {
  return {
    categories: CATEGORIES,
    services: SERVICES,
    stylists: STYLISTS,
    products: PRODUCTS,
    getServicesByCategory: (categoryId: string) =>
      SERVICES.filter((s) => s.categoryId === categoryId),
    getTimeSlotsForStylist: (stylistId: string) => {
      const stylist = STYLISTS.find((s) => s.id === stylistId);
      return buildTimeSlots(stylist?.bookedSlots ?? []);
    },
    isServiceAvailable: (serviceId: string) =>
      !UNAVAILABLE_SERVICE_IDS.has(serviceId),
  };
}
