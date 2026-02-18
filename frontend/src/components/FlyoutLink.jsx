import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const FlyoutLink = ({ children, FlyoutContent }) => {
  const [open, setOpen] = useState(false);
  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative inline-block"
    >
      <span className="text-blue-600 cursor-pointer font-semibold">
        {children}
      </span>

      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-8 -translate-x-1/2 bg-white text-black rounded-lg shadow-lg"
          >
            <div className="absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlyoutLink;
