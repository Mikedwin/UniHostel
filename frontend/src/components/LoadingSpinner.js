import React from 'react';
import { Home } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
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
            <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {content}
        </div>
    );
};

export default LoadingSpinner;
