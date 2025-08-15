"use client";

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
// Button import is fine as it will use the new styles
// import Button from './Button';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Added 2xl
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl', // Added 2xl
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" /> {/* Darker overlay */}
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl bg-surface p-6 text-left align-middle shadow-2xl transition-all`} // Changed to bg-surface, rounded-xl, shadow-2xl
              >
                {title && (
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-text-primary flex justify-between items-center"> {/* Increased title size */}
                    {title}
                    <button // Using a raw button for close, styled to be minimal
                      onClick={onClose}
                      className="p-1 rounded-full text-text-secondary hover:bg-gray-200 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-surface" // Added offset-surface
                      aria-label="Close modal"
                    >
                      <X size={22} />
                    </button>
                  </Dialog.Title>
                )}
                <div className={`mt-4 ${title ? 'pt-2' : ''} text-text-secondary`}>{children}</div>
                {footer && <div className="mt-6 pt-4 border-t border-border-color flex justify-end space-x-3">{footer}</div>} {/* Added border top to footer */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
