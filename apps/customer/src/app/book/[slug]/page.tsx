"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

import { StepConfirm } from "./_steps/StepConfirm";
import { StepContact } from "./_steps/StepContact";
import { StepPayment } from "./_steps/StepPayment";
import { StepServiceDetail } from "./_steps/StepServiceDetail";
import { StepServices } from "./_steps/StepServices";
import { StepStylist } from "./_steps/StepStylist";
import { StepTicket } from "./_steps/StepTicket";
import { PreviewContext } from "./preview-context";

type Step =
  | "services"
  | "service-detail"
  | "stylist"
  | "confirm"
  | "contact"
  | "payment"
  | "ticket";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "";
  const isPreview = searchParams?.get("preview") === "true";

  const [step, setStep] = useState<Step>("services");

  return (
    <PreviewContext.Provider value={isPreview}>
      {step === "services" && (
        <StepServices
          slug={slug}
          onNext={(needsDetail) =>
            setStep(needsDetail ? "service-detail" : "stylist")
          }
        />
      )}
      {step === "service-detail" && (
        <StepServiceDetail
          onNext={() => setStep("stylist")}
          onBack={() => setStep("services")}
        />
      )}
      {step === "stylist" && (
        <StepStylist
          slug={slug}
          onNext={() => setStep("confirm")}
          onBack={() => setStep("services")}
        />
      )}
      {step === "confirm" && (
        <StepConfirm
          onNext={() => setStep("contact")}
          onBack={() => setStep("stylist")}
        />
      )}
      {step === "contact" && <StepContact onNext={() => setStep("payment")} />}
      {step === "payment" && (
        <StepPayment
          slug={slug}
          onNext={() => setStep("ticket")}
          onBack={() => setStep("contact")}
        />
      )}
      {step === "ticket" && <StepTicket onDone={() => setStep("services")} />}
    </PreviewContext.Provider>
  );
}
