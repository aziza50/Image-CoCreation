"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { bacasime } from "../styles/fonts";
function DragDrop() {
  const [dataURL, setDataURL] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploaded, setUploaded] = React.useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        setDataURL(dataURL);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const onUpload = async (): Promise<void> => {
    if (files.length !== 0) {
      // Send it to the backend '/api/upload' route
      const formData = new FormData();
      formData.append("file", files[0]);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          alert("File uploaded successfully!");
          setUploaded(true);
        } else {
          alert("Failed to upload file.");
        }
      } catch (error) {
        {
          alert("Failed to upload file.");
        }
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (uploaded && dataURL) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <img
            src={dataURL}
            alt="Uploaded artwork"
            className="rounded-lg object-contain shadow-lg"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              width: "auto",
              height: "auto",
            }}
          />
        </div>
      </>
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
            <img
              src={dataURL}
              alt="Uploaded artwork"
              className="w-40 h-40 object-contain"
            />
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
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
export default DragDrop;
