"use client";
import { useEffect, useState } from "react";
import { useConfigStore } from "../store/configStore";

const useCurrentUserId = () => {
  const { setIsAuthenticated } = useConfigStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');

    if (storedUserData && storedUserData !== "undefined") {
      const userData = JSON.parse(storedUserData);
      setUserId(userData.id); // Assuming the user object has an 'id' property
      setIsAuthenticated(true, userData);
    } else {
      setUserId(null);
    }

    setLoading(false);
  }, [setIsAuthenticated]);

  return { userId, loading };
};

export default useCurrentUserId; 