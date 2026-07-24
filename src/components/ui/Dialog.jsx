import React, { useState, useContext, createContext } from 'react';
import clsx from 'clsx';

const DialogContext = createContext();

const Dialog = ({ children, open: controlledOpen, onOpenChange }) => {
  const [open, setOpen] = useState(!!controlledOpen);
  const isControlled = controlledOpen !== undefined;

  const set = (v) => {
    if (!isControlled) setOpen(v);
    onOpenChange?.(v);
  };

  return (
    <DialogContext.Provider value={{ open: isControlled ? controlledOpen : open, setOpen: set }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({ asChild, children }) => {
  const { setOpen } = useContext(DialogContext);
  const child = React.Children.only(children);

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      onClick: (e) => {
        child.props.onClick?.(e);
        setOpen(true);
      }
    });
  }

  return (
    <button onClick={() => setOpen(true)}>{children}</button>
  );
};

const DialogContent = ({ className = '', children }) => {
  const { open, setOpen } = useContext(DialogContext);
  if (!open) return null;
  return (
    <div className={clsx('fixed inset-0 z-50 flex items-center justify-center', className)}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-medium dark:border-gray-700 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className = '', children }) => (
  <div className={clsx('px-6 py-4 border-b border-gray-100 dark:border-gray-800', className)}>
    {children}
  </div>
);

const DialogTitle = ({ className = '', children }) => (
  <h3 className={clsx('text-lg font-semibold', className)}>{children}</h3>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
export default Dialog;
