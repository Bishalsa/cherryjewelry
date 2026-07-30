"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Star, Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resolveCloudinaryFolder, type FolderKey } from "@/lib/cloudinary-folders";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_BYTES      = 10 * 1024 * 1024;  // 10 MB
const VERCEL_LIMIT_BYTES  = 4.5 * 1024 * 1024; // 4.5 MB fallback threshold
const ACCEPTED_TYPES      = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
];

interface SigResponse {
  success:   boolean;
  signature: string;
  timestamp: number;
  apiKey:    string;
  cloudName: string;
  folder:    string;
}

interface FileUploadState {
  name:    string;
  percent: number;
  error?:  string;
}

interface CloudinaryImageUploaderProps {
  images:    string[];
  onChange:  (newImages: string[]) => void;
  folder?:   FolderKey | string;   // accepts key ("rings") or full path
  maxFiles?: number;
}

// ─── XHR upload with real byte progress ──────────────────────────────────────
function xhrUpload(
  url:      string,
  body:     FormData,
  onProgress: (pct: number) => void,
  signal?:  AbortSignal
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      try {
        const json = JSON.parse(xhr.responseText);
        resolve(json);
      } catch {
        reject(new Error("Invalid JSON response from upload endpoint"));
      }
    });

    xhr.addEventListener("error",  () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort",  () => reject(new Error("Upload cancelled")));
    signal?.addEventListener("abort", () => xhr.abort());

    xhr.send(body);
  });
}

