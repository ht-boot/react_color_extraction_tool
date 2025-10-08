import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import ColorPalette from "@/components/ColorPalette";
import { extractColors } from "@/lib/colorUtils";
import { toast } from "sonner";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);

      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      // Extract colors
      const extractedColors = await extractColors(file, canvasRef, 6);
      setColors(extractedColors);

      toast.success("成功提取颜色！");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("处理图片时出错，请尝试另一张图片。");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <motion.h1
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            图片颜色提取工具
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            上传图片，自动提取主要颜色，生成调色盘并获取HEX色号
          </p>
        </header>

        <main className="space-y-8">
          {/* Image Upload Section */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ImageUploader
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
          </motion.div>

          {/* Image Preview Section */}
          {image && (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  图片预览
                </h2>
                <div className="flex justify-center">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Color Palette Section */}
          {colors.length > 0 && (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                提取的颜色
              </h2>
              <ColorPalette colors={colors} />
            </motion.div>
          )}

          {/* Empty State */}
          {!image && !isProcessing && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-24 h-24 mb-4 text-gray-300 dark:text-gray-600">
                <i className="fa-solid fa-image text-5xl"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">尚未上传图片</h3>
              <p className="max-w-md">
                上传一张图片，我们将为您提取其中的主要颜色
              </p>
            </motion.div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">
                正在处理图片...
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                我们正在分析您的图片并提取主要颜色，请稍候
              </p>
            </motion.div>
          )}
        </main>

        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>图片颜色提取工具 &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
