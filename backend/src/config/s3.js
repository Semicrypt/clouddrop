import { S3Client } from "@aws-sdk/client-s3";
import { fromLoginCredentials } from "@aws-sdk/credential-providers";

const config = {
  region: process.env.AWS_REGION,
};

// Local development:
// use temporary credentials created by `aws login`.
if (process.env.AWS_AUTH_MODE === "login") {
  config.credentials = fromLoginCredentials({
    profile: process.env.AWS_PROFILE || "default",
  });
}

// Production on EC2:
// do NOT set AWS_AUTH_MODE=login.
// The normal SDK credential chain will then use the EC2 IAM role.
const s3 = new S3Client(config);

export default s3;