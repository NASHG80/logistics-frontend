import { FaTruckMoving } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteLoader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Road/Map Background Effect */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2 mt-8"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2 -mt-8"></div>
          </div>

          {/* Animated Truck */}
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{
              x: ["-100vw", "0%", "0%", "100vw"],
            }}
            transition={{
              duration: 0.75,
              times: [0, 0.47, 0.65, 1],
              ease: ["easeOut", "easeInOut", "easeInOut", "easeIn"],
            }}
            className="text-[#c6ac8f] drop-shadow-lg"
          >
            <FaTruckMoving size={80} />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1}}
            className="mt-8 text-gray-600 font-semibold tracking-wide text-lg"
          >
            Loading next destination...
          </motion.p>

          {/* Animated Dots */}
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 0.75,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-[#c6ac8f]"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
