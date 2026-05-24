import { useEffect } from 'react';

export default function Toast({ msg, type = 'success', onClose }) {
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
