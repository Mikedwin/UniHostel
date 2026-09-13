import React from "react";
import Logo from "./Logo";

const LoadingSpinner = ({
  message = "Loading...",
  fullScreen = false,
  className = "",
}) => {
  const content = (
    <div className="unihostel-loader" role="status" aria-live="polite">
      <div className="unihostel-loader-house-stage" aria-hidden="true">
        <span className="unihostel-loader-house-shadow" />
        <div className="unihostel-loader-house">
          <Logo className="unihostel-loader-house-mark" />
        </div>
        <span className="unihostel-loader-house-plinth" />
      </div>
      <div className="unihostel-loader-copy">
        <p>{message}</p>
        <span>Taking you where you need to be</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="unihostel-loader-screen fixed inset-0 z-50 flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[60vh] w-full items-center justify-center px-4 ${className}`}
    >
      {content}
    </div>
  );
};

export default LoadingSpinner;
