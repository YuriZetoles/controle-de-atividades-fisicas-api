import crypto from "crypto";
import path from "path";
import { mkdtemp, unlink, writeFile, readFile, rmdir } from "fs/promises";
import { tmpdir } from "os";
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
    // Usa arquivos temporários: pipe/stream não permite que o ffmpeg escreva Cues e duration
    // no início do container WebM (requer seek de volta) — sem eles o Chrome recusa o vídeo.
    const dir = await mkdtemp(path.join(tmpdir(), "webm-"));
    const inputPath = path.join(dir, "input.webm");
    const outputPath = path.join(dir, "output.webm");
    try {
      await writeFile(inputPath, inputBuffer);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec("libvpx-vp9")
          .outputOptions(["-b:v", "0", "-crf", "33", "-row-mt", "1", "-an"])
          .format("webm")
          .on("error", reject)
          .on("end", () => resolve())
          .save(outputPath);
      });
      return await readFile(outputPath);
    } finally {
      await Promise.allSettled([unlink(inputPath), unlink(outputPath)]);
      try { await rmdir(dir); } catch { /* ignora se não-vazio */ }
    }
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
