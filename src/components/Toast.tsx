import { useEffect } from 'react';

interface ToastProps {
  msg: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ msg, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast show ${type}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
