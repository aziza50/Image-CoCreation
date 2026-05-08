"use client";
import React, { useEffect } from "react";
import SideBar from "@/components/side-bar";
import DragDrop from "@/components/drag-drop";
import { getOrCreateUserProject, updateUserProject } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { arizonia } from "@/styles/fonts";
import { toast } from "sonner";

interface project {
  id: string;
  name: string;
  created_at: string;
}

export default function Home() {
  //I need to check if user has a project first, if not, I'll create it
  const [userId, setUserId] = React.useState<string | null>(null);
  const [project, setProject] = React.useState<project | null>(null);
  const [artTitle, setArtTitle] = React.useState("Untitled Artwork");
  const supabase = createClient();
  const [currentTool, setCurrentTool] = React.useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    async function getUserProject(user_id: string) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user ID:", error);
        router.push("/auth/login");
        return;
      }

      const userIdRetrieved = user?.id;
      if (!userIdRetrieved) {
        router.push("/auth/login");
        return;
      }
      setUserId(userIdRetrieved?.toString() || null);

      const response = await getOrCreateUserProject(userIdRetrieved.toString());
      if (!response.success) {
        toast.error("Error fetching or creating user project");
        return;
      }
      setProject(response.data as unknown as project);
      setArtTitle(response.data?.name || "Untitled Artwork");
    }
    getUserProject(userId || "");
  }, [router, supabase, userId]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setArtTitle(e.target.value);
    if (project) {
      updateUserProject(project.id, e.target.value);
    }
  }

  function handleToolChange(tool: string) {
    setCurrentTool(tool);
  }

  return (
    <div>
      <div>
        <input
          value={artTitle}
          onChange={(e) => setArtTitle(e.target.value)}
          onBlur={handleTitleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTitleChange(
                e as unknown as React.ChangeEvent<HTMLInputElement>,
              );
            }
          }}
          className={`p-2 text-2xl font-bold ${arizonia.className}`}
        ></input>
      </div>
      <SideBar onActionClick={handleToolChange} activeAction={currentTool} />
      <DragDrop isLasso={currentTool === "Lasso Select"} />
    </div>
  );
}
