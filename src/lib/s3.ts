import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET = process.env.S3_BUCKET ?? 'formforge'

let _s3: S3Client | null = null
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region:      process.env.S3_REGION ?? 'auto',
      endpoint:    process.env.S3_ENDPOINT ?? '',
      credentials: {
        accessKeyId:     process.env.S3_KEY ?? '',
        secretAccessKey: process.env.S3_SECRET ?? '',
      },
    })
  }
  return _s3
}

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  await getS3().send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }))
  return key
}

export async function deleteFromS3(key: string) {
  await getS3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(getS3(), new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const res = await getS3().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const bytes = await res.Body!.transformToByteArray()
  return Buffer.from(bytes)
}
