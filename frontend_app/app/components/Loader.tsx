import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="loader">
                <div className="spinner"></div>
            </div>
            <style jsx>{`
                .spinner {
                    border: 8px solid rgba(255, 255, 255, 0.3);
                    border-top: 8px solid #ffffff;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loader; 