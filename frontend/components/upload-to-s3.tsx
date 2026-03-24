"use client";

const UploadToS3 = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  try {
    const response = await fetch("/api/onboarding", {
      method: "POST",
      body: formData,
    });
    console.log("Response from server:", response);
    const result = await response.json();
    if (!result.image_keys) {
      alert("Failed to upload files.");
      return null;
    }
    //Now call fastAPI with the image keys
    const extractResponse = await fetch(
      "http://localhost:8000/images/extract",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_keys: result.image_keys }),
      },
    );
    const extractResult = await extractResponse.json();
    return extractResult;
  } catch (error) {
    {
      console.error("Error uploading files:", error);
      alert("Failed to upload files.");
      return null;
    }
  }
};
