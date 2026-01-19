import React from 'react';
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

const Alert = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error':
                return <XCircle className="w-12 h-12 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-12 h-12 text-yellow-500" />;
            default:
                return <AlertCircle className="w-12 h-12 text-blue-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg max-w-md w-full shadow-2xl transform transition-all animate-scale-in">
                <div className="p-6">
                    <div className="flex justify-end mb-2">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        {getIcon()}
                        <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                    </div>
                    <div className="flex gap-3">
                        {type === 'confirm' ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert;
