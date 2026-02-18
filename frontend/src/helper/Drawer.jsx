import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';

const Drawer = ({ isOpen, onClose, title, children, widthClass = 'w-128' }) => {
  const [show, setShow] = useState(false); // controls mounting
  const [animate, setAnimate] = useState(false); // controls animation class

  useEffect(() => {
    if (isOpen) {
      setShow(true); // mount drawer
      setTimeout(() => setAnimate(true), 10); // next tick -> start slide-in
    } else {
      setAnimate(false); // start slide-out
      const timer = setTimeout(() => setShow(false), 300); // unmount after animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform ease-in-out duration-300
          ${widthClass}
          ${animate ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-blue-900 text-green-700">
          <h2 id="drawer-title" className="text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white  transition-colors"
            aria-label="Close drawer"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">{children}</div>
      </div>
    </>
  );
};

export default Drawer;
