"use client";
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext({
    isLoading: false,
    setLoading: (loading: boolean) => {},
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    return useContext(LoadingContext);
}; 