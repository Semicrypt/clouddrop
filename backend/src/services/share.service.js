import {
  createHash,
  randomBytes,
} from "crypto";

import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import {
  findFileByIdForUser,
} from "../repositories/file.repository.js";

import {
  createShareLink,
  deleteShareLink,
  findShareByTokenHash,
  findSharesForFile,
} from "../repositories/share.repository.js";

import {
  getFileStorage,
} from "./storage.service.js";

function hashToken(
  token
) {
  return createHash(
    "sha256"
  )
    .update(token)
    .digest("hex");
}

function createSecureToken() {
  return randomBytes(
    32
  ).toString(
    "base64url"
  );
}

export async function createTemporaryShare({
  fileId,
  userId,
  expiresInMinutes,
}) {
  const file =
    await findFileByIdForUser(
      fileId,
      userId
    );

  if (!file) {
    const error =
      new Error(
        "File not found"
      );

    error.status = 404;

    throw error;
  }

  const defaultExpiry =
    Number(
      process.env
        .SHARE_DEFAULT_EXPIRY_MINUTES ||
        60
    );

  const maxExpiry =
    Number(
      process.env
        .SHARE_MAX_EXPIRY_MINUTES ||
        10080
    );

  const requestedExpiry =
    Number(
      expiresInMinutes ||
        defaultExpiry
    );

  if (
    !Number.isFinite(
      requestedExpiry
    ) ||
    requestedExpiry <= 0
  ) {
    const error =
      new Error(
        "Expiry must be a positive number of minutes"
      );

    error.status = 400;

    throw error;
  }

  if (
    requestedExpiry >
    maxExpiry
  ) {
    const error =
      new Error(
        `Share links cannot exceed ${maxExpiry} minutes`
      );

    error.status = 400;

    throw error;
  }

  const token =
    createSecureToken();

  const tokenHash =
    hashToken(
      token
    );

  const expiresAt =
    new Date(
      Date.now() +
        requestedExpiry *
          60 *
          1000
    );

  const share =
    await createShareLink({
      fileId,
      tokenHash,
      expiresAt,
    });

  return {
    share,
    token,

    expiresInMinutes:
      requestedExpiry,
  };
}

export async function resolveShareToken(
  token
) {
  if (!token) {
    const error =
      new Error(
        "Share token is required"
      );

    error.status = 400;

    throw error;
  }

  const tokenHash =
    hashToken(
      token
    );

  const share =
    await findShareByTokenHash(
      tokenHash
    );

  if (!share) {
    const error =
      new Error(
        "Share link is invalid"
      );

    error.status = 404;

    throw error;
  }

  const expiresAt =
    new Date(
      share.expires_at
    );

  if (
    expiresAt.getTime() <=
    Date.now()
  ) {
    const error =
      new Error(
        "Share link has expired"
      );

    error.status = 410;

    throw error;
  }

  const storage =
    await getFileStorage(
      share
    );

  const command =
    new GetObjectCommand({
      Bucket:
        share.bucket_name,

      Key:
        share.blob_name,

      ResponseContentDisposition:
        `attachment; filename*=UTF-8''${encodeURIComponent(
          share.original_name
        )}`,
    });

  const downloadUrl =
    await getSignedUrl(
      storage.client,
      command,
      {
        expiresIn:
          300,
      }
    );

  return {
    file: {
      id:
        share.file_id,

      originalName:
        share.original_name,

      mimeType:
        share.mime_type,

      sizeBytes:
        share.size_bytes,

      category:
        share.category,

      description:
        share.description,

      storageMode:
        share.storage_mode,
    },

    expiresAt:
      share.expires_at,

    downloadUrl,

    downloadUrlExpiresIn:
      300,
  };
}

export async function listFileShares({
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
      new Error(
        "File not found"
      );

    error.status = 404;

    throw error;
  }

  return findSharesForFile(
    fileId,
    userId
  );
}

export async function revokeShare({
  shareId,
  fileId,
  userId,
}) {
  const deleted =
    await deleteShareLink({
      shareId,
      fileId,
      userId,
    });

  if (!deleted) {
    const error =
      new Error(
        "Share link not found"
      );

    error.status = 404;

    throw error;
  }

  return deleted;
}