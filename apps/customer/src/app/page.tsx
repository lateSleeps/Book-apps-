import { redirect } from "next/navigation";
import { SALON_SLUG } from "@/config/constants";

export default function Home() {
  redirect(`/book/${SALON_SLUG}`);
}
