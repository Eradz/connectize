import React from 'react';
import { createRoot } from 'react-dom/client';

// Promise-based confirm dialog usable across pages (no provider needed)
export function confirmDialog({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
} = {}) {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const cleanup = () => {
      root.unmount();
      container.remove();
    };

    const onConfirm = () => { resolve(true); cleanup(); };
    const onCancel = () => { resolve(false); cleanup(); };

    const Modal = () => (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              {cancelLabel}
            </button>
            <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );

    const root = createRoot(container);
    root.render(<Modal />);
  });
}
