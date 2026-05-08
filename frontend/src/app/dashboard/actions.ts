"use server";
import { createClient } from "@/lib/supabase/server";

interface response {
  success: boolean;
  data: any;
}

export async function getUserProject(user_id: string) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("project")
    .select("*")
    .eq("id", user_id)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user project:", error);
    return { success: false, data: null };
  }
  return { success: true, data: project };
}

export async function createUserProject(user_id: string) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("project")
    .insert({ id: user_id });
  if (error) {
    console.error("Error creating user project:", error);
    return { success: false, data: null };
  }
  return { success: true, data: project };
}

export async function getOrCreateUserProject(user_id: string) {
  let userProject = await getUserProject(user_id);
  if (!userProject.data) {
    userProject = await createUserProject(user_id);
  }
  return { success: true, data: userProject.data };
}

export async function updateUserProject(user_id: string, name: string) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("project")
    .update({ name })
    .eq("id", user_id)
    .maybeSingle();
  if (error) {
    console.error("Error updating user project:", error);
    return { success: false, data: null };
  }
  return { success: true, data: project };
}

export async function createArtwork(
  user_id: string,
  s3_url: string,
  s3_key: string,
) {
  const supabase = await createClient();
  const { data: artwork, error } = await supabase
    .from("artwork")
    .insert({ id: user_id, s3_url, s3_key, updated_at: new Date() });
  if (error) {
    console.error("Error creating artwork:", error);
    return { success: false, data: null };
  }
  return { success: true, data: artwork };
}

const updateArtwork = async (
  artwork_id: number,
  s3_url: string,
  s3_key: string,
) => {
  const supabase = await createClient();
  const { data: artwork, error } = await supabase
    .from("artwork")
    .update({ s3_url, s3_key, updated_at: new Date() })
    .eq("id", artwork_id)
    .maybeSingle();
  if (error) {
    console.error("Error updating artwork:", error);
    return { success: false, data: null };
  }
  return { success: true, data: artwork };
};

export async function getUserArtwork(user_id: string) {
  const supabase = await createClient();
  const { data: artworks, error } = await supabase
    .from("artwork")
    .select("*")
    .eq("id", user_id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user artworks:", error);
    return { success: false, data: null };
  }
  return { success: true, data: artworks };
}

export async function deleteArtwork(artwork_id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artwork")
    .delete()
    .eq("id", artwork_id);
  if (error) {
    console.error("Error deleting artwork:", error);
    return { success: false, data: null };
  }
  return { success: true, data: data };
}
