import React from 'react';
import { Trash2 } from 'lucide-react';

const ManagerContextMenu = ({ contextMenu, onArchiveFromContext }) => {
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => onArchiveFromContext(contextMenu.app._id)}
        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
      >
        <Trash2 className="w-4 h-4" />
        <span className="font-medium">Move to History</span>
      </button>
      <div className="border-t border-gray-200 my-1" />
      <div className="px-4 py-2 text-xs text-gray-500">
        {contextMenu.app.studentName} - {contextMenu.app.hostelId?.name}
      </div>
    </div>
  );
};

export default ManagerContextMenu;
