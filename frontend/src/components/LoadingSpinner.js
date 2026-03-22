import React from 'react';
import { Home } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false, className = '' }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <Home className="w-16 h-16 animate-spin" style={{ color: '#23817A' }} />
            </div>
            <p className="text-gray-600 font-medium animate-pulse">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-4 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className={`flex min-h-[60vh] w-full items-center justify-center px-4 ${className}`}>
            {content}
        </div>
    );
};

export default LoadingSpinner;
