import {
  disconnectUserAwsAccount,
  getAwsConnection,
  initializeAwsConnection,
  verifyAwsConnection,
} from "../services/aws.service.js";

function sanitizeConnection(
  connection
) {
  if (!connection) {
    return null;
  }

  return {
    id:
      connection.id,

    awsAccountId:
      connection.aws_account_id,

    roleArn:
      connection.role_arn,

    externalId:
      connection.external_id,

    bucketName:
      connection.bucket_name,

    region:
      connection.region,

    status:
      connection.status,

    lastError:
      connection.last_error,

    verifiedAt:
      connection.verified_at,

    disconnectedAt:
      connection.disconnected_at,

    createdAt:
      connection.created_at,

    updatedAt:
      connection.updated_at,
  };
}

function getSetupInstructions(
  externalId
) {
  return {
    cloudDropPrincipalArn:
      process.env
        .CLOUDDROP_AWS_PRINCIPAL_ARN ||
      null,

    security: {
      storesAccessKeys: false,
      storesSecretKeys: false,
      asksForAwsPassword: false,
      usesTemporaryCredentials: true,
      usesExternalId: true,
      usesIamRole: true,
    },

    steps: [
      {
        number: 1,

        title:
          "Sign in to AWS",

        description:
          "Sign in to the AWS account where you want CloudDrop files to be stored.",
      },

      {
        number: 2,

        title:
          "Download the CloudDrop template",

        description:
          "CloudDrop provides a CloudFormation template that creates the required private S3 bucket and IAM role.",
      },

      {
        number: 3,

        title:
          "Create a CloudFormation stack",

        description:
          "Open AWS CloudFormation, choose Create stack, upload the CloudDrop template and continue.",
      },

      {
        number: 4,

        title:
          "Enter CloudDrop parameters",

        description:
          "Paste the CloudDrop principal ARN and your unique External ID into the stack parameters.",

        externalId,
      },

      {
        number: 5,

        title:
          "Create the stack",

        description:
          "Review the resources, acknowledge IAM resource creation and create the stack.",
      },

      {
        number: 6,

        title:
          "Wait for CREATE_COMPLETE",

        description:
          "CloudFormation will create your private encrypted S3 bucket and CloudDrop IAM role.",
      },

      {
        number: 7,

        title:
          "Copy the stack outputs",

        description:
          "Open the Outputs tab and copy RoleArn, BucketName and Region.",
      },

      {
        number: 8,

        title:
          "Verify the connection",

        description:
          "Return to CloudDrop, paste the three outputs and click Verify Connection.",
      },
    ],
  };
}

export async function startAwsSetupController(
  req,
  res,
  next
) {
  try {
    const connection =
      await initializeAwsConnection(
        req.user.id
      );

    return res.status(201).json({
      success: true,

      message:
        "AWS connection setup initialized",

      data: {
        connection:
          sanitizeConnection(
            connection
          ),

        setup:
          getSetupInstructions(
            connection.external_id
          ),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAwsConnectionController(
  req,
  res,
  next
) {
  try {
    const connection =
      await getAwsConnection(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      data: {
        connection:
          sanitizeConnection(
            connection
          ),

        cloudDropPrincipalArn:
          process.env
            .CLOUDDROP_AWS_PRINCIPAL_ARN ||
          null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyAwsConnectionController(
  req,
  res,
  next
) {
  try {
    const {
      roleArn,
      bucketName,
      region,
    } = req.body;

    if (
      !roleArn ||
      !bucketName ||
      !region
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "roleArn, bucketName and region are required",
        });
    }

    const connection =
      await verifyAwsConnection({
        userId:
          req.user.id,

        roleArn:
          roleArn.trim(),

        bucketName:
          bucketName.trim(),

        region:
          region.trim(),
      });

    return res.status(200).json({
      success: true,

      message:
        "AWS account connected successfully",

      data: {
        connection:
          sanitizeConnection(
            connection
          ),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function disconnectAwsConnectionController(
  req,
  res,
  next
) {
  try {
    const connection =
      await disconnectUserAwsAccount(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      message:
        "AWS account disconnected successfully",

      data: {
        connection:
          sanitizeConnection(
            connection
          ),
      },
    });
  } catch (error) {
    next(error);
  }
}