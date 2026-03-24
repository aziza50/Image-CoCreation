import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

//make post request to upload multiple files to s3 (curr no limit on files (need to change))
export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: "onboarding/" + file.name,
        Body: buffer,
        ContentType: file.type,
      }),
    );
  }
  return NextResponse.json({
    image_keys: files.map((file) => "onboarding/" + file.name),
  });
}
