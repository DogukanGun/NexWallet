"use client";
import { useEffect, useState } from "react";
import { useConfigStore } from "../store/configStore";

const useCurrentUserId = () => {
  const { setIsAuthenticated } = useConfigStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/twitter/user', { credentials: 'include' });
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUserId(data.user.id); // Assuming the user object has an 'id' property
          setIsAuthenticated(true, data.user);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [setIsAuthenticated]);

  return { userId, loading };
};

export default useCurrentUserId; 