import {
  File,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import api from "../api/client";

import "./UploadModal.css";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPTED_FILES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".txt",
  ".csv",
  ".zip",
  ".docx",
  ".xlsx",
  ".pptx",
].join(",");

export default function UploadModal({
  open,
  onClose,
  onUploaded,
}) {
  const inputRef = useRef(null);

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  if (!open) {
    return null;
  }

  function selectFile(
    selectedFile
  ) {
    if (!selectedFile) {
      return;
    }

    setError("");

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setFile(null);

      setError(
        "File is too large. Maximum file size is 10 MB."
      );

      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFile(null);

      setError(
        "Unsupported file format. Please choose JPG, PNG, WEBP, PDF, TXT, CSV, ZIP, DOCX, XLSX or PPTX."
      );

      return;
    }

    setFile(selectedFile);
  }

  function handleDrop(
    event
  ) {
    event.preventDefault();

    setDragActive(false);

    selectFile(
      event.dataTransfer
        .files?.[0]
    );
  }

  function resetAndClose() {
    if (loading) {
      return;
    }

    setFile(null);
    setDescription("");
    setError("");
    setDragActive(false);

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }

    onClose();
  }

  async function handleUpload() {
    if (!file) {
      setError(
        "Choose a file before uploading."
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    if (description.trim()) {
      formData.append(
        "description",
        description.trim()
      );
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/api/files",
        formData
      );

      setFile(null);
      setDescription("");

      if (inputRef.current) {
        inputRef.current.value =
          "";
      }

      await onUploaded();

      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to upload file."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatSize(
    bytes
  ) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={
        resetAndClose
      }
    >
      <section
        className="upload-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="upload-modal-header">
          <div>
            <span className="muted-label">
              CloudDrop storage
            </span>

            <h2>
              Upload file
            </h2>

            <p>
              Files are stored
              securely in your
              private S3 storage.
            </p>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={
              resetAndClose
            }
            disabled={loading}
            aria-label="Close upload window"
          >
            <X size={20} />
          </button>
        </header>

        <div
          className={
            dragActive
              ? "upload-dropzone active"
              : "upload-dropzone"
          }
          onDragEnter={(
            event
          ) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(
            event
          ) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() =>
            setDragActive(false)
          }
          onDrop={
            handleDrop
          }
          onClick={() =>
            inputRef.current?.click()
          }
        >
          <input
            ref={inputRef}
            hidden
            type="file"
            accept={
              ACCEPTED_FILES
            }
            onChange={(
              event
            ) =>
              selectFile(
                event.target
                  .files?.[0]
              )
            }
          />

          <div className="upload-modal-icon">
            <UploadCloud
              size={26}
            />
          </div>

          <strong>
            Drag and drop a file
          </strong>

          <span>
            or click to browse
          </span>

          <small>
            JPG, PNG, WEBP,
            PDF, TXT, CSV,
            ZIP, DOCX, XLSX
            and PPTX
          </small>

          <small>
            Maximum file size:
            10 MB
          </small>
        </div>

        {file && (
          <div className="selected-file">
            <div className="selected-file-icon">
              <File size={19} />
            </div>

            <div>
              <strong>
                {file.name}
              </strong>

              <span>
                {formatSize(
                  file.size
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);

                if (
                  inputRef.current
                ) {
                  inputRef.current.value =
                    "";
                }
              }}
              disabled={loading}
              aria-label="Remove selected file"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <label className="upload-description">
          Description

          <span>
            optional
          </span>

          <textarea
            rows="3"
            value={description}
            onChange={(
              event
            ) =>
              setDescription(
                event.target
                  .value
              )
            }
            placeholder="Add a short description..."
            disabled={loading}
          />
        </label>

        {error && (
          <div className="error-banner upload-error">
            {error}
          </div>
        )}

        <footer className="upload-modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={
              resetAndClose
            }
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="button button-primary"
            onClick={
              handleUpload
            }
            disabled={
              loading ||
              !file
            }
          >
            {loading ? (
              <>
                <Loader2
                  className="spinner"
                  size={18}
                />

                Uploading...
              </>
            ) : (
              <>
                <UploadCloud
                  size={18}
                />

                Upload file
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}