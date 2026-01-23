import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-primary-200 rounded-full"></div>
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
