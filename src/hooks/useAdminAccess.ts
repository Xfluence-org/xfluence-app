import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Secret key combination: Ctrl+Shift+A+D+M+I+N
const ADMIN_SEQUENCE = ['ControlLeft', 'ShiftLeft', 'KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN'];

export const useAdminAccess = () => {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only track if Ctrl+Shift are held
      if (event.ctrlKey && event.shiftKey) {
        setKeySequence(prev => {
          const newSequence = [...prev, event.code];
          
          // Keep only the last 7 keys (length of admin sequence)
          const trimmedSequence = newSequence.slice(-ADMIN_SEQUENCE.length);
          
          // Check if sequence matches admin code
          if (trimmedSequence.length === ADMIN_SEQUENCE.length) {
            const matches = trimmedSequence.every((key, index) => key === ADMIN_SEQUENCE[index]);
            
            if (matches) {
              // Admin access granted!
              navigate('/admin/features');
              return []; // Reset sequence
            }
          }
          
          return trimmedSequence;
        });
      } else {
        // Reset sequence if Ctrl+Shift not held
        setKeySequence([]);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Reset sequence when Ctrl or Shift is released
      if (event.code === 'ControlLeft' || event.code === 'ShiftLeft') {
        setKeySequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [navigate]);

  return { keySequence };
};