import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

//I was confused between NextRequest and Request, but NextRequest offers additional extras like request.cookies, request.nextUrl, and request.geo
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  //Conver the file to binady data as an ArrayBuffer then turn it to a Node.js Buffer which is accepted by S3 PutObjectCommand
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: "uploads/" + file.name,
      Body: buffer,
      ContentType: file.type,
    }),
  );
  return NextResponse.json({ success: true });
}
