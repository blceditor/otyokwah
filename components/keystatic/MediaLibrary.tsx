"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderOpen,
  Search,
  Grid3x3,
  List,
  Trash2,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Check,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import type { MediaFile } from "@/lib/keystatic/mediaScanner";

interface MediaLibraryProps {
  onClose?: () => void;
  onSelect?: (file: MediaFile) => void;
  selectionMode?: boolean;
}

type ViewMode = "grid" | "list";
type FilterType = "all" | "image" | "video" | "document";
type SortBy = "date" | "name";
type SortDirection = "asc" | "desc";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function displayName(filename: string): string {
  return filename.replace(/^\d{13}-/, "");
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MediaLibrary({
  onClose,
  onSelect,
  selectionMode = false,
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortBy === "name") {
      return dir * a.filename.localeCompare(b.filename);
    }
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dir * (dateA - dateB);
  });

  // Fetch media files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (searchTerm) params.set("search", searchTerm);

      const response = await fetch(`/api/media?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch media files");

      const data = await response.json();
      const serverFiles: MediaFile[] = data.files;
      const serverUrls = new Set(serverFiles.map((f: MediaFile) => f.url));
      setFiles((prev) => {
        const optimisticToKeep = prev.filter(
          (f) => f.id.startsWith("optimistic-") && !serverUrls.has(f.url),
        );
        return [...optimisticToKeep, ...serverFiles];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [filterType, searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle file selection
  const toggleSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  // Handle bulk delete
  const handleDelete = async () => {
    if (selectedFiles.size === 0) return;

    const selectedItems = files.filter((f) => selectedFiles.has(f.id));
    const inUseFiles = selectedItems.filter(
      (f) => f.usedIn && f.usedIn.length > 0,
    );

    let confirmMessage = `Are you sure you want to delete ${selectedFiles.size} file(s)?`;
    if (inUseFiles.length > 0) {
      const pageNames = [
        ...new Set(inUseFiles.flatMap((f) => f.usedIn || [])),
      ];
      confirmMessage = `${selectedFiles.size} file(s) selected. ${inUseFiles.length} currently used in pages:\n\n${pageNames.join(", ")}\n\nDeleting these files will break those pages. Continue?`;
    }

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const paths = files
        .filter((f) => selectedFiles.has(f.id))
        .map((f) => f.url);

      const response = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });

      if (!response.ok) throw new Error("Failed to delete files");

      const data = await response.json();
      const successPaths = new Set(
        data.results
          .filter((r: { success: boolean }) => r.success)
          .map((r: { path: string }) => r.path),
      );
      const deletedIds = new Set(
        files
          .filter((f) => selectedFiles.has(f.id) && successPaths.has(f.url))
          .map((f) => f.id),
      );

      setPendingDeletes(
        (prev) => new Set([...prev, ...deletedIds]),
      );
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Create optimistic MediaFile entries from upload response
  const addOptimisticFiles = (
    uploaded: { filename: string; url: string }[],
    originalFiles: FileList | DataTransferFileList,
  ) => {
    const origMap = new Map<string, File>();
    for (const f of originalFiles) {
      origMap.set(f.name, f);
    }

    const optimistic: MediaFile[] = uploaded.map((u) => {
      const origName = u.filename.replace(/^\d+-/, "");
      const orig = origMap.get(origName);
      const ext = u.filename.substring(u.filename.lastIndexOf(".")).toLowerCase();
      const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
      const videoExts = [".mp4", ".webm"];
      const fileType = imageExts.includes(ext)
        ? "image"
        : videoExts.includes(ext)
          ? "video"
          : "document";

      // Use blob URL for instant thumbnail preview of the original file
      const blobUrl = orig ? URL.createObjectURL(orig) : undefined;

      return {
        id: `optimistic-${u.filename}`,
        filename: u.filename,
        path: u.url.replace(/^\//, ""),
        url: u.url,
        thumbnailUrl: blobUrl,
        size: orig?.size ?? 0,
        type: fileType,
        extension: ext,
        uploadedAt: new Date(),
        usedIn: [],
      };
    });

    setFiles((prev) => [...optimistic, ...prev]);
  };

  type DataTransferFileList = DataTransfer["files"];

  // Handle file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (const file of uploadFiles) {
        formData.append("files", file);
      }

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      if (result.errors?.length > 0) {
        setError(
          `Some files failed: ${result.errors.map((e: { filename: string }) => e.filename).join(", ")}`,
        );
      }

      if (result.uploaded?.length > 0) {
        addOptimisticFiles(result.uploaded, uploadFiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (const file of droppedFiles) {
        formData.append("files", file);
      }

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      if (result.uploaded?.length > 0) {
        addOptimisticFiles(result.uploaded, droppedFiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      data-testid="media-browser"
      className="flex flex-col h-full bg-white dark:bg-dark-bg"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            Media Library
          </h1>
          {files.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-dark-muted">
              ({files.length} files)
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border space-y-3">
        {/* Row 1: Search + Upload */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted"
            />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {selectedFiles.size > 0 && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete ({selectedFiles.size})
            </button>
          )}

          <label
            data-testid="media-upload-button"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            Upload
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Row 2: Filters + Sort + View */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === "all"
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === "image"
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg"
              }`}
            >
              <ImageIcon size={14} />
              <span className="hidden sm:inline">Images</span>
            </button>
            <button
              onClick={() => setFilterType("video")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === "video"
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg"
              }`}
            >
              <Video size={14} />
              <span className="hidden sm:inline">Videos</span>
            </button>
            <button
              onClick={() => setFilterType("document")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === "document"
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg"
              }`}
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Docs</span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <select
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split("-") as [
                  SortBy,
                  SortDirection,
                ];
                setSortBy(field);
                setSortDirection(dir);
              }}
              className="text-sm py-1.5 pl-2 pr-7 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-dark-surface shadow-sm"
                    : "text-gray-500 dark:text-dark-muted"
                }`}
                title="Grid view"
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-dark-surface shadow-sm"
                    : "text-gray-500 dark:text-dark-muted"
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {!loading && !error && sortedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-dark-muted">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No media files found</p>
            <p className="text-sm">Upload some files to get started</p>
          </div>
        )}

        {!loading && sortedFiles.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedFiles.map((file) => (
              <div
                key={file.id}
                data-testid="media-item"
                data-modified={
                  file.uploadedAt instanceof Date
                    ? file.uploadedAt.toISOString()
                    : new Date(file.uploadedAt).toISOString()
                }
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedFiles.has(file.id)
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() =>
                  selectionMode && onSelect
                    ? onSelect(file)
                    : toggleSelection(file.id)
                }
              >
                {/* Thumbnail */}
                {file.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- dynamic uploaded media thumbnails
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                ) : file.type === "document" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-surface">
                    <FileText
                      size={32}
                      className="text-red-500 dark:text-red-400"
                    />
                    <span className="mt-1 text-xs font-medium text-gray-500 uppercase">
                      {file.extension?.replace(".", "")}
                    </span>
                  </div>
                ) : file.type === "video" ? (
                  <div className="relative w-full h-full bg-gray-900">
                    <video
                      src={file.thumbnailUrl || file.url}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onLoadedData={(e) => {
                        const vid = e.currentTarget;
                        vid.currentTime = 1;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <Video size={18} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-surface">
                    <Video
                      size={32}
                      className="text-gray-400 dark:text-dark-muted"
                    />
                  </div>
                )}

                {/* Selection indicator */}
                <div
                  className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedFiles.has(file.id)
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white/80 dark:bg-dark-surface/80 border-gray-300 dark:border-dark-border group-hover:border-blue-400"
                  }`}
                >
                  {selectedFiles.has(file.id) && (
                    <Check size={12} className="text-white" />
                  )}
                </div>

                {/* Filename overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">
                    {displayName(file.filename)}
                  </p>
                </div>

                {/* Usage indicator */}
                {file.usedIn && file.usedIn.length > 0 && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                    title={`Used in: ${file.usedIn.join(", ")}`}
                  >
                    <FileText size={10} className="text-white" />
                  </div>
                )}

                {/* Delete pending overlay */}
                {pendingDeletes.has(file.id) && (
                  <div
                    className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center"
                    title="This file has been deleted and will be removed on the next deployment."
                  >
                    <Trash2 size={20} className="text-white mb-1" />
                    <span className="text-xs font-medium text-white">
                      Delete Pending
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && sortedFiles.length > 0 && viewMode === "list" && (
          <div className="space-y-2">
            {sortedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                  pendingDeletes.has(file.id)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 opacity-60"
                    : selectedFiles.has(file.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface"
                }`}
                onClick={() =>
                  selectionMode && onSelect
                    ? onSelect(file)
                    : toggleSelection(file.id)
                }
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  {file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic uploaded media thumbnails
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : file.type === "document" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-dark-surface">
                      <FileText size={20} className="text-red-500" />
                    </div>
                  ) : file.type === "video" ? (
                    <div className="relative w-full h-full bg-gray-900">
                      <video
                        src={file.thumbnailUrl || file.url}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onLoadedData={(e) => {
                          const vid = e.currentTarget;
                          vid.currentTime = 1;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Video size={12} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-surface">
                      <Video size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-dark-text truncate">
                    {displayName(file.filename)}
                    {pendingDeletes.has(file.id) && (
                      <span
                        className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded"
                        title="This file has been deleted and will be removed on the next deployment."
                      >
                        <Trash2 size={10} />
                        Delete Pending
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">
                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    {file.usedIn && file.usedIn.length > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        {" "}
                        • Used in {file.usedIn.length} page(s)
                      </span>
                    )}
                  </p>
                </div>

                {/* Selection checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedFiles.has(file.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-dark-border"
                  }`}
                >
                  {selectedFiles.has(file.id) && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop zone overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600 dark:text-dark-muted">
              Uploading...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;
