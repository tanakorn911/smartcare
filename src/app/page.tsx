import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LandingClient from "@/components/LandingClient";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "PATIENT") {
        redirect("/patient/dashboard");
      } else if (payload.role === "CAREGIVER") {
        redirect("/caregiver/dashboard");
      }
    } catch {
      // Invalid token, fall through to landing page
    }
  }

  // Not logged in or invalid token => Show Landing Page
  return <LandingClient />;
}
