import React, { useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title, dialogClassName }) => {
  if (!isOpen) return null;

  const modalRef = useRef();

  const handleOverlayClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-[rgba(17,24,39,0.5)] dark:bg-[rgba(17,24,39,0.75)]"
      onClick={handleOverlayClick}
    >
      <div className={`relative w-full m-4 ${dialogClassName || 'max-w-lg mx-auto'}`} ref={modalRef}>
        {/*content*/}
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none">
          {/*header*/}
          <div className="flex items-start justify-between p-5 rounded-t">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-800 dark:text-gray-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/*body*/}
          <div className="relative p-6 pt-0 flex-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
