"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { StepConfirm } from "./_steps/StepConfirm";
import { StepContact } from "./_steps/StepContact";
import { StepDateTime } from "./_steps/StepDateTime";
import { StepPayment } from "./_steps/StepPayment";
import { StepServiceDetail } from "./_steps/StepServiceDetail";
import { StepServices } from "./_steps/StepServices";
import { StepStylist } from "./_steps/StepStylist";
import { StepTicket } from "./_steps/StepTicket";

type Step =
  | "services"
  | "service-detail"
  | "stylist"
  | "datetime"
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
          onNext={() => setStep("datetime")}
          onBack={() => setStep("services")}
        />
      );
    case "datetime":
      return (
        <StepDateTime
          onNext={() => setStep("confirm")}
          onBack={() => setStep("stylist")}
        />
      );
    case "confirm":
      return (
        <StepConfirm
          onNext={() => setStep("contact")}
          onBack={() => setStep("datetime")}
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
