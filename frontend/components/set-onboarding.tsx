"use server";

import { createClient } from "@/lib/supabase/server";

export async function setOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "User not found" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", user.id);
  if (updateError) {
    return { success: false, message: "Failed to update onboarding status" };
  }

  return { success: true, message: "Onboarding status updated successfully" };
}
