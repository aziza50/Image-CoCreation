"use client";
import React, { use, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { bacasime } from "../styles/fonts";
import { toast } from "sonner";
import { createArtwork, getUserArtwork } from "@/src/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import Lasso from "./lasso";
import Image from "next/image";
interface artwork {
  id: string;
  s3_url: string;
  s3_key: string;
  updated_at: string;
}
function DragDrop({ isLasso }: { isLasso: boolean }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dataURL, setDataURL] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploaded, setUploaded] = React.useState(false);
  const [artwork, setArtwork] = React.useState<artwork | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  useEffect(() => {
    async function fetchUserId() {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user ID:", error);
        return;
      }

      const userIdRetrieved = user?.id;
      if (!userIdRetrieved) {
        return;
      }
      setUserId(userIdRetrieved?.toString() || null);
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    //check if user already has an artwork
    async function fetchUserArtwork(user_id: string) {
      const response = await getUserArtwork(user_id);
      if (response.success) {
        setArtwork(response.data as unknown as artwork);
        setDataURL(response.data.s3_url);
        setUploaded(true);
      } else {
        toast.error("Failed to fetch user artwork.");
      }
    }
    if (userId) {
      fetchUserArtwork(userId);
    }
  }, [userId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0] ? acceptedFiles[0] : null);
  }, []);

  async function createArtworkTable(s3_url: string, s3_key: string) {
    const response = await createArtwork(userId || "", s3_url, s3_key);
    if (response.success) {
      setArtwork(response.data as unknown as artwork);
    } else {
      toast.error("Failed to create artwork record in database.");
    }
  }

  const onUpload = async (): Promise<void> => {
    if (file) {
      setUploading(true);
      // Send it to the backend '/api/upload' route
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          toast.success("File uploaded successfully!");
          setDataURL(result.url);
          createArtworkTable(result.url, result.key);
          setUploaded(true);
        } else {
          toast.error("Failed to upload file.");
        }
      } catch (error) {
        {
          toast.error("Failed to upload file.");
        }
      } finally {
        setUploading(false);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (uploaded && dataURL) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative inline-block">
          <img
            ref={imgRef}
            src={dataURL}
            alt="Uploaded artwork"
            className="rounded-lg object-contain shadow-lg"
            crossOrigin="anonymous"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              width: "auto",
              height: "auto",
              display: "block",
            }}
          />
          {isLasso && imgRef.current?.complete && (
            <Lasso
              imageRef={imgRef}
              onMask={(blob) => {
                console.log("Mask received in parent:", blob);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white shadow-sm rounded-lg h-90 w-96 flex flex-col items-center justify-center gap-4">
        {/* Drop Feature Here! */}
        <div
          {...getRootProps({ className: "dropzone" })}
          className="flex items-center justify-center border-dashed border-2 border-black h-60 w-80 rounded-lg  cursor-pointer"
        >
          <input {...getInputProps()}></input>
          {dataURL ? (
            <Image
              src={dataURL}
              alt="Uploaded artwork"
              width={300}
              height={300}
              className="rounded-lg object-contain"
            ></Image>
          ) : (
            <div
              className={`text-center m-10 text-xl font-light ${bacasime.className}`}
            >
              Drag and Drop Artwork here!
            </div>
          )}
        </div>

        {/* Upload Button Here! */}
        <div>
          <button
            className={`rounded-lg bg-black text-white px-4 justify-items-center py-2  ${bacasime.className}`}
            onClick={onUpload}
            disabled={uploading ? true : false}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
export default DragDrop;
