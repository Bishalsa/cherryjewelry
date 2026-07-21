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

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validate image format
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image format`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
          setProgress(Math.round(((i + 1) / fileArray.length) * 100));
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      }

      onChange(newUrls);
      toast.success("Images uploaded successfully to Cloudinary");
    } catch (err) {
      console.error("Upload handler error:", err);
      toast.error("Network error during file upload");
    } finally {
      setUploading(false);
      setProgress(0);
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
