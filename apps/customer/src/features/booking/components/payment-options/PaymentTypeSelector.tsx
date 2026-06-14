"use client";

import { useEffect, useMemo } from "react";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import type { PaymentType } from "@/features/booking/types/booking.types";
import { InlineNotice } from "@/shared/components/ui/InlineNotice";
import { SegmentedControl } from "@/shared/components/ui/segmented-control/SegmentedControl";

export function PaymentTypeSelector() {
  const { paymentType, setPaymentType, services } = useBookingStore();

  const isStyling = services[0]?.serviceFlow !== "TREATMENT";

  // Auto-select DEPOSIT for styling services
  useEffect(() => {
    if (isStyling && !paymentType) {
      setPaymentType("DEPOSIT");
    }
  }, [isStyling, paymentType, setPaymentType]);

  const segmentItems = useMemo(() => {
    const all = [
      { id: "DEPOSIT", label: "Deposit (DP)" },
      { id: "FULL", label: "Lunas" },
    ];
    return isStyling ? all.filter((o) => o.id === "DEPOSIT") : all;
  }, [isStyling]);

  return (
    <div className="space-y-s12">
      {/* Deposit informational notice — uses shared InlineNotice component */}
      {isStyling && (
        <InlineNotice
          variant="info"
          title="Pembayaran Deposit"
          description="Sisa pembayaran dilakukan langsung di salon."
        />
      )}

      {/* Payment method toggle — shared SegmentedControl, no custom styling */}
      {!isStyling && (
        <SegmentedControl
          fullWidth
          items={segmentItems}
          activeId={paymentType ?? ""}
          onChange={(id) => setPaymentType(id as PaymentType)}
        />
      )}
    </div>
  );
}
