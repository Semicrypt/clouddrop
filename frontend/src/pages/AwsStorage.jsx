import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Copy,
  Database,
  Download,
  ExternalLink,
  File,
  Files,
  HardDrive,
  Info,
  KeyRound,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  Unplug,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import "./AwsStorage.css";

const REGIONS = [
  {
    value: "eu-north-1",
    label: "Europe — Stockholm",
  },
  {
    value: "eu-west-1",
    label: "Europe — Ireland",
  },
  {
    value: "eu-west-2",
    label: "Europe — London",
  },
  {
    value: "eu-central-1",
    label: "Europe — Frankfurt",
  },
  {
    value: "us-east-1",
    label: "US East — N. Virginia",
  },
  {
    value: "us-east-2",
    label: "US East — Ohio",
  },
  {
    value: "us-west-2",
    label: "US West — Oregon",
  },
  {
    value: "ap-southeast-1",
    label: "Asia Pacific — Singapore",
  },
];

const EMPTY_CREATE_FORM = {
  label: "",
  region: "eu-north-1",
  enableVersioning: false,
  setAsDefault: false,
};

function formatBytes(value) {
  const bytes =
    Number(value || 0);

  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index =
    Math.min(
      Math.floor(
        Math.log(bytes) /
          Math.log(1024)
      ),
      units.length - 1
    );

  const size =
    bytes /
    1024 ** index;

  return `${size.toFixed(
    index === 0
      ? 0
      : size >= 10
        ? 1
        : 2
  )} ${units[index]}`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}

function getErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data
      ?.message ||
    fallback
  );
}

function shortBucketName(
  value
) {
  if (!value) {
    return "No bucket";
  }

  if (
    value.length <= 42
  ) {
    return value;
  }

  return `${value.slice(
    0,
    25
  )}…${value.slice(-12)}`;
}

function StorageLogo() {
  return (
    <div className="aws-storage-logo">
      <span>
        <Cloud size={20} />
      </span>

      <strong>
        Cloud
        <em>Drop</em>
      </strong>
    </div>
  );
}

function StatusBadge({
  type,
  children,
}) {
  return (
    <span
      className={`aws-status-badge ${type}`}
    >
      <span className="aws-status-dot" />

      {children}
    </span>
  );
}

