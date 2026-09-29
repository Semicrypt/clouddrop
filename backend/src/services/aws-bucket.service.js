import {
  CreateBucketCommand,
  DeleteBucketCommand,
  GetBucketVersioningCommand,
  ListObjectsV2Command,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";

import {
  randomBytes,
} from "crypto";

import {
  findAwsConnectionByUserId,
} from "../repositories/aws.repository.js";

import {
  countFilesForBucket,
  createBucketRecord,
  deleteBucketRecord,
  findBucketByIdForUser,
  findBucketsByUserId,
  findDefaultBucketByUserId,
  findFilesForBucket,
  setDefaultBucket,
  updateBucketVersioningRecord,
} from "../repositories/aws-bucket.repository.js";

import {
  createS3ClientForConnection,
} from "./storage.service.js";

function normalizeBucketLabel(
  label
) {
  const normalized =
    String(
      label || "storage"
    )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .replace(
        /-{2,}/g,
        "-"
      );

  if (
    normalized.length < 3
  ) {
    const error =
      new Error(
        "Bucket label must contain at least 3 valid characters"
      );

    error.status = 400;

    throw error;
  }

  return normalized.slice(
    0,
    28
  );
}

function validateRegion(
  region
) {
  const pattern =
    /^[a-z]{2}(-gov)?-[a-z]+-\d$/;

  if (
    !region ||
    !pattern.test(region)
  ) {
    const error =
      new Error(
        "Invalid AWS region"
      );

    error.status = 400;

    throw error;
  }
}

function createBucketName({
  awsAccountId,
  label,
}) {
  const suffix =
    randomBytes(4)
      .toString("hex");

  const safeLabel =
    normalizeBucketLabel(
      label
    );

  return [
    "clouddrop",
    awsAccountId,
    safeLabel,
    suffix,
  ].join("-");
}

async function requireConnection(
  userId
) {
  const connection =
    await findAwsConnectionByUserId(
      userId
    );

  if (
    !connection ||
    connection.status !==
      "CONNECTED"
  ) {
    const error =
      new Error(
        "Connect your AWS account before managing buckets"
      );

    error.status = 409;

    throw error;
  }

  return connection;
}

export async function listCloudDropBuckets(
  userId
) {
  const buckets =
    await findBucketsByUserId(
      userId
    );

  return Promise.all(
    buckets.map(
      async (bucket) => ({
        ...bucket,

        file_count:
          await countFilesForBucket({
            userId,

            bucketName:
              bucket.bucket_name,
          }),
      })
    )
  );
}

export async function createCloudDropBucket({
  userId,
  label,
  region,
  enableVersioning = false,
  setAsDefault = false,
}) {
  validateRegion(
    region
  );

  const connection =
    await requireConnection(
      userId
    );

  const bucketName =
    createBucketName({
      awsAccountId:
        connection.aws_account_id,

      label,
    });

  const s3 =
    await createS3ClientForConnection(
      connection,
      region
    );

  const createParams = {
    Bucket:
      bucketName,
  };

  /*
   * us-east-1 is special.
   * CreateBucketConfiguration
   * must be omitted there.
   */
  if (
    region !==
    "us-east-1"
  ) {
    createParams.CreateBucketConfiguration =
      {
        LocationConstraint:
          region,
      };
  }

  let bucketCreated =
    false;

  try {
    await s3.send(
      new CreateBucketCommand(
        createParams
      )
    );

    bucketCreated =
      true;

    /*
     * Every bucket CloudDrop creates
     * remains private.
     */
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket:
          bucketName,

        PublicAccessBlockConfiguration:
          {
            BlockPublicAcls:
              true,

            IgnorePublicAcls:
              true,

            BlockPublicPolicy:
              true,

            RestrictPublicBuckets:
              true,
          },
      })
    );

    /*
     * Explicit server-side encryption.
     */
    await s3.send(
      new PutBucketEncryptionCommand({
        Bucket:
          bucketName,

        ServerSideEncryptionConfiguration:
          {
            Rules: [
              {
                ApplyServerSideEncryptionByDefault:
                  {
                    SSEAlgorithm:
                      "AES256",
                  },
              },
            ],
          },
      })
    );

    if (
      enableVersioning
    ) {
      await s3.send(
        new PutBucketVersioningCommand({
          Bucket:
            bucketName,

          VersioningConfiguration:
            {
              Status:
                "Enabled",
            },
        })
      );
    }

    const currentDefault =
      await findDefaultBucketByUserId(
        userId
      );

    const shouldBeDefault =
      setAsDefault ||
      !currentDefault;

    return await createBucketRecord({
      userId,

      awsConnectionId:
        connection.id,

      bucketName,

      region,

      isDefault:
        shouldBeDefault,

      versioningStatus:
        enableVersioning
          ? "ENABLED"
          : "DISABLED",

      provisioningSource:
        "CLOUDDROP",
    });
  } catch (error) {
    /*
     * If AWS created the bucket but
     * later configuration failed,
     * try to clean up the empty
     * bucket.
     */
    if (bucketCreated) {
      try {
        await s3.send(
          new DeleteBucketCommand({
            Bucket:
              bucketName,
          })
        );
      } catch {
        /*
         * Preserve the original
         * provisioning error.
         */
      }
    }

    throw error;
  }
}

