import crypto from "crypto";
import path from "path";
import { Readable, PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import { minioClient, minioConfig, getPublicObjectUrl, prepareMinioUpload } from "../config/garageHqConnect";

type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type UploadedObjectResult = {
  bucket: string;
  objectKey: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
};

class UploadService {
  async uploadFiles(category: string, files: UploadedFile[]): Promise<UploadedObjectResult[]> {
    await prepareMinioUpload();
    const uploads = files.map((file) => this.uploadSingleFile(category, file));
    return Promise.all(uploads);
  }

  async deleteFile(category: string, fileName: string): Promise<{ bucket: string; objectKey: string }> {
    await prepareMinioUpload();

    const bucket = minioConfig.bucket;
    if (!bucket) {
      throw new Error("Bucket nao configurado. Defina MINIO_BUCKET_FOTOS");
    }

    const sanitizedCategory = category.replace(/[^a-z0-9-_]/gi, "").toLowerCase();
    const objectKey = `${sanitizedCategory}/${fileName}`;

    try {
      await minioClient.statObject(bucket, objectKey);
    } catch {
      throw new Error(`Arquivo nao encontrado: ${objectKey}`);
    }

    await minioClient.removeObject(bucket, objectKey);

    return { bucket, objectKey };
  }

  private async reencodeWebm(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const input = Readable.from(inputBuffer);
      const output = new PassThrough();
      const chunks: Buffer[] = [];

      output.on("data", (chunk: Buffer) => chunks.push(chunk));
      output.on("end", () => resolve(Buffer.concat(chunks)));
      output.on("error", reject);

      ffmpeg(input)
        .inputFormat("webm")
        .videoCodec("libvpx-vp9")
        .outputOptions(["-b:v", "0", "-crf", "33", "-row-mt", "1", "-an"])
        .format("webm")
        .on("error", reject)
        .pipe(output, { end: true });
    });
  }

  private async uploadSingleFile(category: string, file: UploadedFile): Promise<UploadedObjectResult> {
    const bucket = minioConfig.bucket;
    if (!bucket) {
      throw new Error("Bucket nao configurado. Defina MINIO_BUCKET_FOTOS");
    }

    const objectKey = this.buildObjectKey(category, file.originalname);

    let uploadBuffer = file.buffer;
    let uploadSize = file.size;

    const isWebm = file.mimetype === "video/webm" || file.originalname.toLowerCase().endsWith(".webm");
    if (isWebm) {
      try {
        uploadBuffer = await this.reencodeWebm(file.buffer);
        uploadSize = uploadBuffer.length;
        console.log(`[UploadService] WebM re-encoded: ${file.size} → ${uploadSize} bytes`);
      } catch (err) {
        console.error("[UploadService] WebM re-encode falhou, usando original:", err);
      }
    }

    await minioClient.putObject(
      bucket,
      objectKey,
      uploadBuffer,
      uploadSize,
      { "Content-Type": file.mimetype },
    );

    return {
      bucket,
      objectKey,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: getPublicObjectUrl(objectKey),
    };
  }

  private buildObjectKey(category: string, originalName: string): string {
    const ext = path.extname(originalName || "").toLowerCase();
    const sanitizedCategory = category.replace(/[^a-z0-9-_]/gi, "").toLowerCase();
    const safeExt = ext.length > 0 ? ext : "";
    const random = crypto.randomUUID();
    const timestamp = Date.now();
    return `${sanitizedCategory}/${timestamp}-${random}${safeExt}`;
  }
}

export default UploadService;
