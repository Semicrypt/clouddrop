import {
  AssumeRoleCommand,
  STSClient,
} from "@aws-sdk/client-sts";

import {
  S3Client,
} from "@aws-sdk/client-s3";

import {
  randomUUID,
} from "crypto";

import managedS3 from "../config/s3.js";

import {
  findAwsConnectionById,
  findAwsConnectionByUserId,
} from "../repositories/aws.repository.js";

import {
  findBucketByNameForUser,
  findDefaultBucketByUserId,
} from "../repositories/aws-bucket.repository.js";

async function assumeConnectionRole(
  connection
) {
  if (
    !connection?.role_arn ||
    !connection?.external_id
  ) {
    const error =
      new Error(
        "AWS connection configuration is incomplete"
      );

    error.status = 409;

    throw error;
  }

  const sts =
    new STSClient({
      region:
        connection.region ||
        process.env.AWS_REGION,
    });

  const response =
    await sts.send(
      new AssumeRoleCommand({
        RoleArn:
          connection.role_arn,

        ExternalId:
          connection.external_id,

        RoleSessionName:
          `CloudDrop-${randomUUID()}`,

        DurationSeconds:
          3600,
      })
    );

  const credentials =
    response.Credentials;

  if (
    !credentials?.AccessKeyId ||
    !credentials?.SecretAccessKey ||
    !credentials?.SessionToken
  ) {
    throw new Error(
      "AWS did not return temporary credentials"
    );
  }

  return {
    accessKeyId:
      credentials.AccessKeyId,

    secretAccessKey:
      credentials.SecretAccessKey,

    sessionToken:
      credentials.SessionToken,

    expiration:
      credentials.Expiration,
  };
}

export async function createS3ClientForConnection(
  connection,
  targetRegion
) {
  if (
    connection.status !==
    "CONNECTED"
  ) {
    const error =
      new Error(
        "AWS account is not connected"
      );

    error.status = 409;

    throw error;
  }

  const credentials =
    await assumeConnectionRole(
      connection
    );

  return new S3Client({
    region:
      targetRegion ||
      connection.region,

    credentials,
  });
}

export async function getUploadStorage(
  userId
) {
  const connection =
    await findAwsConnectionByUserId(
      userId
    );

  if (
    connection?.status ===
    "CONNECTED"
  ) {
    const defaultBucket =
      await findDefaultBucketByUserId(
        userId
      );

    /*
     * Preferred path:
     * use the user's registered
     * default CloudDrop bucket.
     */
    if (defaultBucket) {
      const client =
        await createS3ClientForConnection(
          connection,
          defaultBucket.region
        );

      return {
        client,

        bucketName:
          defaultBucket.bucket_name,

        storageMode:
          "CUSTOMER",

        awsConnectionId:
          connection.id,

        region:
          defaultBucket.region,

        bucketId:
          defaultBucket.id,
      };
    }

    /*
     * Compatibility fallback for
     * connections created before
     * multi-bucket support.
     */
    if (
      connection.bucket_name &&
      connection.region
    ) {
      const client =
        await createS3ClientForConnection(
          connection,
          connection.region
        );

      return {
        client,

        bucketName:
          connection.bucket_name,

        storageMode:
          "CUSTOMER",

        awsConnectionId:
          connection.id,

        region:
          connection.region,

        bucketId:
          null,
      };
    }
  }

  const managedBucket =
    process.env.AWS_S3_BUCKET;

  if (!managedBucket) {
    throw new Error(
      "AWS_S3_BUCKET environment variable is not configured"
    );
  }

  return {
    client:
      managedS3,

    bucketName:
      managedBucket,

    storageMode:
      "MANAGED",

    awsConnectionId:
      null,

    region:
      process.env.AWS_REGION,

    bucketId:
      null,
  };
}

export async function getFileStorage(
  file
) {
  if (
    file.storage_mode !==
    "CUSTOMER"
  ) {
    return {
      client:
        managedS3,

      bucketName:
        file.bucket_name,

      storageMode:
        "MANAGED",

      region:
        process.env.AWS_REGION,
    };
  }

  if (
    !file.aws_connection_id
  ) {
    const error =
      new Error(
        "Customer AWS connection information is missing"
      );

    error.status = 409;

    throw error;
  }

  const connection =
    await findAwsConnectionById(
      file.aws_connection_id
    );

  if (!connection) {
    const error =
      new Error(
        "AWS connection for this file no longer exists"
      );

    error.status = 409;

    throw error;
  }

  if (
    connection.status !==
    "CONNECTED"
  ) {
    const error =
      new Error(
        "Reconnect your AWS account before accessing this file"
      );

    error.status = 409;

    throw error;
  }

  const bucket =
    await findBucketByNameForUser(
      file.bucket_name,
      file.user_id
    );

  const region =
    bucket?.region ||
    connection.region;

  const client =
    await createS3ClientForConnection(
      connection,
      region
    );

  return {
    client,

    bucketName:
      file.bucket_name,

    storageMode:
      "CUSTOMER",

    region,

    connection,

    bucket:
      bucket || null,
  };
}