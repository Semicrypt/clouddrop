CREATE TABLE IF NOT EXISTS aws_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    aws_account_id VARCHAR(12),

    role_arn TEXT,

    external_id TEXT NOT NULL UNIQUE,

    bucket_name TEXT,

    region VARCHAR(32),

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'PENDING',

    last_error TEXT,

    verified_at TIMESTAMPTZ,

    disconnected_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT aws_connections_status_check
        CHECK (
            status IN (
                'PENDING',
                'CONNECTED',
                'ERROR',
                'DISCONNECTED'
            )
        )
);

CREATE INDEX IF NOT EXISTS
    idx_aws_connections_user_id
ON aws_connections(user_id);

CREATE INDEX IF NOT EXISTS
    idx_aws_connections_status
ON aws_connections(status);
