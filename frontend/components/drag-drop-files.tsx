"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { bacasime } from "../styles/fonts";
import Image from "next/image";
import { read } from "fs";

interface UploadedFile {
  file: File;
  dataURL: string;
}

function DragDropFiles() {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrors([]);

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        setUploadedFiles((prev) => [
          ...prev,
          { file, dataURL: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const {
    isDragActive,
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
  } = useDropzone({
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
      const img_url_list = uploadedFiles.map((f) => f.dataURL);
      console.log("Uploading files:", img_url_list);
      const response = await fetch("http://localhost:8000/extract-features/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(img_url_list),
      });
      const result = await response.json();
      if (result.success) {
        alert("File uploaded successfully!");
        setUploadedFiles([]);
      } else {
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
      <div className="bg-white shadow-sm rounded-lg h-90 w-96 flex flex-col items-center justify-center gap-4">
        {/* Drop Feature Here! */}
        <div
          {...getRootProps({ className: "dropzone" })}
          className="flex items-center justify-center border-dashed border-2 border-black h-60 w-80 rounded-lg  cursor-pointer"
        >
          <input {...getInputProps()}></input>
          {uploadedFiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 p-2">
              {uploadedFiles.map(({ dataURL, file }) => (
                <Image
                  key={file.name}
                  src={dataURL}
                  alt={file.name}
                  width={80}
                  height={80}
                  className="object-contain rounded"
                />
              ))}
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
