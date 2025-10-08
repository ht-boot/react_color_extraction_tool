import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ColorBlockProps {
  color: string;
  index: number;
}

export default function ColorBlock({ color, index }: ColorBlockProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const getTextColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(color);
      } else {
        // 兼容方案（旧浏览器）
        const textarea = document.createElement("textarea");
        textarea.value = color;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setIsCopied(true);
      toast.success(`已复制: ${color}`);

      // Reset copied state after animation
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("复制失败，请手动复制");
    }
  };

  return (
    <div className="group relative cursor-pointer">
      <motion.div
        className="rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-lg"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="h-48 flex items-center justify-center">
          <div className="text-center p-4">
            <span
              className="text-lg font-mono font-medium px-3 py-1 rounded-full"
              style={{
                color: getTextColor(color),
                backgroundColor: `${getTextColor(color)}20`,
              }}
            >
              {color}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="font-mono text-gray-800 dark:text-gray-200">
              {color}
            </span>

            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center"
            >
              {isCopied ? (
                <>
                  <i className="fa-solid fa-check mr-1.5"></i> 已复制
                </>
              ) : (
                <>
                  <i className="fa-regular fa-clipboard mr-1.5"></i> 复制
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
