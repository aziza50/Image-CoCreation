"use client";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { bacasime } from "../styles/fonts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setOnboarding } from "./set-onboarding";

function DragDropFiles() {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const router = useRouter();
  const [session, setSession] = React.useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const get_session = async () => {
      const data = await supabase.auth.getSession();
      setSession(data?.data?.session);
    };

    get_session();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrors([]);
    acceptedFiles.forEach((file) => {
      setUploadedFiles((prev) => [...prev, file]);
    });
  }, []);

  const { isDragActive, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      maxFiles: 5,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      /* call onDrop every time a file is dropped */
      onDrop,
    });

  const rejectionErrors = fileRejections.flatMap(({ file, errors }) =>
    errors.map((e) => `File ${file.name} rejected: ${e.message}`),
  );

  const onUpload = async (): Promise<void> => {
    if (uploadedFiles.length === 0) {
      return;
    }
    setUploading(true);
    // Send it to the backend '/api/onboard' route
    try {
      if (!session) {
        setErrors(["User not authenticated. Please log in again."]);
        return;
      }
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("http://localhost:8000/extract-features/", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      if (result) {
        alert("File uploaded successfully!");
        setUploadedFiles([]);
        try {
          const onboardingResult = await setOnboarding();
          if (!onboardingResult.success) {
            console.error(
              "Onboarding update failed:",
              onboardingResult.message,
            );
          }
        } catch (error) {
          console.error("Error during onboarding update:", error);
        }
        router.push("/");
      } else {
        console.log(result.error);
        setErrors(["Failed to upload file."]);
      }
    } catch (error) {
      {
        setErrors(["Failed to upload file."]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white rounded-lg h-90 w-96 flex flex-col items-center justify-center gap-4">
        {/* Drop Feature Here! */}
        <div
          {...getRootProps({ className: "dropzone" })}
          className="flex items-center justify-center border-dashed border-2 border-black h-60 w-80 rounded-lg  cursor-pointer"
        >
          <input {...getInputProps()}></input>
          {uploadedFiles.length > 0 ? (
            <div className="w-80 h-60 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 gap-2 p-2">
                {uploadedFiles.map((file) => (
                  <div key={file.name} className="flex flex-row text-start ">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={60}
                      height={60}
                      className="rounded"
                    />
                    <p className="ml-4 text-sm text-muted-foreground">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`text-center m-10 text-xl font-light ${bacasime.className}`}
            >
              {isDragActive ? "Drop it!" : "Drag and drop artwork here"}
            </div>
          )}
        </div>

        {/* Errors */}
        {rejectionErrors.length > 0 && (
          <ul className="text-red-500 text-sm w-80">
            {rejectionErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {errors.length > 0 && (
          <ul className="text-red-500 text-sm w-80">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        {/* Upload button */}
        <button
          className={`rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50 ${bacasime.className}`}
          onClick={onUpload}
          disabled={uploadedFiles.length === 0 || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default DragDropFiles;
