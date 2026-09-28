import {
  Router,
} from "express";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import {
  disconnectAwsConnectionController,
  getAwsConnectionController,
  startAwsSetupController,
  verifyAwsConnectionController,
} from "../controllers/aws.controller.js";

import {
  bucketFilesController,
  createBucketController,
  deleteBucketController,
  listBucketsController,
  setDefaultBucketController,
  updateBucketVersioningController,
} from "../controllers/aws-bucket.controller.js";

const router =
  Router();

router.use(
  requireAuth
);

/*
 * AWS connection
 */
router.get(
  "/connection",
  getAwsConnectionController
);

router.post(
  "/connection/setup",
  startAwsSetupController
);

router.post(
  "/connection/verify",
  verifyAwsConnectionController
);

router.delete(
  "/connection",
  disconnectAwsConnectionController
);


/*
 * CloudDrop-managed customer buckets
 */
router.get(
  "/buckets",
  listBucketsController
);

router.post(
  "/buckets",
  createBucketController
);

router.get(
  "/buckets/:bucketId/files",
  bucketFilesController
);

router.patch(
  "/buckets/:bucketId/default",
  setDefaultBucketController
);

router.patch(
  "/buckets/:bucketId/versioning",
  updateBucketVersioningController
);

router.delete(
  "/buckets/:bucketId",
  deleteBucketController
);

export default router;