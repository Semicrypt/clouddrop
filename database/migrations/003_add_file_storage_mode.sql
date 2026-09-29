ALTER TABLE files
ADD COLUMN IF NOT EXISTS storage_mode VARCHAR(20)
NOT NULL
DEFAULT 'MANAGED';

ALTER TABLE files
ADD COLUMN IF NOT EXISTS aws_connection_id UUID
REFERENCES aws_connections(id)
ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'files_storage_mode_check'
    ) THEN
        ALTER TABLE files
        ADD CONSTRAINT files_storage_mode_check
        CHECK (
            storage_mode IN (
                'MANAGED',
                'CUSTOMER'
            )
        );
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS
    idx_files_aws_connection_id
ON files(aws_connection_id);

CREATE INDEX IF NOT EXISTS
    idx_files_storage_mode
ON files(storage_mode);

UPDATE files
SET storage_mode = 'MANAGED'
WHERE storage_mode IS NULL;