export default function AwsStorage() {
  const navigate =
    useNavigate();

  const [
    connection,
    setConnection,
  ] = useState(null);

  const [
    principalArn,
    setPrincipalArn,
  ] = useState("");

  const [
    buckets,
    setBuckets,
  ] = useState([]);

  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState("overview");

  const [
    setupLoading,
    setSetupLoading,
  ] = useState(false);

  const [
    verifyLoading,
    setVerifyLoading,
  ] = useState(false);

  const [
    disconnecting,
    setDisconnecting,
  ] = useState(false);

  const [
    verifyForm,
    setVerifyForm,
  ] = useState({
    roleArn: "",
    bucketName: "",
    region: "eu-north-1",
  });

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    createLoading,
    setCreateLoading,
  ] = useState(false);

  const [
    createForm,
    setCreateForm,
  ] = useState(
    EMPTY_CREATE_FORM
  );

  const [
    actionBucketId,
    setActionBucketId,
  ] = useState(null);

  const [
    filesModal,
    setFilesModal,
  ] = useState(null);

  const [
    filesLoading,
    setFilesLoading,
  ] = useState(false);

  const loadData =
    useCallback(
      async ({
        quiet = false,
      } = {}) => {
        if (!quiet) {
          setPageError("");
        }

        try {
          const [
            connectionResponse,
            bucketsResponse,
          ] =
            await Promise.all([
              api.get(
                "/api/aws/connection"
              ),

              api.get(
                "/api/aws/buckets"
              ),
            ]);

          const connectionData =
            connectionResponse
              ?.data?.data
              ?.connection ||
            null;

          const cloudDropPrincipal =
            connectionResponse
              ?.data?.data
              ?.cloudDropPrincipalArn ||
            "";

          const bucketData =
            bucketsResponse
              ?.data?.data
              ?.buckets ||
            [];

          setConnection(
            connectionData
          );

          setPrincipalArn(
            cloudDropPrincipal
          );

          setBuckets(
            bucketData
          );
        } catch (error) {
          setPageError(
            getErrorMessage(
              error,
              "Unable to load AWS storage information."
            )
          );
        }
      },
      []
    );

  useEffect(() => {
    let active = true;

    const load =
      async () => {
        try {
          const [
            connectionResponse,
            bucketsResponse,
          ] =
            await Promise.all([
              api.get(
                "/api/aws/connection"
              ),

              api.get(
                "/api/aws/buckets"
              ),
            ]);

          if (!active) {
            return;
          }

          setConnection(
            connectionResponse
              ?.data?.data
              ?.connection ||
              null
          );

          setPrincipalArn(
            connectionResponse
              ?.data?.data
              ?.cloudDropPrincipalArn ||
              ""
          );

          setBuckets(
            bucketsResponse
              ?.data?.data
              ?.buckets ||
              []
          );
        } catch (error) {
          if (!active) {
            return;
          }

          setPageError(
            getErrorMessage(
              error,
              "Unable to load AWS storage information."
            )
          );
        } finally {
          if (active) {
            setPageLoading(
              false
            );
          }
        }
      };

    load();

    return () => {
      active = false;
    };
  }, []);

  const refresh =
    async () => {
      setRefreshing(true);

      await loadData();

      setRefreshing(false);
    };

  const connected =
    connection?.status ===
    "CONNECTED";

  const defaultBucket =
    useMemo(
      () =>
        buckets.find(
          (bucket) =>
            bucket.is_default
        ) || null,
      [buckets]
    );

  const totalFiles =
    useMemo(
      () =>
        buckets.reduce(
          (
            total,
            bucket
          ) =>
            total +
            Number(
              bucket.file_count ||
                0
            ),
          0
        ),
      [buckets]
    );

  const cloudDropBuckets =
    useMemo(
      () =>
        buckets.filter(
          (bucket) =>
            bucket.provisioning_source ===
            "CLOUDDROP"
        ).length,
      [buckets]
    );

  const copyText =
    async (
      value,
      message
    ) => {
      if (!value) {
        return;
      }

      try {
        await navigator
          .clipboard
          .writeText(
            value
          );

        setNotice(
          message
        );

        window.setTimeout(
          () => {
            setNotice("");
          },
          2600
        );
      } catch {
        setPageError(
          "Unable to copy to clipboard."
        );
      }
    };

  const beginAwsSetup =
    async () => {
      setSetupLoading(
        true
      );

      setPageError("");

      try {
        const response =
          await api.post(
            "/api/aws/connection/setup"
          );

        const createdConnection =
          response?.data?.data
            ?.connection ||
          response?.data?.data ||
          null;

        if (
          createdConnection
        ) {
          setConnection(
            createdConnection
          );
        }

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to start AWS setup."
          )
        );
      } finally {
        setSetupLoading(
          false
        );
      }
    };

  const verifyConnection =
    async (event) => {
      event.preventDefault();

      setVerifyLoading(
        true
      );

      setPageError("");

      try {
        await api.post(
          "/api/aws/connection/verify",
          {
            roleArn:
              verifyForm.roleArn.trim(),

            bucketName:
              verifyForm.bucketName.trim(),

            region:
              verifyForm.region,
          }
        );

        setNotice(
          "AWS account connected successfully."
        );

        setActiveTab(
          "overview"
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "AWS verification failed."
          )
        );
      } finally {
        setVerifyLoading(
          false
        );
      }
    };

  const disconnectAws =
    async () => {
      const confirmed =
        window.confirm(
          "Disconnect this AWS account from CloudDrop? Files stored in customer AWS buckets may become unavailable until the account is reconnected."
        );

      if (!confirmed) {
        return;
      }

      setDisconnecting(
        true
      );

      setPageError("");

      try {
        await api.delete(
          "/api/aws/connection"
        );

        setNotice(
          "AWS account disconnected."
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to disconnect AWS account."
          )
        );
      } finally {
        setDisconnecting(
          false
        );
      }
    };

  const createBucket =
    async (event) => {
      event.preventDefault();

      if (
        !createForm.label.trim()
      ) {
        setPageError(
          "Enter a bucket label."
        );

        return;
      }

      setCreateLoading(
        true
      );

      setPageError("");

      try {
        await api.post(
          "/api/aws/buckets",
          {
            label:
              createForm.label.trim(),

            region:
              createForm.region,

            enableVersioning:
              createForm.enableVersioning,

            setAsDefault:
              createForm.setAsDefault,
          }
        );

        setCreateOpen(
          false
        );

        setCreateForm(
          EMPTY_CREATE_FORM
        );

        setNotice(
          "CloudDrop bucket created successfully."
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to create bucket."
          )
        );
      } finally {
        setCreateLoading(
          false
        );
      }
    };

  const makeDefault =
    async (bucket) => {
      setActionBucketId(
        bucket.id
      );

      setPageError("");

      try {
        await api.patch(
          `/api/aws/buckets/${bucket.id}/default`
        );

        setNotice(
          `${shortBucketName(
            bucket.bucket_name
          )} is now the default bucket.`
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to change the default bucket."
          )
        );
      } finally {
        setActionBucketId(
          null
        );
      }
    };

  const changeVersioning =
    async (bucket) => {
      const enabled =
        bucket.versioning_status !==
        "ENABLED";

      setActionBucketId(
        bucket.id
      );

      setPageError("");

      try {
        await api.patch(
          `/api/aws/buckets/${bucket.id}/versioning`,
          {
            enabled,
          }
        );

        setNotice(
          enabled
            ? "Bucket versioning enabled."
            : "Bucket versioning suspended."
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to update bucket versioning."
          )
        );
      } finally {
        setActionBucketId(
          null
        );
      }
    };

  const viewFiles =
    async (bucket) => {
      setFilesLoading(
        true
      );

      setPageError("");

      setFilesModal({
        bucket,
        files: [],
      });

      try {
        const response =
          await api.get(
            `/api/aws/buckets/${bucket.id}/files`
          );

        setFilesModal({
          bucket:
            response?.data?.data
              ?.bucket ||
            bucket,

          files:
            response?.data?.data
              ?.files ||
            [],
        });
      } catch (error) {
        setFilesModal(null);

        setPageError(
          getErrorMessage(
            error,
            "Unable to load files for this bucket."
          )
        );
      } finally {
        setFilesLoading(
          false
        );
      }
    };

  const deleteBucket =
    async (bucket) => {
      const confirmed =
        window.confirm(
          `Delete "${bucket.bucket_name}"?\n\nCloudDrop will only delete the bucket if it is CloudDrop-created, not the current default, and completely empty.`
        );

      if (!confirmed) {
        return;
      }

      setActionBucketId(
        bucket.id
      );

      setPageError("");

      try {
        await api.delete(
          `/api/aws/buckets/${bucket.id}`
        );

        setNotice(
          "Bucket deleted successfully."
        );

        await loadData({
          quiet: true,
        });
      } catch (error) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to delete bucket."
          )
        );
      } finally {
        setActionBucketId(
          null
        );
      }
    };

  const accountId =
    connection
      ?.awsAccountId ||
    connection
      ?.aws_account_id ||
    "—";

  const externalId =
    connection
      ?.externalId ||
    connection
      ?.external_id ||
    "";

  const manualTrustPolicy =
    JSON.stringify(
      {
        Version:
          "2012-10-17",

        Statement: [
          {
            Effect:
              "Allow",

            Principal: {
              AWS:
                principalArn ||
                "CLOUDDROP_PRINCIPAL_ARN",
            },

            Action:
              "sts:AssumeRole",

            Condition: {
              StringEquals: {
                "sts:ExternalId":
                  externalId ||
                  "CLOUDDROP_EXTERNAL_ID",
              },
            },
          },
        ],
      },
      null,
      2
    );

  if (pageLoading) {
    return (
      <div className="aws-loading-screen">
        <div className="aws-loading-orb">
          <Cloud size={28} />

          <span />
        </div>

        <strong>
          Loading CloudDrop
          Storage
        </strong>

        <p>
          Checking your storage
          configuration…
        </p>
      </div>
    );
  }

  return (
    <div className="aws-storage-page">
      <header className="aws-storage-header">
        <div className="aws-storage-header-inner">
          <StorageLogo />

          <div className="aws-storage-header-actions">
            {connected && (
              <StatusBadge type="connected">
                AWS connected
              </StatusBadge>
            )}

            <button
              className="aws-icon-button"
              type="button"
              title="Refresh"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "aws-spin"
                    : ""
                }
              />
            </button>

            <button
              className="aws-dashboard-button"
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              <ArrowLeft
                size={17}
              />

              <span>
                Dashboard
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="aws-storage-main">
        <section className="aws-storage-hero">
          <div className="aws-storage-hero-glow" />

          <div className="aws-storage-hero-content">
            <div>
              <div className="aws-storage-kicker">
                <HardDrive
                  size={15}
                />

                Cloud storage control
              </div>

              <h1>
                CloudDrop
                <span>
                  {" "}
                  Storage
                </span>
              </h1>

              <p>
                Choose how your files
                are stored, connect
                your own AWS
                environment, and
                manage CloudDrop
                buckets without
                exposing permanent
                AWS credentials.
              </p>
            </div>

            {connected && (
              <div className="aws-hero-connection">
                <div className="aws-hero-connection-icon">
                  <ShieldCheck
                    size={24}
                  />
                </div>

                <div>
                  <span>
                    Secure AWS
                    connection
                  </span>

                  <strong>
                    {accountId}
                  </strong>

                  <small>
                    STS temporary
                    credentials
                  </small>
                </div>
              </div>
            )}
          </div>
        </section>

        {pageError && (
          <div className="aws-alert error">
            <Info size={18} />

            <span>
              {pageError}
            </span>

            <button
              type="button"
              onClick={() =>
                setPageError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="aws-alert success">
            <CheckCircle2
              size={18}
            />

            <span>
              {notice}
            </span>

            <button
              type="button"
              onClick={() =>
                setNotice("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!connection && (
          <section className="aws-storage-choice">
            <div className="aws-section-heading centered">
              <span>
                Choose your storage
              </span>

              <h2>
                How should CloudDrop
                store your files?
              </h2>

              <p>
                Start immediately with
                managed storage, or
                connect your own AWS
                account for deeper
                infrastructure
                control.
              </p>
            </div>

            <div className="aws-storage-choice-grid">
              <article className="aws-storage-choice-card">
                <div className="aws-choice-icon managed">
                  <Cloud
                    size={26}
                  />
                </div>

                <div className="aws-choice-badge">
                  Easiest
                </div>

                <h3>
                  Managed Storage
                </h3>

                <p>
                  CloudDrop handles
                  the storage
                  infrastructure for
                  you. Upload files
                  immediately without
                  configuring AWS.
                </p>

                <ul>
                  <li>
                    <Check
                      size={15}
                    />
                    Secure private
                    storage
                  </li>

                  <li>
                    <Check
                      size={15}
                    />
                    No AWS account
                    required
                  </li>

                  <li>
                    <Check
                      size={15}
                    />
                    File sharing and
                    search
                  </li>
                </ul>

                <button
                  className="aws-primary-button"
                  type="button"
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  Continue with
                  Managed Storage

                  <ArrowRight
                    size={17}
                  />
                </button>
              </article>

              <article className="aws-storage-choice-card highlighted">
                <div className="aws-choice-icon customer">
                  <Cloud
                    size={26}
                  />
                </div>

                <div className="aws-choice-badge advanced">
                  Advanced
                </div>

                <h3>
                  Connect My AWS
                </h3>

                <p>
                  Store CloudDrop
                  files in private S3
                  buckets inside your
                  own AWS account
                  using cross-account
                  IAM.
                </p>

                <ul>
                  <li>
                    <Check
                      size={15}
                    />
                    Your AWS account
                  </li>

                  <li>
                    <Check
                      size={15}
                    />
                    Multi-bucket
                    management
                  </li>

                  <li>
                    <Check
                      size={15}
                    />
                    No access keys
                    stored
                  </li>
                </ul>

                <button
                  className="aws-primary-button"
                  type="button"
                  disabled={
                    setupLoading
                  }
                  onClick={
                    beginAwsSetup
                  }
                >
                  {setupLoading ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="aws-spin"
                      />
                      Preparing…
                    </>
                  ) : (
                    <>
                      Connect AWS
                      Account
                      <ArrowRight
                        size={17}
                      />
                    </>
                  )}
                </button>
              </article>
            </div>
          </section>
        )}

        {connection &&
          !connected && (
            <section className="aws-setup-section">
              <div className="aws-section-heading">
                <span>
                  AWS onboarding
                </span>

                <h2>
                  Connect your AWS
                  account securely
                </h2>

                <p>
                  CloudDrop uses an
                  IAM role, unique
                  external ID, and
                  temporary STS
                  credentials. You
                  never provide an
                  access key or
                  secret key.
                </p>
              </div>

              <div className="aws-setup-layout">
                <div className="aws-setup-card">
                  <div className="aws-setup-card-heading">
                    <span>
                      <Zap
                        size={18}
                      />
                    </span>

                    <div>
                      <strong>
                        Recommended
                      </strong>

                      <h3>
                        CloudFormation
                        setup
                      </h3>
                    </div>
                  </div>

                  <div className="aws-setup-values">
                    <div>
                      <span>
                        CloudDrop
                        principal
                      </span>

                      <code>
                        {principalArn ||
                          "Loading…"}
                      </code>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            principalArn,
                            "Principal ARN copied."
                          )
                        }
                      >
                        <Copy
                          size={15}
                        />
                      </button>
                    </div>

                    <div>
                      <span>
                        External ID
                      </span>

                      <code>
                        {externalId ||
                          "Loading…"}
                      </code>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            externalId,
                            "External ID copied."
                          )
                        }
                      >
                        <Copy
                          size={15}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="aws-setup-steps">
                    <div>
                      <span>
                        1
                      </span>
                      <p>
                        Download the
                        CloudDrop
                        customer AWS
                        template.
                      </p>
                    </div>

                    <div>
                      <span>
                        2
                      </span>
                      <p>
                        Open AWS
                        CloudFormation
                        and create a
                        stack.
                      </p>
                    </div>

                    <div>
                      <span>
                        3
                      </span>
                      <p>
                        Enter the
                        CloudDrop
                        principal ARN
                        and unique
                        External ID.
                      </p>
                    </div>

                    <div>
                      <span>
                        4
                      </span>
                      <p>
                        Wait until the
                        stack reaches
                        CREATE_COMPLETE.
                      </p>
                    </div>

                    <div>
                      <span>
                        5
                      </span>
                      <p>
                        Copy RoleArn
                        and BucketName
                        from the stack
                        Outputs tab.
                      </p>
                    </div>

                    <div>
                      <span>
                        6
                      </span>
                      <p>
                        Paste those
                        values below
                        and verify the
                        connection.
                      </p>
                    </div>
                  </div>

                  <div className="aws-setup-links">
                    <a
                      className="aws-secondary-button"
                      href="/cloudformation/clouddrop-customer-storage.yml"
                      download
                    >
                      <Download
                        size={17}
                      />

                      Download
                      template
                    </a>

                    <a
                      className="aws-primary-button"
                      href={`https://${verifyForm.region}.console.aws.amazon.com/cloudformation/home?region=${verifyForm.region}#/stacks/create`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                      CloudFormation

                      <ExternalLink
                        size={16}
                      />
                    </a>
                  </div>
                </div>

                <div className="aws-setup-card">
                  <div className="aws-setup-card-heading">
                    <span>
                      <KeyRound
                        size={18}
                      />
                    </span>

                    <div>
                      <strong>
                        Final step
                      </strong>

                      <h3>
                        Verify
                        connection
                      </h3>
                    </div>
                  </div>

                  <form
                    className="aws-form"
                    onSubmit={
                      verifyConnection
                    }
                  >
                    <label>
                      <span>
                        IAM Role ARN
                      </span>

                      <input
                        type="text"
                        placeholder="arn:aws:iam::123456789012:role/CloudDropAccessRole"
                        value={
                          verifyForm.roleArn
                        }
                        onChange={(
                          event
                        ) =>
                          setVerifyForm(
                            (
                              current
                            ) => ({
                              ...current,

                              roleArn:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      <span>
                        Initial bucket
                      </span>

                      <input
                        type="text"
                        placeholder="clouddrop-storage-bucket"
                        value={
                          verifyForm.bucketName
                        }
                        onChange={(
                          event
                        ) =>
                          setVerifyForm(
                            (
                              current
                            ) => ({
                              ...current,

                              bucketName:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        required
                      />
                    </label>

                    <label>
                      <span>
                        AWS region
                      </span>

                      <select
                        value={
                          verifyForm.region
                        }
                        onChange={(
                          event
                        ) =>
                          setVerifyForm(
                            (
                              current
                            ) => ({
                              ...current,

                              region:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                      >
                        {REGIONS.map(
                          (
                            region
                          ) => (
                            <option
                              key={
                                region.value
                              }
                              value={
                                region.value
                              }
                            >
                              {
                                region.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <button
                      className="aws-primary-button full"
                      type="submit"
                      disabled={
                        verifyLoading
                      }
                    >
                      {verifyLoading ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="aws-spin"
                          />

                          Verifying
                          AWS…
                        </>
                      ) : (
                        <>
                          <ShieldCheck
                            size={17}
                          />

                          Verify AWS
                          Connection
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <details className="aws-manual-details">
                <summary>
                  <Settings2
                    size={17}
                  />

                  Advanced: manual IAM
                  configuration

                  <ChevronRight
                    size={17}
                  />
                </summary>

                <div className="aws-manual-content">
                  <p>
                    If you prefer to
                    create the role
                    manually, use this
                    trust policy and
                    grant only the
                    S3 permissions
                    required by
                    CloudDrop.
                  </p>

                  <div className="aws-code-block">
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          manualTrustPolicy,
                          "Trust policy copied."
                        )
                      }
                    >
                      <Copy
                        size={15}
                      />

                      Copy
                    </button>

                    <pre>
                      {
                        manualTrustPolicy
                      }
                    </pre>
                  </div>
                </div>
              </details>
            </section>
          )}

        {connected && (
          <>
            <nav className="aws-storage-tabs">
              <button
                type="button"
                className={
                  activeTab ===
                  "overview"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "overview"
                  )
                }
              >
                <Layers3
                  size={17}
                />

                Overview
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "buckets"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "buckets"
                  )
                }
              >
                <Database
                  size={17}
                />

                Buckets

                <span>
                  {buckets.length}
                </span>
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "connection"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "connection"
                  )
                }
              >
                <Server
                  size={17}
                />

                AWS Connection
              </button>
            </nav>

            {activeTab ===
              "overview" && (
              <section className="aws-overview-section">
                <div className="aws-stat-grid">
                  <article>
                    <div className="aws-stat-icon blue">
                      <Database
                        size={20}
                      />
                    </div>

                    <span>
                      AWS buckets
                    </span>

                    <strong>
                      {
                        buckets.length
                      }
                    </strong>

                    <small>
                      {
                        cloudDropBuckets
                      }{" "}
                      created by
                      CloudDrop
                    </small>
                  </article>

                  <article>
                    <div className="aws-stat-icon cyan">
                      <Files
                        size={20}
                      />
                    </div>

                    <span>
                      Stored files
                    </span>

                    <strong>
                      {totalFiles}
                    </strong>

                    <small>
                      Across your
                      connected
                      buckets
                    </small>
                  </article>

                  <article>
                    <div className="aws-stat-icon green">
                      <ShieldCheck
                        size={20}
                      />
                    </div>

                    <span>
                      AWS connection
                    </span>

                    <strong className="aws-stat-word">
                      Secure
                    </strong>

                    <small>
                      Temporary STS
                      credentials
                    </small>
                  </article>

                  <article>
                    <div className="aws-stat-icon purple">
                      <Cloud
                        size={20}
                      />
                    </div>

                    <span>
                      Default bucket
                    </span>

                    <strong className="aws-stat-bucket">
                      {shortBucketName(
                        defaultBucket
                          ?.bucket_name
                      )}
                    </strong>

                    <small>
                      New uploads
                      route here
                    </small>
                  </article>
                </div>

                <div className="aws-overview-grid">
                  <article className="aws-panel aws-default-storage-panel">
                    <div className="aws-panel-heading">
                      <div>
                        <span>
                          Active
                          storage
                        </span>

                        <h2>
                          Default AWS
                          bucket
                        </h2>
                      </div>

                      <div className="aws-default-icon">
                        <UploadCloud
                          size={21}
                        />
                      </div>
                    </div>

                    {defaultBucket ? (
                      <>
                        <div className="aws-default-bucket-name">
                          <Database
                            size={18}
                          />

                          <div>
                            <strong>
                              {
                                defaultBucket.bucket_name
                              }
                            </strong>

                            <span>
                              {
                                defaultBucket.region
                              }{" "}
                              ·{" "}
                              {
                                defaultBucket.file_count
                              }{" "}
                              file
                              {Number(
                                defaultBucket.file_count
                              ) ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          </div>
                        </div>

                        <p>
                          New customer
                          AWS uploads
                          are
                          automatically
                          stored in this
                          bucket until
                          you choose a
                          different
                          default.
                        </p>

                        <button
                          className="aws-secondary-button"
                          type="button"
                          onClick={() =>
                            setActiveTab(
                              "buckets"
                            )
                          }
                        >
                          Manage
                          buckets

                          <ArrowRight
                            size={16}
                          />
                        </button>
                      </>
                    ) : (
                      <div className="aws-empty-inline">
                        <Info
                          size={20}
                        />

                        <div>
                          <strong>
                            No default
                            bucket
                          </strong>

                          <p>
                            Create or
                            select an
                            AWS bucket
                            before
                            uploading
                            customer
                            storage
                            files.
                          </p>
                        </div>
                      </div>
                    )}
                  </article>

                  <article className="aws-panel aws-security-panel">
                    <div className="aws-panel-heading">
                      <div>
                        <span>
                          Security
                        </span>

                        <h2>
                          Connection
                          model
                        </h2>
                      </div>

                      <div className="aws-default-icon security">
                        <LockKeyhole
                          size={21}
                        />
                      </div>
                    </div>

                    <div className="aws-security-stack">
                      <div>
                        <Check
                          size={14}
                        />

                        Cross-account
                        IAM role
                      </div>

                      <div>
                        <Check
                          size={14}
                        />

                        Unique
                        External ID
                      </div>

                      <div>
                        <Check
                          size={14}
                        />

                        STS temporary
                        credentials
                      </div>

                      <div>
                        <Check
                          size={14}
                        />

                        Private S3
                        buckets
                      </div>

                      <div>
                        <Check
                          size={14}
                        />

                        Block Public
                        Access
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {activeTab ===
              "buckets" && (
              <section className="aws-buckets-section">
                <div className="aws-section-toolbar">
                  <div>
                    <span>
                      My AWS
                    </span>

                    <h2>
                      Buckets
                    </h2>

                    <p>
                      CloudDrop only
                      manages buckets
                      it creates or
                      explicitly
                      registers.
                    </p>
                  </div>

                  <button
                    className="aws-primary-button"
                    type="button"
                    onClick={() => {
                      setPageError(
                        ""
                      );

                      setCreateOpen(
                        true
                      );
                    }}
                  >
                    <Plus
                      size={17}
                    />

                    Create bucket
                  </button>
                </div>

                {buckets.length ===
                0 ? (
                  <div className="aws-empty-state">
                    <div>
                      <Database
                        size={30}
                      />
                    </div>

                    <h3>
                      No AWS buckets
                      yet
                    </h3>

                    <p>
                      Create your
                      first
                      CloudDrop-managed
                      bucket to begin
                      storing files in
                      your AWS
                      account.
                    </p>

                    <button
                      className="aws-primary-button"
                      type="button"
                      onClick={() =>
                        setCreateOpen(
                          true
                        )
                      }
                    >
                      <Plus
                        size={17}
                      />

                      Create bucket
                    </button>
                  </div>
                ) : (
                  <div className="aws-bucket-grid">
                    {buckets.map(
                      (bucket) => {
                        const busy =
                          actionBucketId ===
                          bucket.id;

                        const stackManaged =
                          bucket.provisioning_source ===
                          "CLOUDFORMATION";

                        const versioningEnabled =
                          bucket.versioning_status ===
                          "ENABLED";

                        return (
                          <article
                            className={`aws-bucket-card ${
                              bucket.is_default
                                ? "default"
                                : ""
                            }`}
                            key={
                              bucket.id
                            }
                          >
                            <div className="aws-bucket-card-top">
                              <div className="aws-bucket-icon">
                                <Database
                                  size={21}
                                />
                              </div>

                              <div className="aws-bucket-flags">
                                {bucket.is_default && (
                                  <span className="default">
                                    <Check
                                      size={12}
                                    />
                                    Default
                                  </span>
                                )}

                                <span
                                  className={
                                    stackManaged
                                      ? "stack"
                                      : "cloud"
                                  }
                                >
                                  {stackManaged
                                    ? "Stack managed"
                                    : "CloudDrop"}
                                </span>
                              </div>
                            </div>

                            <div className="aws-bucket-name">
                              <h3 title={bucket.bucket_name}>
                                {
                                  bucket.bucket_name
                                }
                              </h3>

                              <span>
                                {
                                  bucket.region
                                }
                              </span>
                            </div>

                            <div className="aws-bucket-metrics">
                              <div>
                                <Files
                                  size={16}
                                />

                                <span>
                                  Files
                                </span>

                                <strong>
                                  {Number(
                                    bucket.file_count ||
                                      0
                                  )}
                                </strong>
                              </div>

                              <div>
                                <Layers3
                                  size={16}
                                />

                                <span>
                                  Versioning
                                </span>

                                <strong
                                  className={
                                    versioningEnabled
                                      ? "enabled"
                                      : ""
                                  }
                                >
                                  {
                                    bucket.versioning_status
                                  }
                                </strong>
                              </div>
                            </div>

                            <div className="aws-bucket-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  viewFiles(
                                    bucket
                                  )
                                }
                              >
                                <Files
                                  size={15}
                                />

                                Files
                              </button>

                              {!bucket.is_default && (
                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    makeDefault(
                                      bucket
                                    )
                                  }
                                >
                                  {busy ? (
                                    <LoaderCircle
                                      size={15}
                                      className="aws-spin"
                                    />
                                  ) : (
                                    <UploadCloud
                                      size={15}
                                    />
                                  )}

                                  Set default
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  changeVersioning(
                                    bucket
                                  )
                                }
                              >
                                {busy ? (
                                  <LoaderCircle
                                    size={15}
                                    className="aws-spin"
                                  />
                                ) : (
                                  <Layers3
                                    size={15}
                                  />
                                )}

                                {versioningEnabled
                                  ? "Suspend"
                                  : "Versioning"}
                              </button>

                              {!stackManaged && (
                                <button
                                  className="danger"
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    deleteBucket(
                                      bucket
                                    )
                                  }
                                >
                                  {busy ? (
                                    <LoaderCircle
                                      size={15}
                                      className="aws-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={15}
                                    />
                                  )}

                                  Delete
                                </button>
                              )}
                            </div>

                            {stackManaged && (
                              <div className="aws-stack-note">
                                <Info
                                  size={14}
                                />

                                This
                                bootstrap
                                bucket is
                                owned by
                                your
                                CloudFormation
                                stack and
                                cannot be
                                deleted
                                from
                                CloudDrop.
                              </div>
                            )}
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            )}

            {activeTab ===
              "connection" && (
              <section className="aws-connection-section">
                <div className="aws-section-toolbar">
                  <div>
                    <span>
                      My AWS
                    </span>

                    <h2>
                      AWS Connection
                    </h2>

                    <p>
                      Connection
                      details for
                      CloudDrop's
                      cross-account
                      storage access.
                    </p>
                  </div>

                  <StatusBadge type="connected">
                    Connected
                  </StatusBadge>
                </div>

                <div className="aws-connection-grid">
                  <article className="aws-panel">
                    <div className="aws-panel-heading">
                      <div>
                        <span>
                          AWS account
                        </span>

                        <h2>
                          Connection
                          details
                        </h2>
                      </div>

                      <div className="aws-default-icon">
                        <Server
                          size={21}
                        />
                      </div>
                    </div>

                    <dl className="aws-connection-details">
                      <div>
                        <dt>
                          AWS Account
                        </dt>

                        <dd>
                          {accountId}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Region
                        </dt>

                        <dd>
                          {connection.region ||
                            "—"}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          IAM Role
                        </dt>

                        <dd title={connection.roleArn}>
                          {connection.roleArn ||
                            "—"}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Bootstrap
                          bucket
                        </dt>

                        <dd title={connection.bucketName}>
                          {connection.bucketName ||
                            "—"}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Verified
                        </dt>

                        <dd>
                          {formatDate(
                            connection.verifiedAt
                          )}
                        </dd>
                      </div>
                    </dl>
                  </article>

                  <article className="aws-panel aws-danger-panel">
                    <div className="aws-panel-heading">
                      <div>
                        <span>
                          Connection
                          controls
                        </span>

                        <h2>
                          Disconnect
                          AWS
                        </h2>
                      </div>

                      <div className="aws-default-icon danger">
                        <Unplug
                          size={21}
                        />
                      </div>
                    </div>

                    <p>
                      Disconnecting
                      stops CloudDrop
                      from assuming
                      this AWS role.
                      Customer-S3
                      files may become
                      unavailable
                      until the
                      connection is
                      restored.
                    </p>

                    <button
                      className="aws-danger-button"
                      type="button"
                      disabled={
                        disconnecting
                      }
                      onClick={
                        disconnectAws
                      }
                    >
                      {disconnecting ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="aws-spin"
                          />

                          Disconnecting…
                        </>
                      ) : (
                        <>
                          <Unplug
                            size={17}
                          />

                          Disconnect AWS
                        </>
                      )}
                    </button>
                  </article>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {createOpen && (
        <div
          className="aws-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            !createLoading &&
            setCreateOpen(
              false
            )
          }
        >
          <div
            className="aws-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-bucket-title"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="aws-modal-header">
              <div>
                <div className="aws-modal-icon">
                  <Plus
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    My AWS
                  </span>

                  <h2 id="create-bucket-title">
                    Create CloudDrop
                    bucket
                  </h2>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  createLoading
                }
                onClick={() =>
                  setCreateOpen(
                    false
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <p className="aws-modal-description">
              CloudDrop generates a
              globally unique S3
              bucket name and keeps
              the bucket private,
              encrypted, and scoped
              to your connected AWS
              role.
            </p>

            <form
              className="aws-form"
              onSubmit={
                createBucket
              }
            >
              <label>
                <span>
                  Bucket label
                </span>

                <input
                  type="text"
                  placeholder="projects"
                  maxLength={28}
                  value={
                    createForm.label
                  }
                  onChange={(
                    event
                  ) =>
                    setCreateForm(
                      (
                        current
                      ) => ({
                        ...current,

                        label:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  required
                />

                <small>
                  Example result:
                  clouddrop-
                  {accountId ===
                  "—"
                    ? "ACCOUNT"
                    : accountId}
                  -projects-xxxxxxxx
                </small>
              </label>

              <label>
                <span>
                  AWS region
                </span>

                <select
                  value={
                    createForm.region
                  }
                  onChange={(
                    event
                  ) =>
                    setCreateForm(
                      (
                        current
                      ) => ({
                        ...current,

                        region:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                >
                  {REGIONS.map(
                    (region) => (
                      <option
                        key={
                          region.value
                        }
                        value={
                          region.value
                        }
                      >
                        {
                          region.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="aws-checkbox-stack">
                <label className="aws-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      createForm.enableVersioning
                    }
                    onChange={(
                      event
                    ) =>
                      setCreateForm(
                        (
                          current
                        ) => ({
                          ...current,

                          enableVersioning:
                            event
                              .target
                              .checked,
                        })
                      )
                    }
                  />

                  <span>
                    <strong>
                      Enable
                      versioning
                    </strong>

                    <small>
                      Preserve object
                      versions when
                      files change or
                      are deleted.
                    </small>
                  </span>
                </label>

                <label className="aws-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      createForm.setAsDefault
                    }
                    onChange={(
                      event
                    ) =>
                      setCreateForm(
                        (
                          current
                        ) => ({
                          ...current,

                          setAsDefault:
                            event
                              .target
                              .checked,
                        })
                      )
                    }
                  />

                  <span>
                    <strong>
                      Make default
                      bucket
                    </strong>

                    <small>
                      Route new
                      customer-AWS
                      uploads to this
                      bucket.
                    </small>
                  </span>
                </label>
              </div>

              <div className="aws-modal-actions">
                <button
                  className="aws-secondary-button"
                  type="button"
                  disabled={
                    createLoading
                  }
                  onClick={() =>
                    setCreateOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  className="aws-primary-button"
                  type="submit"
                  disabled={
                    createLoading
                  }
                >
                  {createLoading ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="aws-spin"
                      />

                      Creating…
                    </>
                  ) : (
                    <>
                      <Database
                        size={17}
                      />

                      Create bucket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filesModal && (
        <div
          className="aws-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            !filesLoading &&
            setFilesModal(null)
          }
        >
          <div
            className="aws-modal aws-files-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="aws-modal-header">
              <div>
                <div className="aws-modal-icon">
                  <Files
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Bucket files
                  </span>

                  <h2 title={filesModal.bucket.bucket_name}>
                    {shortBucketName(
                      filesModal
                        .bucket
                        .bucket_name
                    )}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFilesModal(
                    null
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="aws-files-summary">
              <span>
                {
                  filesModal.bucket
                    .region
                }
              </span>

              <span>
                {filesModal.files
                  .length}{" "}
                file
                {filesModal.files
                  .length === 1
                  ? ""
                  : "s"}
              </span>

              {filesModal.bucket
                .is_default && (
                <span className="default">
                  Default
                </span>
              )}
            </div>

            {filesLoading ? (
              <div className="aws-modal-loading">
                <LoaderCircle
                  size={25}
                  className="aws-spin"
                />

                Loading files…
              </div>
            ) : filesModal.files
                .length ===
              0 ? (
              <div className="aws-empty-state compact">
                <div>
                  <File
                    size={25}
                  />
                </div>

                <h3>
                  Bucket is empty
                </h3>

                <p>
                  CloudDrop has no
                  file records stored
                  in this bucket.
                </p>
              </div>
            ) : (
              <div className="aws-bucket-files">
                {filesModal.files.map(
                  (file) => (
                    <div
                      className="aws-bucket-file"
                      key={
                        file.id
                      }
                    >
                      <div className="aws-file-icon">
                        <File
                          size={18}
                        />
                      </div>

                      <div className="aws-file-details">
                        <strong>
                          {
                            file.original_name
                          }
                        </strong>

                        <span>
                          {file.category ||
                            "other"}{" "}
                          ·{" "}
                          {formatBytes(
                            file.size_bytes
                          )}
                        </span>
                      </div>

                      <div className="aws-file-date">
                        {formatDate(
                          file.uploaded_at
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}