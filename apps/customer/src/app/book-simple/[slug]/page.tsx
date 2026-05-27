"use client";

import { BookingForm } from "@/components/booking/BookingForm";

interface BookingPageProps {
  params: { slug: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  // Real salon ID from Supabase
  const salon = {
    id: "4d8de2a8-b965-4802-85f1-db9ae703da8e",
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
