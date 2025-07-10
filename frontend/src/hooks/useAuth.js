import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    // Try to load user from localStorage on mount
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Optionally decode token for user info
      setUser({ token });
    }
  }, [setUser, user]);

  return { user, setUser };
}
