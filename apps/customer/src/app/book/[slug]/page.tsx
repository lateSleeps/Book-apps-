"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { StepConfirm } from "./_steps/StepConfirm";
import { StepContact } from "./_steps/StepContact";
import { StepPayment } from "./_steps/StepPayment";
import { StepServiceDetail } from "./_steps/StepServiceDetail";
import { StepServices } from "./_steps/StepServices";
import { StepStylist } from "./_steps/StepStylist";
import { StepTicket } from "./_steps/StepTicket";

type Step =
  | "services"
  | "service-detail"
  | "stylist"
  | "confirm"
  | "contact"
  | "payment"
  | "ticket";

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [step, setStep] = useState<Step>("services");

  switch (step) {
    case "services":
      return (
        <StepServices
          slug={slug}
          onNext={(needsDetail) =>
            setStep(needsDetail ? "service-detail" : "stylist")
          }
        />
      );
    case "service-detail":
      return (
        <StepServiceDetail
          onNext={() => setStep("stylist")}
          onBack={() => setStep("services")}
        />
      );
    case "stylist":
      return (
        <StepStylist
          slug={slug}
          onNext={() => setStep("confirm")}
          onBack={() => setStep("services")}
        />
      );
    case "confirm":
      return (
        <StepConfirm
          onNext={() => setStep("contact")}
          onBack={() => setStep("stylist")}
        />
      );
    case "contact":
      return <StepContact onNext={() => setStep("payment")} />;
    case "payment":
      return (
        <StepPayment
          onNext={() => setStep("ticket")}
          onBack={() => setStep("contact")}
        />
      );
    case "ticket":
      return <StepTicket onDone={() => setStep("services")} />;
  }
}
