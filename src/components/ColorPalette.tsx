import { motion } from "framer-motion";
import ColorBlock from "./ColorBlock";

interface ColorPaletteProps {
  colors: string[];
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  // Create animation variants for staggered entrance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    >
      {colors.map((color, index) => (
        <motion.div key={index} variants={item}>
          <ColorBlock color={color} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
