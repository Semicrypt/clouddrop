import pool from "../config/database.js";

export async function findAwsConnectionByUserId(
  userId
) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
      FROM aws_connections
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

export async function findAwsConnectionById(
  connectionId
) {
  const result = await pool.query(
    `
      SELECT
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
      FROM aws_connections
      WHERE id = $1
      LIMIT 1
    `,
    [connectionId]
  );

  return result.rows[0] || null;
}

export async function createAwsConnection({
  userId,
  externalId,
}) {
  const result = await pool.query(
    `
      INSERT INTO aws_connections (
        user_id,
        external_id,
        status
      )
      VALUES ($1, $2, 'PENDING')

      ON CONFLICT (user_id)
      DO UPDATE SET
        external_id = EXCLUDED.external_id,
        aws_account_id = NULL,
        role_arn = NULL,
        bucket_name = NULL,
        region = NULL,
        status = 'PENDING',
        last_error = NULL,
        verified_at = NULL,
        disconnected_at = NULL,
        updated_at = NOW()

      RETURNING
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
    `,
    [
      userId,
      externalId,
    ]
  );

  return result.rows[0];
}

export async function markAwsConnectionConnected({
  userId,
  awsAccountId,
  roleArn,
  bucketName,
  region,
}) {
  const result = await pool.query(
    `
      UPDATE aws_connections

      SET
        aws_account_id = $2,
        role_arn = $3,
        bucket_name = $4,
        region = $5,
        status = 'CONNECTED',
        last_error = NULL,
        verified_at = NOW(),
        disconnected_at = NULL,
        updated_at = NOW()

      WHERE user_id = $1

      RETURNING
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
    `,
    [
      userId,
      awsAccountId,
      roleArn,
      bucketName,
      region,
    ]
  );

  return result.rows[0] || null;
}

export async function markAwsConnectionError({
  userId,
  roleArn,
  bucketName,
  region,
  errorMessage,
}) {
  const result = await pool.query(
    `
      UPDATE aws_connections

      SET
        role_arn = $2,
        bucket_name = $3,
        region = $4,
        status = 'ERROR',
        last_error = $5,
        verified_at = NULL,
        updated_at = NOW()

      WHERE user_id = $1

      RETURNING
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
    `,
    [
      userId,
      roleArn,
      bucketName,
      region,
      errorMessage,
    ]
  );

  return result.rows[0] || null;
}

export async function disconnectAwsConnection(
  userId
) {
  const result = await pool.query(
    `
      UPDATE aws_connections

      SET
        status = 'DISCONNECTED',
        disconnected_at = NOW(),
        updated_at = NOW()

      WHERE user_id = $1

      RETURNING
        id,
        user_id,
        aws_account_id,
        role_arn,
        external_id,
        bucket_name,
        region,
        status,
        last_error,
        verified_at,
        disconnected_at,
        created_at,
        updated_at
    `,
    [userId]
  );

  return result.rows[0] || null;
}