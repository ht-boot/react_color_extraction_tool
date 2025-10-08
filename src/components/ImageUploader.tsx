import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const ACCEPTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export default function ImageUploader({
  onImageUpload,
  isProcessing,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        toast.error("不支持的文件格式，请上传JPG、PNG、GIF或WebP图片");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("文件过大，请上传小于5MB的图片");
        return;
      }

      // Process the image
      await onImageUpload(file);
    },
    [onImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isProcessing) return;

      handleFileSelect(e.dataTransfer.files);
    },
    [isProcessing, handleFileSelect]
  );

  const handleClick = useCallback(() => {
    if (isProcessing || !fileInputRef.current) return;
    fileInputRef.current.click();
  }, [isProcessing]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isProcessing || !e.target.files) return;
      handleFileSelect(e.target.files);

      // Reset input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [isProcessing, handleFileSelect]
  );

  return (
    <div className="relative">
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500",
          isProcessing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={isProcessing ? undefined : { scale: 1.01 }}
        whileTap={isProcessing ? undefined : { scale: 0.99 }}
      >
        <div className="w-16 h-16 mb-4 text-blue-500">
          <i className="fa-solid fa-cloud-upload-alt text-3xl"></i>
        </div>

        <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">
          上传图片
        </h3>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          拖拽图片到此处，或
          <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">
            点击选择文件
          </span>
        </p>

        <div className="text-xs text-gray-400 dark:text-gray-500">
          <p>支持 JPG, PNG, GIF, WebP 等格式，最大 5MB</p>
        </div>
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        accept={ACCEPTED_FORMATS.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={isProcessing}
      />
    </div>
  );
}