// ─── Per-file signature fetch (fresh every time to avoid expiry) ──────────────
async function fetchSignature(folderPath: string): Promise<SigResponse | null> {
  try {
    const res  = await fetch(`/api/admin/media/signature?folder=${encodeURIComponent(folderPath)}`);
    const json = await res.json() as SigResponse;
    if (json.success && json.signature) return json;
    console.warn("[CloudinaryUploader] Signature fetch failed:", json);
    return null;
  } catch (e) {
    console.warn("[CloudinaryUploader] Signature network error:", e);
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CloudinaryImageUploader({
  images    = [],
  onChange,
  folder    = "products",
  maxFiles  = 10,
}: CloudinaryImageUploaderProps) {
  const [isDragging,    setIsDragging]    = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [fileStates,    setFileStates]    = useState<FileUploadState[]>([]);
  const [overallPct,    setOverallPct]    = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);

  // Resolve the full Cloudinary folder path once per render
  const targetFolder = resolveCloudinaryFolder(folder);

  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // ── Guard: max file count ───────────────────────────────────────────────
    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // ── Validate each file ──────────────────────────────────────────────────
    const validFiles: File[] = [];
    const seenNames = new Set(images); // basic duplicate prevention (by URL after upload would be ideal)

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported format (${file.type})`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name}: exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // ── Initialise state ────────────────────────────────────────────────────
    setUploading(true);
    setOverallPct(0);
    setFileStates(validFiles.map(f => ({ name: f.name, percent: 0 })));

    const abort = new AbortController();
    abortRef.current = abort;

    const newUrls: string[] = [...images];
    let completed = 0;

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        const updateFile = (patch: Partial<FileUploadState>) =>
          setFileStates(prev =>
            prev.map((s, idx) => idx === i ? { ...s, ...patch } : s)
          );

        let uploadedUrl: string | null = null;

        // ── Strategy A: Direct signed CDN upload (bypasses Vercel, has real progress) ──
        const sig = await fetchSignature(targetFolder);
        if (sig) {
          try {
            const body = new FormData();
            body.append("file",      file);
            body.append("api_key",   sig.apiKey);
            body.append("timestamp", sig.timestamp.toString());
            body.append("signature", sig.signature);
            body.append("folder",    sig.folder);  // sig.folder is already a full path

            const cdnJson = await xhrUpload(
              `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
              body,
              (pct) => {
                updateFile({ percent: pct });
                const total = Math.round(((completed + pct / 100) / validFiles.length) * 100);
                setOverallPct(total);
              },
              abort.signal
            );

            if (cdnJson.secure_url) {
              uploadedUrl = cdnJson.secure_url;
            } else if (cdnJson.error) {
              console.warn("[CloudinaryUploader] CDN error:", cdnJson.error.message);
              updateFile({ error: cdnJson.error.message });
            }
          } catch (cdnErr: any) {
            if (cdnErr.message === "Upload cancelled") throw cdnErr; // propagate cancellation
            console.warn("[CloudinaryUploader] CDN upload failed, falling back to server:", cdnErr.message);
          }
        }

        // ── Strategy B: Server fallback (< 4.5 MB only) ────────────────────
        if (!uploadedUrl) {
          if (file.size > VERCEL_LIMIT_BYTES) {
            const msg = `${file.name} is too large for fallback upload (${(file.size / 1024 / 1024).toFixed(1)} MB). Please retry.`;
            updateFile({ error: msg });
            toast.error(msg);
          } else {
            try {
              const body = new FormData();
              body.append("file",   file);
              body.append("folder", targetFolder); // full path for server-side resolver

              const serverJson = await xhrUpload(
                "/api/admin/media/upload",
                body,
                (pct) => {
                  updateFile({ percent: pct });
                  const total = Math.round(((completed + pct / 100) / validFiles.length) * 100);
                  setOverallPct(total);
                },
                abort.signal
              );

              if (serverJson.success && serverJson.url) {
                uploadedUrl = serverJson.url;
              } else {
                const msg = serverJson.error || `Upload failed for ${file.name}`;
                updateFile({ error: msg });
                toast.error(msg);
              }
            } catch (srvErr: any) {
              if (srvErr.message === "Upload cancelled") throw srvErr;
              const msg = srvErr.message || "Server upload error";
              updateFile({ error: msg });
              toast.error(msg);
            }
          }
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
          updateFile({ percent: 100 });
        }

        completed++;
        setOverallPct(Math.round((completed / validFiles.length) * 100));
      }

      const added = newUrls.length - images.length;
      if (added > 0) {
        onChange(newUrls);
        toast.success(`${added} image${added > 1 ? "s" : ""} uploaded successfully`);
      }
    } catch (err: any) {
      if (err.message === "Upload cancelled") {
        toast.info("Upload cancelled");
      } else {
        console.error("[CloudinaryUploader]", err);
        toast.error(err.message || "Upload failed");
      }
    } finally {
      setUploading(false);
      setOverallPct(0);
      setFileStates([]);
      abortRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [images, maxFiles, targetFolder, onChange]);

  const handleDrop  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleUploadFiles(e.dataTransfer.files); };
  const handleSetCover = (i: number) => { if (i === 0) return; const item = images[i]; onChange([item, ...images.filter((_, idx) => idx !== i)]); };
  const handleRemove   = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  const activeFileState = fileStates.find(f => f.percent < 100 && !f.error);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300",
          uploading
            ? "cursor-not-allowed opacity-80"
            : "cursor-pointer",
          isDragging
            ? "border-rose-gold bg-rose-gold/5 scale-[0.99]"
            : "border-neutral-200 hover:border-rose-gold/50 bg-neutral-50/50 hover:bg-white"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-rose-gold animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 text-rose-gold-dark flex items-center justify-center mb-1">
              <UploadCloud className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-deep-plum">
              {uploading
                ? activeFileState
                  ? `Uploading ${activeFileState.name}…`
                  : "Uploading to Cloudinary…"
                : "Click or Drag & Drop images here"}
            </p>
            <p className="text-[10px] text-neutral-400">
              JPG · PNG · WEBP · HEIC · SVG · AVIF · GIF — up to 10 MB each
            </p>
            <p className="text-[10px] text-neutral-400">
              Uploading to: <span className="font-mono text-rose-gold">{targetFolder}</span>
            </p>
          </div>

          {/* Overall progress bar */}
          {uploading && (
            <div className="w-full max-w-xs space-y-1 mt-1">
              <div className="bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-gold h-full transition-all duration-150"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <p className="text-[9px] text-neutral-400 text-right">{overallPct}%</p>
            </div>
          )}

          {/* Per-file states */}
          {uploading && fileStates.length > 0 && (
            <div className="w-full max-w-xs space-y-1 mt-1">
              {fileStates.map((fs, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <span className={cn("truncate flex-1 text-left", fs.error ? "text-rose-500" : "text-neutral-500")}>
                    {fs.error ? <AlertCircle className="w-3 h-3 inline mr-0.5" /> : null}
                    {fs.name}
                  </span>
                  {!fs.error && (
                    <span className="text-neutral-400 shrink-0">{fs.percent}%</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cancel button */}
          {uploading && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); abortRef.current?.abort(); }}
              className="mt-1 text-[10px] text-rose-500 underline underline-offset-2 hover:text-rose-600"
            >
              Cancel upload
            </button>
          )}
        </div>
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
            >
              <img src={url} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />

              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-deep-plum text-white text-[9px] font-semibold rounded-full shadow-sm">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSetCover(idx); }}
                    title="Set as Cover Photo"
                    className="p-1.5 bg-white text-deep-plum rounded-full hover:bg-rose-gold hover:text-white transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                  title="Remove Image"
                  className="p-1.5 bg-white text-rose-600 rounded-full hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
