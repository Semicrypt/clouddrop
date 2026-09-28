CREATE TABLE IF NOT EXISTS aws_buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    aws_connection_id UUID NOT NULL
        REFERENCES aws_connections(id)
        ON DELETE CASCADE,

    bucket_name TEXT NOT NULL UNIQUE,

    region VARCHAR(32) NOT NULL,

    is_default BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    versioning_status VARCHAR(20)
        NOT NULL
        DEFAULT 'DISABLED',

    provisioning_source VARCHAR(30)
        NOT NULL
        DEFAULT 'CLOUDDROP',

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT aws_buckets_versioning_check
        CHECK (
            versioning_status IN (
                'DISABLED',
                'ENABLED',
                'SUSPENDED'
            )
        ),

    CONSTRAINT aws_buckets_source_check
        CHECK (
            provisioning_source IN (
                'CLOUDFORMATION',
                'CLOUDDROP',
                'REGISTERED'
            )
        ),

    CONSTRAINT aws_buckets_status_check
        CHECK (
            status IN (
                'ACTIVE',
                'ERROR'
            )
        )
);

CREATE INDEX IF NOT EXISTS
    idx_aws_buckets_user_id
ON aws_buckets(user_id);

CREATE INDEX IF NOT EXISTS
    idx_aws_buckets_connection_id
ON aws_buckets(aws_connection_id);

CREATE UNIQUE INDEX IF NOT EXISTS
    idx_aws_buckets_one_default_per_user
ON aws_buckets(user_id)
WHERE is_default = TRUE;


/*
 * Register the existing CloudFormation bucket.
 *
 * It becomes the user's current/default bucket.
 * We deliberately mark it CLOUDFORMATION so CloudDrop
 * does not directly delete a bucket owned by the stack.
 */
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
SELECT
    user_id,
    id,
    bucket_name,
    region,
    TRUE,
    'DISABLED',
    'CLOUDFORMATION',
    'ACTIVE'
FROM aws_connections
WHERE status = 'CONNECTED'
  AND bucket_name IS NOT NULL
  AND region IS NOT NULL

ON CONFLICT (bucket_name)
DO NOTHING;
