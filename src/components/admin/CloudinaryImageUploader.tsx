"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Star, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  publicId?: string;
}

interface CloudinaryImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  folder?: "products" | "collections" | "banners" | "homepage" | "seo" | "logos";
  maxFiles?: number;
}

export default function CloudinaryImageUploader({
  images = [],
  onChange,
  folder = "products",
  maxFiles = 10,
}: CloudinaryImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    setProgress(10);
    const newUrls: string[] = [...images];

    // Determine target folder path
    let targetFolder = "cherry-jewelry/products";
    if (folder.includes("/")) {
      targetFolder = folder;
    } else if (folder !== "products") {
      targetFolder = `cherry-jewelry/${folder}`;
    }

    // Try fetching backend signature for direct signed upload
    let sigData: { signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string } | null = null;
    try {
      const sigRes = await fetch(`/api/admin/media/signature?folder=${encodeURIComponent(targetFolder)}`);
      const sigJson = await sigRes.json();
      if (sigJson.success && sigJson.signature) {
        sigData = sigJson;
      }
    } catch {
      // Ignore signature error; will fallback to server upload
    }

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validate image format
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image format`);
          continue;
        }

        let uploadedUrl: string | null = null;

        // Strategy A: Direct Signed Upload to Cloudinary CDN
        if (sigData) {
          try {
            const directData = new FormData();
            directData.append("file", file);
            directData.append("api_key", sigData.apiKey);
            directData.append("timestamp", sigData.timestamp.toString());
            directData.append("signature", sigData.signature);
            directData.append("folder", sigData.folder);

            const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
              method: "POST",
              body: directData,
            });

            const cdnJson = await cdnRes.json();
            if (cdnJson.secure_url) {
              uploadedUrl = cdnJson.secure_url;
            }
          } catch (cdnErr) {
            console.warn("Direct signed upload failed, falling back to server route", cdnErr);
          }
        }

        // Strategy B: Fallback to Next.js Server Route Upload
        if (!uploadedUrl) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);

          const res = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            let errMsg = `Upload failed with status ${res.status}`;
            try {
              const errData = await res.json();
              errMsg = errData.error || errMsg;
            } catch {
              // HTML or server error
            }
            toast.error(errMsg);
            continue;
          }

          const data = await res.json();
          if (data.success && data.url) {
            uploadedUrl = data.url;
          } else {
            toast.error(data.error || `Failed to upload ${file.name}`);
          }
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
          setProgress(Math.round(((i + 1) / fileArray.length) * 100));
        }
      }

      if (newUrls.length > images.length) {
        onChange(newUrls);
        toast.success("Images uploaded successfully to Cloudinary");
      }
    } catch (err: any) {
      console.error("Upload handler error:", err);
      toast.error(err?.message || "Network error during file upload");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const item = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onChange([item, ...rest]);
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300",
          isDragging
            ? "border-rose-gold bg-rose-gold/5 scale-[0.99]"
            : "border-neutral-200 hover:border-rose-gold/50 bg-neutral-50/50 hover:bg-white"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
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
              {uploading ? "Uploading to Cloudinary..." : "Click or Drag & Drop images here"}
            </p>
            <p className="text-[10px] text-neutral-400">
              Supports JPG, PNG, WEBP, SVG up to 10MB (Auto WebP/AVIF delivery)
            </p>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full max-w-xs bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-rose-gold h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
            >
              <img
                src={url}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover Photo Badge */}
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-deep-plum text-white text-[9px] font-semibold rounded-full shadow-sm">
                  Cover
                </span>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(idx);
                    }}
                    title="Set as Cover Photo"
                    className="p-1.5 bg-white text-deep-plum rounded-full hover:bg-rose-gold hover:text-white transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
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
