"use server";
import { createClient } from "@/lib/supabase/server";

interface response {
  success: boolean;
  data: any;
}

export async function getUserStyle(user_id: string) {
  const supabase = await createClient();
  //need to cast user_id to uuid for the query to work
  const { data: userStyle, error } = await supabase
    .from("user_style")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user style:", error);
    return { success: false, data: null };
  }
  return { success: true, data: userStyle };
}
