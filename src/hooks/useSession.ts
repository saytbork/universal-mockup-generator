import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SessionState = {
  email: string | null;
  loading: boolean;
};

export function useSession(redirectOnFail = true): SessionState {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/user?action=me');
        if (res.ok) {
          const data = await res.json();
          const nextEmail = typeof data.email === 'string' ? data.email.trim() : '';
          if (nextEmail) {
            if (mounted) setEmail(nextEmail);
          } else if (redirectOnFail) {
            navigate('/login', { replace: true });
          } else {
            if (mounted) setEmail(null);
          }
        } else if (redirectOnFail) {
          navigate('/login', { replace: true });
        }
      } catch {
        if (redirectOnFail) navigate('/login', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSession();
    return () => {
      mounted = false;
    };
  }, [navigate, redirectOnFail]);

  return { email, loading };
}
