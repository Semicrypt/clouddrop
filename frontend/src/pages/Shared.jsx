import {
  ChevronRight,
  Clock,
  Cloud,
  Database,
  ExternalLink,
  FileText,
  Files,
  HardDrive,
  Link2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
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

import "./Shared.css";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function getTimeRemaining(value) {
  if (!value) {
    return "Unknown expiry";
  }

  const expiry =
    new Date(value).getTime();

  const now =
    Date.now();

  if (
    Number.isNaN(expiry)
  ) {
    return "Unknown expiry";
  }

  const difference =
    expiry - now;

  if (difference <= 0) {
    return "Expired";
  }

  const minutes =
    Math.floor(
      difference /
        (1000 * 60)
    );

  if (minutes < 60) {
    return `${minutes} min remaining`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hr${
      hours === 1
        ? ""
        : "s"
    } remaining`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} day${
    days === 1
      ? ""
      : "s"
  } remaining`;
}

function isExpired(
  share
) {
  if (!share?.expires_at) {
    return false;
  }

  return (
    new Date(
      share.expires_at
    ).getTime() <=
    Date.now()
  );
}

function isExpiringSoon(
  share
) {
  if (
    !share?.expires_at ||
    isExpired(share)
  ) {
    return false;
  }

  const expiry =
    new Date(
      share.expires_at
    ).getTime();

  const difference =
    expiry - Date.now();

  return (
    difference <=
    24 *
      60 *
      60 *
      1000
  );
}

function SharedBrand() {
  return (
    <div className="shared-brand">
      <span className="shared-brand-mark">
        <Cloud size={19} />
      </span>

      <strong>
        Cloud
        <em>Drop</em>
      </strong>
    </div>
  );
}

export default function Shared() {
  const navigate =
    useNavigate();

  const [
    sharedItems,
    setSharedItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    revokingId,
    setRevokingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState(
    "active"
  );

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

  const fetchSharedItems =
    useCallback(async () => {
      const filesResponse =
        await api.get(
          "/api/files"
        );

      const files =
        filesResponse
          ?.data?.data
          ?.files || [];

      if (
        files.length === 0
      ) {
        return [];
      }

      const results =
        await Promise.allSettled(
          files.map(
            async (
              file
            ) => {
              const response =
                await api.get(
                  `/api/files/${file.id}/shares`
                );

              const shares =
                response
                  ?.data
                  ?.data
                  ?.shares ||
                [];

              return shares.map(
                (share) => ({
                  ...share,
                  file,
                })
              );
            }
          )
        );

      return results
        .filter(
          (result) =>
            result.status ===
            "fulfilled"
        )
        .flatMap(
          (result) =>
            result.value
        )
        .sort(
          (
            first,
            second
          ) =>
            new Date(
              first.expires_at ||
                0
            ).getTime() -
            new Date(
              second.expires_at ||
                0
            ).getTime()
        );
    }, []);

  const loadSharedItems =
    useCallback(
      async ({
        quiet = false,
      } = {}) => {
        if (!quiet) {
          setError("");
        }

        try {
          const items =
            await fetchSharedItems();

          setSharedItems(
            items
          );
        } catch (
          requestError
        ) {
          if (
            requestError
              ?.response
              ?.status ===
            401
          ) {
            logout();

            return;
          }

          throw requestError;
        }
      },
      [
        fetchSharedItems,
        logout,
      ]
    );

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const items =
          await fetchSharedItems();

        if (active) {
          setSharedItems(
            items
          );
        }
      } catch (
        requestError
      ) {
        if (
          requestError
            ?.response
            ?.status === 401
        ) {
          logout();

          return;
        }

        if (active) {
          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
              "Unable to load your shared files."
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, [
    fetchSharedItems,
    logout,
  ]);

  async function refreshSharedItems() {
    setRefreshing(true);

    try {
      await loadSharedItems();
    } catch (
      requestError
    ) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to refresh shared files."
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function revokeShare(
    item
  ) {
    if (
      !window.confirm(
        `Revoke the share link for "${item.file.original_name}"?`
      )
    ) {
      return;
    }

    try {
      setRevokingId(
        item.id
      );

      setError("");

      await api.delete(
        `/api/files/${item.file.id}/share/${item.id}`
      );

      setSharedItems(
        (current) =>
          current.filter(
            (share) =>
              share.id !==
              item.id
          )
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
          "Unable to revoke this share link."
      );
    } finally {
      setRevokingId(
        ""
      );
    }
  }

  const activeItems =
    useMemo(
      () =>
        sharedItems.filter(
          (item) =>
            !isExpired(
              item
            )
        ),
      [sharedItems]
    );

  const expiredItems =
    useMemo(
      () =>
        sharedItems.filter(
          (item) =>
            isExpired(
              item
            )
        ),
      [sharedItems]
    );

  const activeFileCount =
    useMemo(
      () =>
        new Set(
          activeItems.map(
            (item) =>
              item.file.id
          )
        ).size,
      [activeItems]
    );

  const expiringSoonCount =
    useMemo(
      () =>
        activeItems.filter(
          isExpiringSoon
        ).length,
      [activeItems]
    );

  const filteredItems =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return sharedItems.filter(
        (item) => {
          const expired =
            isExpired(
              item
            );

          const matchesFilter =
            filter ===
              "all" ||
            (filter ===
              "active" &&
              !expired) ||
            (filter ===
              "expired" &&
              expired);

          const matchesSearch =
            !term ||
            String(
              item.file
                ?.original_name ||
                ""
            )
              .toLowerCase()
              .includes(
                term
              );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      sharedItems,
      search,
      filter,
    ]);

  function closeSidebar() {
    setMobileSidebarOpen(
      false
    );
  }

  function goTo(
    destination
  ) {
    closeSidebar();

    navigate(
      destination
    );
  }

  return (
    <main className="shared-page">
      <aside
        className={`shared-sidebar ${
          mobileSidebarOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div>
          <div className="shared-sidebar-top">
            <SharedBrand />

            <button
              className="shared-sidebar-close"
              type="button"
              aria-label="Close navigation"
              onClick={
                closeSidebar
              }
            >
              <X size={19} />
            </button>
          </div>

          <nav className="shared-sidebar-nav">
            <span className="shared-nav-label">
              Workspace
            </span>

            <button
              className="shared-nav-link"
              type="button"
              onClick={() =>
                goTo(
                  "/dashboard"
                )
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
              className="shared-nav-link"
              type="button"
              onClick={() =>
                goTo(
                  "/dashboard"
                )
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
              className="shared-nav-link active"
              type="button"
              onClick={
                closeSidebar
              }
            >
              <Share2
                size={18}
              />

              <span>
                Shared
              </span>

              {activeItems.length >
                0 && (
                <small>
                  {
                    activeItems.length
                  }
                </small>
              )}
            </button>

            <span className="shared-nav-label shared-storage-label">
              Storage
            </span>

            <button
              className="shared-nav-link"
              type="button"
              onClick={() =>
                goTo(
                  "/aws-storage"
                )
              }
            >
              <HardDrive
                size={18}
              />

              <span>
                CloudDrop Storage
              </span>
            </button>

            <button
              className="shared-nav-link shared-sub-link"
              type="button"
              onClick={() =>
                goTo(
                  "/aws-storage"
                )
              }
            >
              <Database
                size={16}
              />

              <span>
                My AWS
              </span>
            </button>
          </nav>
        </div>

        <div className="shared-sidebar-bottom">
          <div className="shared-user-mini">
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
            className="shared-nav-link shared-logout-link"
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
          className="shared-sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={
            closeSidebar
          }
        />
      )}

      <section className="shared-content">
        <header className="shared-mobile-header">
          <SharedBrand />

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

        <div className="shared-content-inner">
          <header className="shared-header">
            <div>
              <span className="shared-eyebrow">
                Temporary sharing
              </span>

              <h1>
                Shared files
              </h1>

              <p>
                Review active public
                links, expiration
                times and access
                controls from one
                place.
              </p>
            </div>

            <div className="shared-header-actions">
              <button
                className="shared-refresh-button"
                type="button"
                aria-label="Refresh shared links"
                disabled={
                  refreshing
                }
                onClick={
                  refreshSharedItems
                }
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "shared-spin"
                      : ""
                  }
                />
              </button>

              <button
                className="shared-primary-button"
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                <Files
                  size={17}
                />

                My Files
              </button>
            </div>
          </header>

          {error && (
            <div className="shared-error-banner">
              <ShieldCheck
                size={17}
              />

              <span>
                {error}
              </span>

              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() =>
                  setError("")
                }
              >
                <X size={15} />
              </button>
            </div>
          )}

          <section className="shared-stats-grid">
            <article>
              <div className="shared-stat-icon blue">
                <Link2
                  size={20}
                />
              </div>

              <span>
                Active links
              </span>

              <strong>
                {
                  activeItems.length
                }
              </strong>

              <small>
                Accessible now
              </small>
            </article>

            <article>
              <div className="shared-stat-icon cyan">
                <Files
                  size={20}
                />
              </div>

              <span>
                Shared files
              </span>

              <strong>
                {
                  activeFileCount
                }
              </strong>

              <small>
                Unique files
              </small>
            </article>

            <article>
              <div className="shared-stat-icon amber">
                <Clock
                  size={20}
                />
              </div>

              <span>
                Expiring soon
              </span>

              <strong>
                {
                  expiringSoonCount
                }
              </strong>

              <small>
                Within 24 hours
              </small>
            </article>

            <article>
              <div className="shared-stat-icon muted">
                <ShieldCheck
                  size={20}
                />
              </div>

              <span>
                Expired
              </span>

              <strong>
                {
                  expiredItems.length
                }
              </strong>

              <small>
                No longer public
              </small>
            </article>
          </section>

          <section className="shared-security-note">
            <div>
              <ShieldCheck
                size={19}
              />
            </div>

            <div>
              <strong>
                Secure share links
              </strong>

              <p>
                CloudDrop stores only
                a secure hash of each
                share token. The
                copyable public URL
                is shown when a new
                link is created from
                File Details.
              </p>
            </div>
          </section>

          <section className="shared-panel">
            <div className="shared-panel-toolbar">
              <div>
                <span>
                  Link manager
                </span>

                <h2>
                  Sharing activity
                </h2>

                <p>
                  Inspect active and
                  expired temporary
                  links.
                </p>
              </div>

              <div className="shared-controls">
                <div className="shared-filter">
                  <select
                    value={
                      filter
                    }
                    onChange={(
                      event
                    ) =>
                      setFilter(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="active">
                      Active links
                    </option>

                    <option value="expired">
                      Expired links
                    </option>

                    <option value="all">
                      All links
                    </option>
                  </select>
                </div>

                <div className="shared-search">
                  <Search
                    size={16}
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
                    placeholder="Search shared files..."
                  />

                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() =>
                        setSearch(
                          ""
                        )
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
              <div className="shared-empty-state">
                <span className="shared-loader-ring" />

                <h3>
                  Loading shared links
                </h3>

                <p>
                  Checking your secure
                  CloudDrop sharing
                  activity…
                </p>
              </div>
            ) : filteredItems.length ===
              0 ? (
              <div className="shared-empty-state">
                <div className="shared-empty-icon">
                  <Share2
                    size={27}
                  />
                </div>

                <h3>
                  {search
                    ? "No matching shared files"
                    : filter ===
                        "expired"
                      ? "No expired links"
                      : "No active share links"}
                </h3>

                <p>
                  {search
                    ? "Try a different file name."
                    : filter ===
                        "expired"
                      ? "Expired sharing links will appear here."
                      : "Open a file from My Files and create a temporary link to share it securely."}
                </p>

                {filter !==
                  "expired" && (
                  <button
                    className="shared-primary-button"
                    type="button"
                    onClick={() =>
                      navigate(
                        "/dashboard"
                      )
                    }
                  >
                    <Files
                      size={17}
                    />

                    Browse files
                  </button>
                )}
              </div>
            ) : (
              <div className="shared-list">
                {filteredItems.map(
                  (item) => {
                    const expired =
                      isExpired(
                        item
                      );

                    const expiringSoon =
                      isExpiringSoon(
                        item
                      );

                    return (
                      <article
                        className={`shared-item ${
                          expired
                            ? "expired"
                            : ""
                        }`}
                        key={
                          item.id
                        }
                      >
                        <div className="shared-item-main">
                          <div className="shared-file-icon">
                            <FileText
                              size={19}
                            />
                          </div>

                          <div className="shared-file-copy">
                            <strong
                              title={
                                item.file
                                  .original_name
                              }
                            >
                              {
                                item.file
                                  .original_name
                              }
                            </strong>

                            <span>
                              {item.file
                                .category ||
                                "file"}

                              {" • "}

                              {item.file
                                .storage_mode
                                ?.toLowerCase()
                                ?.includes(
                                  "customer"
                                )
                                ? "My AWS"
                                : "CloudDrop storage"}
                            </span>
                          </div>
                        </div>

                        <div className="shared-expiry">
                          <span>
                            Expires
                          </span>

                          <strong>
                            {formatDate(
                              item.expires_at
                            )}
                          </strong>

                          <small
                            className={
                              expired
                                ? "expired"
                                : expiringSoon
                                  ? "warning"
                                  : ""
                            }
                          >
                            {getTimeRemaining(
                              item.expires_at
                            )}
                          </small>
                        </div>

                        <div className="shared-created">
                          <span>
                            Created
                          </span>

                          <strong>
                            {formatDate(
                              item.created_at
                            )}
                          </strong>
                        </div>

                        <div className="shared-item-status">
                          <span
                            className={
                              expired
                                ? "expired"
                                : "active"
                            }
                          >
                            {expired
                              ? "Expired"
                              : "Active"}
                          </span>
                        </div>

                        <div className="shared-item-actions">
                          <button
                            type="button"
                            className="shared-manage-button"
                            onClick={() =>
                              setSelectedFile(
                                item.file
                              )
                            }
                          >
                            <ExternalLink
                              size={14}
                            />

                            Manage

                            <ChevronRight
                              size={14}
                            />
                          </button>

                          <button
                            type="button"
                            className="shared-revoke-button"
                            disabled={
                              revokingId ===
                              item.id
                            }
                            onClick={() =>
                              revokeShare(
                                item
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />

                            {revokingId ===
                            item.id
                              ? "Revoking…"
                              : "Revoke"}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </section>

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
          onDeleted={async () => {
            setSelectedFile(
              null
            );

            await refreshSharedItems();
          }}
        />
      )}
    </main>
  );
}