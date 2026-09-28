import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";

import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  randomBytes,
  randomUUID,
} from "crypto";

import {
  createAwsConnection,
  disconnectAwsConnection,
  findAwsConnectionByUserId,
  markAwsConnectionConnected,
  markAwsConnectionError,
} from "../repositories/aws.repository.js";

function createExternalId() {
  return `clouddrop-${randomBytes(
    24
  ).toString("hex")}`;
}

function validateRoleArn(
  roleArn
) {
  const pattern =
    /^arn:aws:iam::(\d{12}):role\/(.+)$/;

  const match =
    roleArn.match(pattern);

  if (!match) {
    const error =
      new Error(
        "Invalid IAM role ARN"
      );

    error.status = 400;

    throw error;
  }

  return {
    awsAccountId:
      match[1],
  };
}

function validateBucketName(
  bucketName
) {
  const pattern =
    /^(?!xn--)(?!sthree-)(?!amzn-s3-demo-)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

  if (
    !bucketName ||
    !pattern.test(bucketName)
  ) {
    const error =
      new Error(
        "Invalid S3 bucket name"
      );

    error.status = 400;

    throw error;
  }
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

export async function initializeAwsConnection(
  userId
) {
  const existing =
    await findAwsConnectionByUserId(
      userId
    );

  if (
    existing &&
    existing.status ===
      "CONNECTED"
  ) {
    const error =
      new Error(
        "AWS account is already connected"
      );

    error.status = 409;

    throw error;
  }

  const externalId =
    createExternalId();

  return createAwsConnection({
    userId,
    externalId,
  });
}

async function assumeCustomerRole({
  roleArn,
  externalId,
  region,
}) {
  const sts =
    new STSClient({
      region,
    });

  const response =
    await sts.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,

        RoleSessionName:
          `CloudDrop-${randomUUID()}`,

        ExternalId:
          externalId,

        DurationSeconds:
          3600,
      })
    );

  if (
    !response.Credentials
      ?.AccessKeyId ||
    !response.Credentials
      ?.SecretAccessKey ||
    !response.Credentials
      ?.SessionToken
  ) {
    throw new Error(
      "AWS did not return temporary role credentials"
    );
  }

  return {
    accessKeyId:
      response.Credentials
        .AccessKeyId,

    secretAccessKey:
      response.Credentials
        .SecretAccessKey,

    sessionToken:
      response.Credentials
        .SessionToken,

    expiration:
      response.Credentials
        .Expiration,
  };
}

export async function verifyAwsConnection({
  userId,
  roleArn,
  bucketName,
  region,
}) {
  const connection =
    await findAwsConnectionByUserId(
      userId
    );

  if (!connection) {
    const error =
      new Error(
        "Start AWS setup before verifying the connection"
      );

    error.status = 400;

    throw error;
  }

  const {
    awsAccountId,
  } = validateRoleArn(
    roleArn
  );

  validateBucketName(
    bucketName
  );

  validateRegion(
    region
  );

  try {
    const credentials =
      await assumeCustomerRole({
        roleArn,
        externalId:
          connection.external_id,
        region,
      });

    const assumedSts =
      new STSClient({
        region,
        credentials,
      });

    const identity =
      await assumedSts.send(
        new GetCallerIdentityCommand(
          {}
        )
      );

    if (
      identity.Account !==
      awsAccountId
    ) {
      throw new Error(
        "The assumed IAM role belongs to an unexpected AWS account"
      );
    }

    const customerS3 =
      new S3Client({
        region,
        credentials,
      });

    await customerS3.send(
      new HeadBucketCommand({
        Bucket: bucketName,
      })
    );

    const testObjectKey =
      `.clouddrop/connection-tests/${randomUUID()}.txt`;

    await customerS3.send(
      new PutObjectCommand({
        Bucket:
          bucketName,

        Key:
          testObjectKey,

        Body:
          "CloudDrop connection verification",

        ContentType:
          "text/plain",
      })
    );

    await customerS3.send(
      new DeleteObjectCommand({
        Bucket:
          bucketName,

        Key:
          testObjectKey,
      })
    );

    return await markAwsConnectionConnected({
      userId,
      awsAccountId,
      roleArn,
      bucketName,
      region,
    });
  } catch (error) {
    await markAwsConnectionError({
      userId,
      roleArn,
      bucketName,
      region,

      errorMessage:
        error.message ||
        "AWS connection verification failed",
    });

    const verificationError =
      new Error(
        `AWS connection verification failed: ${
          error.message ||
          "Unknown AWS error"
        }`
      );

    verificationError.status =
      400;

    throw verificationError;
  }
}

export async function getAwsConnection(
  userId
) {
  return findAwsConnectionByUserId(
    userId
  );
}

export async function disconnectUserAwsAccount(
  userId
) {
  const existing =
    await findAwsConnectionByUserId(
      userId
    );

  if (!existing) {
    const error =
      new Error(
        "AWS connection not found"
      );

    error.status = 404;

    throw error;
  }

  return disconnectAwsConnection(
    userId
  );
}
