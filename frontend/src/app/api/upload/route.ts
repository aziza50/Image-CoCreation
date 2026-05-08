//This is to upload users current working copy of the image to S3
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFormDataToS3(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Missing file" },
      { status: 400 },
    );
  }

  const providedKey = formData.get("key");
  const key =
    typeof providedKey === "string" && providedKey.length > 0
      ? providedKey
      : "history/" + file.name;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const response = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    if (response.$metadata.httpStatusCode !== 200) {
      console.error("Error uploading file to S3:", response);
      return NextResponse.json(
        { success: false, message: "Failed to upload file to S3" },
        { status: 500 },
      );
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
      }),
      { expiresIn: 604800 },
    );

    return NextResponse.json({ success: true, url, key });
  } catch (error) {
    console.error("S3 upload failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Failed to upload file to S3: ${message}` },
      { status: 500 },
    );
  }
}

//I was confused between NextRequest and Request, but NextRequest offers additional extras like request.cookies, request.nextUrl, and request.geo
export async function POST(request: Request) {
  const formData = await request.formData();
  return uploadFormDataToS3(formData);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const key = requestUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json(
      { success: false, message: "Missing key" },
      { status: 400 },
    );
  }
  const object = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    }),
  );
  const imageBytes = await object.Body?.transformToByteArray();
  return new Response(Buffer.from(imageBytes || []) as any, {
    headers: { "Content-Type": object.ContentType || "image/jpeg" },
  });
}

export async function PUT(request: Request) {
  console.log("Received PUT request to /api/upload");
  const formData = await request.formData();
  return uploadFormDataToS3(formData);
}
