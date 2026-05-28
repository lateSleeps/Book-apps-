"use client";

import { BookingForm } from "@/components/booking/BookingForm";

interface BookingPageProps {
  params: { slug: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  // Real salon ID from Supabase
  const salon = {
    id: "5cdb0848-1b43-44f6-be29-b2ead49ff65a",
    name: "Rara Beauty Jakarta",
    slug: params.slug,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <BookingForm salonId={salon.id} salonName={salon.name} />
      </div>
    </div>
  );
}
