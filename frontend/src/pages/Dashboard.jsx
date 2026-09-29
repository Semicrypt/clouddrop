import {
  Cloud,
  Database,
  File,
  FileText,
  Filter,
  HardDrive,
  LogOut,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import FileDetailsModal from "../components/FileDetailsModal";
import UploadModal from "../components/UploadModal";

import "./Dashboard.css";

const CATEGORIES = [
  "all",
  "documents",
  "images",
  "spreadsheets",
  "archives",
  "text",
  "other",
];

function formatSize(bytes) {
  const value =
    Number(bytes || 0);

  if (value < 1024) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  if (
    value <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
}

function formatStorageMode(
  storageMode
) {
  const value =
    String(
      storageMode || ""
    ).toLowerCase();

  if (
    value.includes(
      "customer"
    ) ||
    value.includes(
      "aws"
    )
  ) {
    return "My AWS";
  }

  return "Managed";
}

function DashboardBrand() {
  return (
    <div className="dashboard-brand">
      <span className="dashboard-brand-mark">
        <Cloud size={19} />
      </span>

      <strong>
        Cloud
        <em>Drop</em>
      </strong>
    </div>
  );
}

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    connection,
    setConnection,
  ] = useState(null);

  const [
    buckets,
    setBuckets,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "clouddrop_user"
        )
      );
    } catch {
      return null;
    }
  }, []);

  const logout =
    useCallback(() => {
      localStorage.removeItem(
        "clouddrop_token"
      );

      localStorage.removeItem(
        "clouddrop_user"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }, [navigate]);

  const loadWorkspace =
    useCallback(
      async ({
        quiet = false,
      } = {}) => {
        if (!quiet) {
          setError("");
        }

        const results =
          await Promise.allSettled([
            api.get(
              "/api/files"
            ),

            api.get(
              "/api/aws/connection"
            ),

            api.get(
              "/api/aws/buckets"
            ),
          ]);

        const [
          filesResult,
          connectionResult,
          bucketsResult,
        ] = results;

        if (
          filesResult.status ===
          "rejected"
        ) {
          if (
            filesResult.reason
              ?.response
              ?.status === 401
          ) {
            logout();

            return;
          }

          throw new Error(
            "Unable to load your files."
          );
        }

        setFiles(
          filesResult.value
            ?.data?.data
            ?.files || []
        );

        if (
          connectionResult.status ===
          "fulfilled"
        ) {
          setConnection(
            connectionResult.value
              ?.data?.data
              ?.connection ||
              null
          );
        }

        if (
          bucketsResult.status ===
          "fulfilled"
        ) {
          setBuckets(
            bucketsResult.value
              ?.data?.data
              ?.buckets || []
          );
        }
      },
      [logout]
    );

  useEffect(() => {
    let active = true;

    async function loadInitialWorkspace() {
      try {
        const results =
          await Promise.allSettled([
            api.get(
              "/api/files"
            ),

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

        const [
          filesResult,
          connectionResult,
          bucketsResult,
        ] = results;

        if (
          filesResult.status ===
          "rejected"
        ) {
          if (
            filesResult.reason
              ?.response
              ?.status === 401
          ) {
            logout();

            return;
          }

          throw new Error(
            "Unable to load your files."
          );
        }

        setFiles(
          filesResult.value
            ?.data?.data
            ?.files || []
        );

        if (
          connectionResult.status ===
          "fulfilled"
        ) {
          setConnection(
            connectionResult.value
              ?.data?.data
              ?.connection ||
              null
          );
        }

        if (
          bucketsResult.status ===
          "fulfilled"
        ) {
          setBuckets(
            bucketsResult.value
              ?.data?.data
              ?.buckets || []
          );
        }
      } catch {
        if (active) {
          setError(
            "Unable to load your workspace."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialWorkspace();

    return () => {
      active = false;
    };
  }, [logout]);

  const refreshWorkspace =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await loadWorkspace();
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
            "Unable to refresh your workspace."
        );
      } finally {
        setRefreshing(false);
      }
    }, [loadWorkspace]);

  const filteredFiles =
    useMemo(
      () =>
        files.filter(
          (file) => {
            const fileName =
              String(
                file.original_name ||
                  ""
              ).toLowerCase();

            const matchesSearch =
              fileName.includes(
                search
                  .trim()
                  .toLowerCase()
              );

            const matchesCategory =
              category ===
                "all" ||
              file.category ===
                category;

            return (
              matchesSearch &&
              matchesCategory
            );
          }
        ),
      [
        files,
        search,
        category,
      ]
    );

  const totalBytes =
    useMemo(
      () =>
        files.reduce(
          (
            total,
            file
          ) =>
            total +
            Number(
              file.size_bytes ||
                0
            ),
          0
        ),
      [files]
    );

  const defaultBucket =
    useMemo(
      () =>
        buckets.find(
          (bucket) =>
            bucket.is_default
        ) || null,
      [buckets]
    );

  const awsConnected =
    connection?.status ===
    "CONNECTED";

  const closeMobileSidebar =
    () => {
      setMobileSidebarOpen(
        false
      );
    };

  const openUpload =
    () => {
      closeMobileSidebar();

      setUploadOpen(true);
    };

  const goToStorage =
    () => {
      closeMobileSidebar();

      navigate(
        "/aws-storage"
      );
    };

  const goToShared =
    () => {
      closeMobileSidebar();

      navigate(
        "/shared"
      );
    };

  const firstName =
    user?.name
      ?.trim()
      ?.split(/\s+/)[0] ||
    "";

  return (
    <main className="dashboard-page">
      <aside
        className={`dashboard-sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div>
          <div className="dashboard-sidebar-top">
            <DashboardBrand />

            <button
              className="dashboard-sidebar-close"
              type="button"
              aria-label="Close navigation"
              onClick={
                closeMobileSidebar
              }
            >
              <X size={19} />
            </button>
          </div>

          <nav className="dashboard-sidebar-nav">
            <span className="dashboard-nav-label">
              Workspace
            </span>

            <button
              className="dashboard-nav-link active"
              type="button"
              onClick={
                closeMobileSidebar
              }
            >
              <FileText
                size={18}
              />

              <span>
                My Files
              </span>
            </button>

            <button
              className="dashboard-nav-link"
              type="button"
              onClick={
                openUpload
              }
            >
              <UploadCloud
                size={18}
              />

              <span>
                Upload
              </span>
            </button>

            <button
              className="dashboard-nav-link"
              type="button"
              onClick={
                goToShared
              }
            >
              <Share2
                size={18}
              />

              <span>
                Shared
              </span>
            </button>

            <span className="dashboard-nav-label dashboard-storage-label">
              Storage
            </span>

            <button
              className="dashboard-nav-link"
              type="button"
              onClick={
                goToStorage
              }
            >
              <HardDrive
                size={18}
              />

              <span>
                CloudDrop Storage
              </span>

              {awsConnected && (
                <i className="dashboard-nav-status" />
              )}
            </button>

            <button
              className="dashboard-nav-link dashboard-sub-link"
              type="button"
              onClick={
                goToStorage
              }
            >
              <Database
                size={16}
              />

              <span>
                My AWS
              </span>

              {buckets.length >
                0 && (
                <small>
                  {
                    buckets.length
                  }
                </small>
              )}
            </button>
          </nav>
        </div>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user-mini">
            <span>
              {user?.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </span>

            <div>
              <strong>
                {user?.name ||
                  "CloudDrop User"}
              </strong>

              <small>
                {user?.email ||
                  ""}
              </small>
            </div>
          </div>

          <button
            className="dashboard-nav-link dashboard-logout-link"
            type="button"
            onClick={
              logout
            }
          >
            <LogOut
              size={18}
            />

            <span>
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={
            closeMobileSidebar
          }
        />
      )}

      <section className="dashboard-content">
        <header className="dashboard-mobile-header">
          <DashboardBrand />

          <button
            type="button"
            aria-label="Open navigation"
            onClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          >
            <Menu size={21} />
          </button>
        </header>

        <div className="dashboard-content-inner">
          <header className="dashboard-header">
            <div className="dashboard-heading">
              <span className="dashboard-eyebrow">
                Workspace
              </span>

              <h1>
                Welcome
                {firstName
                  ? `, ${firstName}`
                  : ""}
                .
              </h1>

              <p>
                Manage your files,
                sharing and cloud
                storage from one
                secure workspace.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button
                className="dashboard-refresh-button"
                type="button"
                aria-label="Refresh workspace"
                disabled={
                  refreshing
                }
                onClick={
                  refreshWorkspace
                }
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "dashboard-spin"
                      : ""
                  }
                />
              </button>

              <button
                className="dashboard-primary-button"
                type="button"
                onClick={
                  openUpload
                }
              >
                <UploadCloud
                  size={18}
                />

                Upload file
              </button>
            </div>
          </header>

          {error && (
            <div className="dashboard-error-banner">
              <ShieldCheck
                size={17}
              />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="dashboard-stats-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">
                <FileText
                  size={20}
                />
              </div>

              <span>
                Total files
              </span>

              <strong>
                {files.length}
              </strong>

              <small>
                Stored in your
                workspace
              </small>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon cyan">
                <HardDrive
                  size={20}
                />
              </div>

              <span>
                Storage used
              </span>

              <strong>
                {formatSize(
                  totalBytes
                )}
              </strong>

              <small>
                Across all files
              </small>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon green">
                <ShieldCheck
                  size={20}
                />
              </div>

              <span>
                Security
              </span>

              <strong className="dashboard-stat-text">
                Private
              </strong>

              <small>
                Signed access only
              </small>
            </article>

            <article
              className="dashboard-stat-card dashboard-storage-stat"
              role="button"
              tabIndex={0}
              onClick={
                goToStorage
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key ===
                    " "
                ) {
                  goToStorage();
                }
              }}
            >
              <div className="dashboard-stat-icon purple">
                <Database
                  size={20}
                />
              </div>

              <span>
                Storage
              </span>

              <strong className="dashboard-stat-text">
                {awsConnected
                  ? "My AWS"
                  : "Managed"}
              </strong>

              <small>
                {awsConnected
                  ? `${buckets.length} AWS bucket${
                      buckets.length ===
                      1
                        ? ""
                        : "s"
                    }`
                  : "CloudDrop managed"}
              </small>
            </article>
          </section>

          <section className="dashboard-storage-summary">
            <div className="dashboard-storage-summary-main">
              <div className="dashboard-storage-summary-icon">
                <Database
                  size={21}
                />
              </div>

              <div>
                <span>
                  Active storage
                </span>

                <strong>
                  {awsConnected
                    ? "Connected AWS storage"
                    : "CloudDrop Managed Storage"}
                </strong>

                <p>
                  {awsConnected
                    ? defaultBucket
                      ? `New AWS uploads use ${defaultBucket.bucket_name}.`
                      : "Your AWS account is connected. Select a default bucket for customer storage."
                    : "Files can be stored using CloudDrop's managed storage. You can connect AWS at any time."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                goToStorage
              }
            >
              Manage storage
            </button>
          </section>

          <section className="dashboard-files-panel">
            <div className="dashboard-files-toolbar">
              <div>
                <span>
                  File manager
                </span>

                <h2>
                  My Files
                </h2>

                <p>
                  Search, inspect,
                  download and share
                  your CloudDrop
                  files.
                </p>
              </div>

              <div className="dashboard-files-controls">
                <div className="dashboard-category-filter">
                  <Filter
                    size={16}
                  />

                  <select
                    value={
                      category
                    }
                    onChange={(
                      event
                    ) =>
                      setCategory(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    {CATEGORIES.map(
                      (item) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item ===
                          "all"
                            ? "All categories"
                            : item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="dashboard-search-box">
                  <Search
                    size={17}
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Search files..."
                  />

                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      <X
                        size={14}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="dashboard-empty-state">
                <span className="dashboard-loader-ring" />

                <h3>
                  Loading files
                </h3>

                <p>
                  Getting your
                  CloudDrop workspace
                  ready…
                </p>
              </div>
            ) : filteredFiles.length ===
              0 ? (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">
                  <File
                    size={28}
                  />
                </div>

                <h3>
                  {search ||
                  category !==
                    "all"
                    ? "No matching files"
                    : "Your workspace is empty"}
                </h3>

                <p>
                  {search ||
                  category !==
                    "all"
                    ? "Try changing your search or category filter."
                    : "Upload your first file to start using CloudDrop."}
                </p>

                {!search &&
                  category ===
                    "all" && (
                    <button
                      className="dashboard-primary-button"
                      type="button"
                      onClick={
                        openUpload
                      }
                    >
                      <UploadCloud
                        size={17}
                      />

                      Upload file
                    </button>
                  )}
              </div>
            ) : (
              <div className="dashboard-file-table">
                <div className="dashboard-file-table-head">
                  <span>
                    Name
                  </span>

                  <span>
                    Category
                  </span>

                  <span>
                    Storage
                  </span>

                  <span>
                    Size
                  </span>

                  <span>
                    Uploaded
                  </span>

                  <span />
                </div>

                <div className="dashboard-file-list">
                  {filteredFiles.map(
                    (file) => (
                      <div
                        className="dashboard-file-row"
                        key={
                          file.id
                        }
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setSelectedFile(
                            file
                          )
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            setSelectedFile(
                              file
                            );
                          }
                        }}
                      >
                        <div className="dashboard-file-name-cell">
                          <div className="dashboard-file-icon">
                            <FileText
                              size={18}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                file.original_name
                              }
                            </strong>

                            <span>
                              {file.mime_type ||
                                "File"}
                            </span>
                          </div>
                        </div>

                        <span className="dashboard-category-pill">
                          {file.category ||
                            "other"}
                        </span>

                        <span className="dashboard-storage-pill">
                          {formatStorageMode(
                            file.storage_mode
                          )}
                        </span>

                        <span className="dashboard-file-meta">
                          {formatSize(
                            Number(
                              file.size_bytes
                            )
                          )}
                        </span>

                        <span className="dashboard-file-meta">
                          {new Date(
                            file.uploaded_at
                          ).toLocaleDateString()}
                        </span>

                        <button
                          type="button"
                          className="dashboard-file-more"
                          aria-label={`Open actions for ${file.original_name}`}
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setSelectedFile(
                              file
                            );
                          }}
                        >
                          <MoreHorizontal
                            size={18}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <UploadModal
        open={
          uploadOpen
        }
        onClose={() =>
          setUploadOpen(
            false
          )
        }
        onUploaded={
          refreshWorkspace
        }
      />

      {selectedFile && (
        <FileDetailsModal
          key={
            selectedFile.id
          }
          open
          file={
            selectedFile
          }
          onClose={() =>
            setSelectedFile(
              null
            )
          }
          onDeleted={
            refreshWorkspace
          }
        />
      )}
    </main>
  );
}