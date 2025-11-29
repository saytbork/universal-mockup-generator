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
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setEmail(data.email);
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
