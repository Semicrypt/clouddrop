import pool from "../config/database.js";

export async function findBucketsByUserId(
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          aws_connection_id,
          bucket_name,
          region,
          is_default,
          versioning_status,
          provisioning_source,
          status,
          created_at,
          updated_at
        FROM aws_buckets
        WHERE user_id = $1
        ORDER BY
          is_default DESC,
          created_at ASC
      `,
      [userId]
    );

  return result.rows;
}

export async function findBucketByIdForUser(
  bucketId,
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          aws_connection_id,
          bucket_name,
          region,
          is_default,
          versioning_status,
          provisioning_source,
          status,
          created_at,
          updated_at
        FROM aws_buckets
        WHERE id = $1
          AND user_id = $2
        LIMIT 1
      `,
      [
        bucketId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function findBucketByNameForUser(
  bucketName,
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          aws_connection_id,
          bucket_name,
          region,
          is_default,
          versioning_status,
          provisioning_source,
          status,
          created_at,
          updated_at
        FROM aws_buckets
        WHERE bucket_name = $1
          AND user_id = $2
        LIMIT 1
      `,
      [
        bucketName,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function findDefaultBucketByUserId(
  userId
) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          user_id,
          aws_connection_id,
          bucket_name,
          region,
          is_default,
          versioning_status,
          provisioning_source,
          status,
          created_at,
          updated_at
        FROM aws_buckets
        WHERE user_id = $1
          AND is_default = TRUE
          AND status = 'ACTIVE'
        LIMIT 1
      `,
      [userId]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function createBucketRecord({
  userId,
  awsConnectionId,
  bucketName,
  region,
  isDefault,
  versioningStatus,
  provisioningSource,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    if (isDefault) {
      await client.query(
        `
          UPDATE aws_buckets
          SET
            is_default = FALSE,
            updated_at = NOW()
          WHERE user_id = $1
        `,
        [userId]
      );
    }

    const result =
      await client.query(
        `
          INSERT INTO aws_buckets (
            user_id,
            aws_connection_id,
            bucket_name,
            region,
            is_default,
            versioning_status,
            provisioning_source,
            status
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            'ACTIVE'
          )

          RETURNING
            id,
            user_id,
            aws_connection_id,
            bucket_name,
            region,
            is_default,
            versioning_status,
            provisioning_source,
            status,
            created_at,
            updated_at
        `,
        [
          userId,
          awsConnectionId,
          bucketName,
          region,
          isDefault,
          versioningStatus,
          provisioningSource,
        ]
      );

    await client.query(
      "COMMIT"
    );

    return result.rows[0];
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
}

export async function setDefaultBucket({
  bucketId,
  userId,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    const target =
      await client.query(
        `
          SELECT
            id
          FROM aws_buckets
          WHERE id = $1
            AND user_id = $2
            AND status = 'ACTIVE'
          LIMIT 1
        `,
        [
          bucketId,
          userId,
        ]
      );

    if (
      target.rowCount === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return null;
    }

    await client.query(
      `
        UPDATE aws_buckets
        SET
          is_default = FALSE,
          updated_at = NOW()
        WHERE user_id = $1
      `,
      [userId]
    );

    const result =
      await client.query(
        `
          UPDATE aws_buckets
          SET
            is_default = TRUE,
            updated_at = NOW()
          WHERE id = $1
            AND user_id = $2

          RETURNING
            id,
            user_id,
            aws_connection_id,
            bucket_name,
            region,
            is_default,
            versioning_status,
            provisioning_source,
            status,
            created_at,
            updated_at
        `,
        [
          bucketId,
          userId,
        ]
      );

    await client.query(
      "COMMIT"
    );

    return result.rows[0];
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
}

export async function updateBucketVersioningRecord({
  bucketId,
  userId,
  versioningStatus,
}) {
  const result =
    await pool.query(
      `
        UPDATE aws_buckets

        SET
          versioning_status = $3,
          updated_at = NOW()

        WHERE id = $1
          AND user_id = $2

        RETURNING
          id,
          user_id,
          aws_connection_id,
          bucket_name,
          region,
          is_default,
          versioning_status,
          provisioning_source,
          status,
          created_at,
          updated_at
      `,
      [
        bucketId,
        userId,
        versioningStatus,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function deleteBucketRecord({
  bucketId,
  userId,
}) {
  const result =
    await pool.query(
      `
        DELETE FROM aws_buckets
        WHERE id = $1
          AND user_id = $2

        RETURNING id
      `,
      [
        bucketId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

export async function countFilesForBucket({
  userId,
  bucketName,
}) {
  const result =
    await pool.query(
      `
        SELECT
          COUNT(*)::integer AS count
        FROM files
        WHERE user_id = $1
          AND bucket_name = $2
      `,
      [
        userId,
        bucketName,
      ]
    );

  return (
    result.rows[0]
      ?.count || 0
  );
}

export async function findFilesForBucket({
  userId,
  bucketName,
}) {
  const result =
    await pool.query(
      `
        SELECT
          id,
          original_name,
          mime_type,
          size_bytes,
          category,
          description,
          storage_mode,
          uploaded_at,
          updated_at
        FROM files
        WHERE user_id = $1
          AND bucket_name = $2
        ORDER BY
          uploaded_at DESC
      `,
      [
        userId,
        bucketName,
      ]
    );

  return result.rows;
}