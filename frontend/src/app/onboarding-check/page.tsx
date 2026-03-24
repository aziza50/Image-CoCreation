import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const OnboardingCheck = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
};

export default OnboardingCheck;
