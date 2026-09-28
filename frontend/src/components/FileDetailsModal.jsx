import {
  Check,
  Clock3,
  Copy,
  Download,
  FileText,
  Link2,
  Loader2,
  Share2,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "../api/client";

import "./FileDetailsModal.css";

const EXPIRY_OPTIONS = [
  {
    label: "15 minutes",
    value: 15,
  },
  {
    label: "30 minutes",
    value: 30,
  },
  {
    label: "1 hour",
    value: 60,
  },
  {
    label: "6 hours",
    value: 360,
  },
  {
    label: "24 hours",
    value: 1440,
  },
  {
    label: "7 days",
    value: 10080,
  },
];

export default function FileDetailsModal({
  file,
  open,
  onClose,
  onDeleted,
}) {
  const [
    metadata,
    setMetadata,
  ] = useState(null);

  const [
    shares,
    setShares,
  ] = useState([]);

  const [
    expiry,
    setExpiry,
  ] = useState(60);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sharesLoading,
    setSharesLoading,
  ] = useState(false);

  const [
    shareCreating,
    setShareCreating,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    shareUrl,
    setShareUrl,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  useEffect(() => {
    if (!open || !file?.id) {
      return;
    }

    loadMetadata();
    loadShares();

    setShareUrl("");
    setCopied(false);
    setConfirmDelete(false);
    setError("");
  }, [open, file?.id]);

  if (!open || !file) {
    return null;
  }

  async function loadMetadata() {
    try {
      setLoading(true);

      const response =
        await api.get(
          `/api/files/${file.id}`
        );

      setMetadata(
        response.data.data.file
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to load file details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadShares() {
    try {
      setSharesLoading(true);

      const response =
        await api.get(
          `/api/files/${file.id}/shares`
        );

      setShares(
        response.data.data.shares
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to load share links."
      );
    } finally {
      setSharesLoading(false);
    }
  }

  async function handleDownload() {
    try {
      setError("");

      const response =
        await api.get(
          `/api/files/${file.id}/download`
        );

      const url =
        response.data.data.downloadUrl;

      if (!url) {
        throw new Error(
          "Download URL was not returned"
        );
      }

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.rel =
        "noopener noreferrer";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to download file."
      );
    }
  }

  async function handleCreateShare() {
    try {
      setShareCreating(true);
      setError("");
      setCopied(false);

      const response =
        await api.post(
          `/api/files/${file.id}/share`,
          {
            expiresInMinutes:
              Number(expiry),
          }
        );

      const createdShare =
        response.data.data.share;

      setShareUrl(
        createdShare.shareUrl
      );

      await loadShares();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to create share link."
      );
    } finally {
      setShareCreating(false);
    }
  }

  async function handleCopy(
    value
  ) {
    try {
      await navigator.clipboard
        .writeText(value);

      setCopied(true);

      window.setTimeout(
        () =>
          setCopied(false),
        1800
      );
    } catch {
      setError(
        "Unable to copy the link automatically."
      );
    }
  }

  async function handleRevoke(
    shareId
  ) {
    try {
      setError("");

      await api.delete(
        `/api/files/${file.id}/share/${shareId}`
      );

      await loadShares();

      setShareUrl("");
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to revoke share link."
      );
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(
        `/api/files/${file.id}`
      );

      await onDeleted();

      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to delete file."
      );

      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  function formatSize(
    bytes
  ) {
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

    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  function formatDate(
    value
  ) {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleString();
  }

  const currentFile =
    metadata || file;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="file-details-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="file-details-header">
          <div className="file-details-title">
            <div className="file-details-icon">
              <FileText
                size={22}
              />
            </div>

            <div>
              <span className="muted-label">
                File details
              </span>

              <h2>
                {
                  currentFile.original_name
                }
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close file details"
          >
            <X size={20} />
          </button>
        </header>

        {error && (
          <div className="error-banner file-details-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="details-loading">
            <Loader2
              className="spinner"
              size={21}
            />

            Loading details...
          </div>
        ) : (
          <div className="metadata-grid">
            <div>
              <span>
                Type
              </span>

              <strong>
                {
                  currentFile.mime_type
                }
              </strong>
            </div>

            <div>
              <span>
                Category
              </span>

              <strong className="metadata-category">
                {
                  currentFile.category
                }
              </strong>
            </div>

            <div>
              <span>
                Size
              </span>

              <strong>
                {formatSize(
                  currentFile.size_bytes
                )}
              </strong>
            </div>

            <div>
              <span>
                Uploaded
              </span>

              <strong>
                {formatDate(
                  currentFile.uploaded_at
                )}
              </strong>
            </div>
          </div>
        )}

        {currentFile.description && (
          <div className="file-description-card">
            <span>
              Description
            </span>

            <p>
              {
                currentFile.description
              }
            </p>
          </div>
        )}

        <div className="primary-file-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={
              handleDownload
            }
          >
            <Download
              size={18}
            />

            Download
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={
              handleDelete
            }
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2
                  size={18}
                  className="spinner"
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2
                  size={18}
                />

                {confirmDelete
                  ? "Confirm delete"
                  : "Delete"}
              </>
            )}
          </button>
        </div>

        {confirmDelete && (
          <div className="delete-warning">
            This permanently deletes
            the file from both
            CloudDrop metadata and S3.

            <button
              type="button"
              onClick={() =>
                setConfirmDelete(
                  false
                )
              }
            >
              Cancel
            </button>
          </div>
        )}

        <div className="modal-divider" />

        <section className="sharing-section">
          <div className="sharing-heading">
            <div>
              <span className="muted-label">
                Temporary sharing
              </span>

              <h3>
                Share this file
              </h3>
            </div>

            <Share2
              size={20}
            />
          </div>

          <p className="sharing-description">
            Create an expiring public
            link. Recipients do not
            need a CloudDrop account.
          </p>

          <div className="share-create-row">
            <select
              value={expiry}
              onChange={(
                event
              ) =>
                setExpiry(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            >
              {EXPIRY_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              className="button button-primary"
              onClick={
                handleCreateShare
              }
              disabled={
                shareCreating
              }
            >
              {shareCreating ? (
                <>
                  <Loader2
                    className="spinner"
                    size={18}
                  />

                  Creating...
                </>
              ) : (
                <>
                  <Link2
                    size={18}
                  />

                  Create link
                </>
              )}
            </button>
          </div>

          {shareUrl && (
            <div className="generated-share">
              <div>
                <span>
                  New share link
                </span>

                <p>
                  {shareUrl}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    shareUrl
                  )
                }
              >
                {copied ? (
                  <Check
                    size={18}
                  />
                ) : (
                  <Copy
                    size={18}
                  />
                )}
              </button>
            </div>
          )}

          <div className="existing-shares">
            <div className="existing-shares-heading">
              <strong>
                Existing links
              </strong>

              <span>
                {shares.length}
              </span>
            </div>

            {sharesLoading ? (
              <div className="share-loading">
                <Loader2
                  className="spinner"
                  size={17}
                />

                Loading...
              </div>
            ) : shares.length ===
              0 ? (
              <div className="no-shares">
                No share links have
                been created yet.
              </div>
            ) : (
              shares.map(
                (share) => (
                  <div
                    className="share-row"
                    key={
                      share.id
                    }
                  >
                    <div className="share-status-icon">
                      <Clock3
                        size={17}
                      />
                    </div>

                    <div className="share-info">
                      <strong>
                        {share.active
                          ? "Active link"
                          : "Expired link"}
                      </strong>

                      <span>
                        Expires{" "}
                        {formatDate(
                          share.expires_at
                        )}
                      </span>
                    </div>

                    {share.active && (
                      <button
                        type="button"
                        className="revoke-button"
                        onClick={() =>
                          handleRevoke(
                            share.id
                          )
                        }
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                )
              )
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
