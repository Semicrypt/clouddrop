import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import s3 from "../config/s3.js";

import {
  createFileRecord,
  deleteFileRecord,
  findFileByIdForUser,
  findFileMetadataByIdForUser,
  findFilesByUser,
} from "../repositories/file.repository.js";

import {
  detectFileCategory,
} from "../utils/file-category.js";

export async function uploadFile({
  userId,
  file,
  description,
}) {
  const bucketName = process.env.AWS_S3_BUCKET;

  if (!bucketName) {
    throw new Error(
      "AWS_S3_BUCKET environment variable is not configured"
    );
  }

  const extension =
    file.originalname.includes(".")
      ? file.originalname.split(".").pop()
      : "";

  const uniqueName = extension
    ? `${randomUUID()}.${extension}`
    : randomUUID();

  const category =
    detectFileCategory(file.mimetype);

  const objectKey =
    `users/${userId}/${category}/${uniqueName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,

      Metadata: {
        originalname: encodeURIComponent(
          file.originalname
        ),
        userid: userId,
      },
    })
  );

  try {
    const record =
      await createFileRecord({
        userId,
        originalName: file.originalname,
        blobName: objectKey,
        bucketName,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category,
        description,
      });

    return record;
  } catch (error) {
    // Prevent orphaned S3 files
    // if PostgreSQL insertion fails.
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    throw error;
  }
}

export async function listUserFiles({
  userId,
  search,
  category,
}) {
  return findFilesByUser({
    userId,
    search,
    category,
  });
}

export async function getUserFileMetadata({
  fileId,
  userId,
}) {
  const file =
    await findFileMetadataByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error("File not found");

    error.status = 404;

    throw error;
  }

  return file;
}

export async function createFileDownloadUrl({
  fileId,
  userId,
}) {
  const file =
    await findFileByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error("File not found");

    error.status = 404;

    throw error;
  }

  const command =
    new GetObjectCommand({
      Bucket: file.bucket_name,
      Key: file.blob_name,

      ResponseContentDisposition:
        `attachment; filename*=UTF-8''${encodeURIComponent(
          file.original_name
        )}`,
    });

  const url =
    await getSignedUrl(
      s3,
      command,
      {
        expiresIn: 300,
      }
    );

  return {
    file: {
      id: file.id,

      originalName:
        file.original_name,

      mimeType:
        file.mime_type,

      sizeBytes:
        file.size_bytes,

      category:
        file.category,
    },

    downloadUrl: url,

    expiresIn: 300,
  };
}

export async function deleteUserFile({
  fileId,
  userId,
}) {
  const file =
    await findFileByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error("File not found");

    error.status = 404;

    throw error;
  }

  // Delete the physical object from S3.
  await s3.send(
    new DeleteObjectCommand({
      Bucket: file.bucket_name,
      Key: file.blob_name,
    })
  );

  // Delete metadata from PostgreSQL.
  const deleted =
    await deleteFileRecord(
      fileId,
      userId
    );

  if (!deleted) {
    const error =
      new Error(
        "Unable to delete file metadata"
      );

    error.status = 500;

    throw error;
  }

  return {
    id: file.id,
    originalName:
      file.original_name,
  };
}