export async function POST(request: Request) {
  const formData = await request.formData();
  const maskInput = formData.get("mask_input") as File;
  const imageInput = formData.get("image_input") as File;
  const inputValue = formData.get("prompt") as string;
  const s3Key = formData.get("s3_key") as string;
  const token = formData.get("token") as string;

  try {
    const newForm = new FormData();
    newForm.append("mask_input", maskInput);
    newForm.append("image_input", imageInput);
    newForm.append("prompt", inputValue);
    newForm.append("token", token);
    const response = await fetch(
      "http://127.0.0.1:8000/generate-lasso-suggestion",
      {
        method: "POST",
        body: newForm,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        alert("Rate limit exceeded. Please try again later.");
      } else
        alert(`Error generating suggestion: ${error.error || "Unknown error"}`);
      return new Response(JSON.stringify({ success: false, data: null }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await response.blob();
    console.log("generating file from blob");
    const file = new File([result], "suggestion.jpg", { type: "image/jpeg" });
    //update the s3 object with the new file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", s3Key);
    console.log("Form input: ", file, s3Key);
    console.log("Uploading suggestion to S3 with key:", s3Key);
    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text().catch(() => "");
      console.error(
        "Error uploading suggestion:",
        uploadError || uploadResponse.statusText,
      );
      console.error(uploadResponse.status);
      return new Response(JSON.stringify({ success: false, data: null }), {
        status: uploadResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(result, {
      status: 200,
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, data: null }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
