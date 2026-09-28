import {
  changeCloudDropBucketVersioning,
  createCloudDropBucket,
  deleteCloudDropBucket,
  getCloudDropBucketFiles,
  listCloudDropBuckets,
  makeCloudDropBucketDefault,
} from "../services/aws-bucket.service.js";

export async function listBucketsController(
  req,
  res,
  next
) {
  try {
    const buckets =
      await listCloudDropBuckets(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      count:
        buckets.length,

      data: {
        buckets,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createBucketController(
  req,
  res,
  next
) {
  try {
    const {
      label,
      region,
      enableVersioning = false,
      setAsDefault = false,
    } = req.body;

    if (!region) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "region is required",
        });
    }

    const bucket =
      await createCloudDropBucket({
        userId:
          req.user.id,

        label,

        region:
          region.trim(),

        enableVersioning:
          Boolean(
            enableVersioning
          ),

        setAsDefault:
          Boolean(
            setAsDefault
          ),
      });

    return res.status(201).json({
      success: true,

      message:
        "CloudDrop bucket created successfully",

      data: {
        bucket,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function bucketFilesController(
  req,
  res,
  next
) {
  try {
    const result =
      await getCloudDropBucketFiles({
        userId:
          req.user.id,

        bucketId:
          req.params.bucketId,
      });

    return res.status(200).json({
      success: true,

      count:
        result.files.length,

      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultBucketController(
  req,
  res,
  next
) {
  try {
    const bucket =
      await makeCloudDropBucketDefault({
        userId:
          req.user.id,

        bucketId:
          req.params.bucketId,
      });

    return res.status(200).json({
      success: true,

      message:
        "Default bucket updated successfully",

      data: {
        bucket,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBucketVersioningController(
  req,
  res,
  next
) {
  try {
    if (
      typeof req.body.enabled !==
      "boolean"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "enabled must be true or false",
        });
    }

    const bucket =
      await changeCloudDropBucketVersioning({
        userId:
          req.user.id,

        bucketId:
          req.params.bucketId,

        enabled:
          req.body.enabled,
      });

    return res.status(200).json({
      success: true,

      message:
        req.body.enabled
          ? "Bucket versioning enabled"
          : "Bucket versioning suspended",

      data: {
        bucket,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBucketController(
  req,
  res,
  next
) {
  try {
    const bucket =
      await deleteCloudDropBucket({
        userId:
          req.user.id,

        bucketId:
          req.params.bucketId,
      });

    return res.status(200).json({
      success: true,

      message:
        "Bucket deleted successfully",

      data: {
        bucket: {
          id:
            bucket.id,

          bucketName:
            bucket.bucket_name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}