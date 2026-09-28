import {
  Cloud,
  File,
  FileText,
  Filter,
  LogOut,
  MoreHorizontal,
  Search,
  Share2,
  UploadCloud,
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

const CATEGORIES = [
  "all",
  "documents",
  "images",
  "spreadsheets",
  "archives",
  "text",
  "other",
];

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [
    files,
    setFiles,
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

  const loadFiles =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/api/files"
          );

        setFiles(
          response.data.data
            .files
        );
      } catch (
        requestError
      ) {
        if (
          requestError.response
            ?.status === 401
        ) {
          logout();
          return;
        }

        setError(
          "Unable to load your files."
        );
      } finally {
        setLoading(false);
      }
    }, [logout]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles =
    files.filter((file) => {
      const matchesSearch =
        file.original_name
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase()
          );

      const matchesCategory =
        category === "all" ||
        file.category ===
          category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  const totalBytes =
    files.reduce(
      (total, file) =>
        total +
        Number(
          file.size_bytes || 0
        ),
      0
    );

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

    if (
      bytes <
      1024 *
        1024 *
        1024
    ) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(
      bytes /
      (1024 *
        1024 *
        1024)
    ).toFixed(1)} GB`;
  }

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div>
          <div className="brand dashboard-brand">
            <div className="brand-mark">
              <Cloud
                size={20}
              />
            </div>

            <span>
              CloudDrop
            </span>
          </div>

          <nav className="sidebar-nav">
            <button className="sidebar-link active">
              <FileText
                size={18}
              />

              My Files
            </button>

            <button
              className="sidebar-link"
              onClick={() =>
                setUploadOpen(
                  true
                )
              }
            >
              <UploadCloud
                size={18}
              />

              Upload
            </button>

            <button className="sidebar-link">
              <Share2
                size={18}
              />

              Shared
            </button>
          </nav>
        </div>

        <button
          className="sidebar-link logout-link"
          onClick={
            logout
          }
        >
          <LogOut
            size={18}
          />

          Sign out
        </button>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="muted-label">
              Workspace
            </span>

            <h1>
              Welcome
              {user?.name
                ? `, ${user.name}`
                : ""}
            </h1>

            <p>
              Manage your secure
              cloud files.
            </p>
          </div>

          <button
            className="button button-primary"
            onClick={() =>
              setUploadOpen(
                true
              )
            }
          >
            <UploadCloud
              size={18}
            />

            Upload file
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span>
              Total files
            </span>

            <strong>
              {files.length}
            </strong>
          </article>

          <article className="stat-card">
            <span>
              Storage used
            </span>

            <strong>
              {formatSize(
                totalBytes
              )}
            </strong>
          </article>

          <article className="stat-card">
            <span>
              Security
            </span>

            <strong>
              Private
            </strong>
          </article>
        </section>

        <section className="files-panel">
          <div className="files-toolbar">
            <div>
              <h2>
                My Files
              </h2>

              <p>
                Files stored securely
                in your CloudDrop
                workspace.
              </p>
            </div>

            <div className="files-controls">
              <div className="category-filter">
                <Filter
                  size={16}
                />

                <select
                  value={category}
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target
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

              <div className="search-box">
                <Search
                  size={18}
                />

                <input
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search files..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="error-banner"
              style={{
                margin:
                  "16px 22px",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <span className="loader-ring" />

              <p>
                Loading your
                files...
              </p>
            </div>
          ) : filteredFiles
              .length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <File
                  size={27}
                />
              </div>

              <h3>
                No files found
              </h3>

              <p>
                {search ||
                category !==
                  "all"
                  ? "No files match your filters."
                  : "Upload your first file to CloudDrop."}
              </p>
            </div>
          ) : (
            <div className="file-table">
              <div className="file-table-head file-table-with-actions">
                <span>
                  Name
                </span>

                <span>
                  Category
                </span>

                <span>
                  Size
                </span>

                <span>
                  Uploaded
                </span>

                <span />
              </div>

              {filteredFiles.map(
                (file) => (
                  <div
                    className="file-table-row file-table-with-actions clickable-file-row"
                    key={
                      file.id
                    }
                    onClick={() =>
                      setSelectedFile(
                        file
                      )
                    }
                  >
                    <div className="file-name-cell">
                      <div className="file-icon-small">
                        <FileText
                          size={
                            18
                          }
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            file.original_name
                          }
                        </strong>

                        <span>
                          {
                            file.mime_type
                          }
                        </span>
                      </div>
                    </div>

                    <span className="category-pill">
                      {
                        file.category
                      }
                    </span>

                    <span>
                      {formatSize(
                        Number(
                          file.size_bytes
                        )
                      )}
                    </span>

                    <span>
                      {new Date(
                        file.uploaded_at
                      ).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      className="file-more-button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedFile(
                          file
                        );
                      }}
                      aria-label={`Open actions for ${file.original_name}`}
                    >
                      <MoreHorizontal
                        size={18}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </section>

      <UploadModal
        open={uploadOpen}
        onClose={() =>
          setUploadOpen(false)
        }
        onUploaded={
          loadFiles
        }
      />

      <FileDetailsModal
        open={
          Boolean(
            selectedFile
          )
        }
        file={
          selectedFile
        }
        onClose={() =>
          setSelectedFile(
            null
          )
        }
        onDeleted={
          loadFiles
        }
      />
    </main>
  );
}