export async function getCloudDropBucketFiles({
  userId,
  bucketId,
}) {
  const bucket =
    await findBucketByIdForUser(
      bucketId,
      userId
    );

  if (!bucket) {
    const error =
      new Error(
        "Bucket not found"
      );

    error.status = 404;

    throw error;
  }

  const files =
    await findFilesForBucket({
      userId,

      bucketName:
        bucket.bucket_name,
    });

  return {
    bucket,
    files,
  };
}

export async function makeCloudDropBucketDefault({
  userId,
  bucketId,
}) {
  const connection =
    await requireConnection(
      userId
    );

  const bucket =
    await findBucketByIdForUser(
      bucketId,
      userId
    );

  if (
    !bucket ||
    bucket.aws_connection_id !==
      connection.id
  ) {
    const error =
      new Error(
        "Bucket not found"
      );

    error.status = 404;

    throw error;
  }

  return setDefaultBucket({
    bucketId,
    userId,
  });
}

export async function changeCloudDropBucketVersioning({
  userId,
  bucketId,
  enabled,
}) {
  const connection =
    await requireConnection(
      userId
    );

  const bucket =
    await findBucketByIdForUser(
      bucketId,
      userId
    );

  if (!bucket) {
    const error =
      new Error(
        "Bucket not found"
      );

    error.status = 404;

    throw error;
  }

  const s3 =
    await createS3ClientForConnection(
      connection,
      bucket.region
    );

  const status =
    enabled
      ? "Enabled"
      : "Suspended";

  await s3.send(
    new PutBucketVersioningCommand({
      Bucket:
        bucket.bucket_name,

      VersioningConfiguration:
        {
          Status:
            status,
        },
    })
  );

  /*
   * Verify the actual state
   * returned by AWS.
   */
  const response =
    await s3.send(
      new GetBucketVersioningCommand({
        Bucket:
          bucket.bucket_name,
      })
    );

  const actualStatus =
    response.Status ===
    "Enabled"
      ? "ENABLED"
      : response.Status ===
          "Suspended"
        ? "SUSPENDED"
        : "DISABLED";

  return updateBucketVersioningRecord({
    bucketId,
    userId,

    versioningStatus:
      actualStatus,
  });
}

export async function deleteCloudDropBucket({
  userId,
  bucketId,
}) {
  const connection =
    await requireConnection(
      userId
    );

  const bucket =
    await findBucketByIdForUser(
      bucketId,
      userId
    );

  if (!bucket) {
    const error =
      new Error(
        "Bucket not found"
      );

    error.status = 404;

    throw error;
  }

  /*
   * The original bootstrap bucket
   * belongs to CloudFormation.
   * CloudDrop will not delete it.
   */
  if (
    bucket.provisioning_source !==
    "CLOUDDROP"
  ) {
    const error =
      new Error(
        "Only buckets created directly by CloudDrop can be deleted here"
      );

    error.status = 409;

    throw error;
  }

  /*
   * Never delete the active default
   * bucket.
   */
  if (
    bucket.is_default
  ) {
    const error =
      new Error(
        "Set another bucket as default before deleting this bucket"
      );

    error.status = 409;

    throw error;
  }

  /*
   * Check CloudDrop metadata first.
   */
  const fileCount =
    await countFilesForBucket({
      userId,

      bucketName:
        bucket.bucket_name,
    });

  if (
    fileCount > 0
  ) {
    const error =
      new Error(
        "Bucket contains CloudDrop files. Delete or move those files first."
      );

    error.status = 409;

    throw error;
  }

  const s3 =
    await createS3ClientForConnection(
      connection,
      bucket.region
    );

  /*
   * Then check S3 itself.
   *
   * This catches objects that may
   * have been added outside
   * CloudDrop.
   */
  const objects =
    await s3.send(
      new ListObjectsV2Command({
        Bucket:
          bucket.bucket_name,

        MaxKeys:
          1,
      })
    );

  if (
    (objects.KeyCount || 0) >
    0
  ) {
    const error =
      new Error(
        "Bucket is not empty. Remove its objects before deleting it."
      );

    error.status = 409;

    throw error;
  }

  try {
    await s3.send(
      new DeleteBucketCommand({
        Bucket:
          bucket.bucket_name,
      })
    );
  } catch (error) {
    if (
      error.name ===
      "BucketNotEmpty"
    ) {
      const bucketError =
        new Error(
          "Bucket still contains object versions or delete markers and cannot be deleted"
        );

      bucketError.status =
        409;

      throw bucketError;
    }

    throw error;
  }

  await deleteBucketRecord({
    bucketId,
    userId,
  });

  return bucket;
}