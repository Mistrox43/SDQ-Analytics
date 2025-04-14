import React, { useState } from 'react';
import { ProjectData } from '../../types';

interface VirtualizedTableProps {
  data: ProjectData[];
  columns: {
    key: string;
    header: string;
    render?: (value: any, row: ProjectData) => React.ReactNode;
  }[];
  rowHeight?: number;
  visibleRows?: number;
  totalRowsMessage?: boolean;
}

/**
 * A windowed table component that only renders visible rows for better performance
 */
const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  columns,
  rowHeight = 40,
  visibleRows = 15,
  totalRowsMessage = true
}) => {
  const [startIndex, setStartIndex] = useState(0);
  
  // Calculate total height to maintain proper scrollbar
  const totalHeight = data.length * rowHeight;
  const visibleHeight = visibleRows * rowHeight;
  
  // Visible data window
  const visibleData = data.slice(startIndex, startIndex + visibleRows);
  
  // Handle scroll events to update the visible window
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const newStartIndex = Math.floor(scrollTop / rowHeight);
    
    // Only update state if actually changed
    if (newStartIndex !== startIndex) {
      setStartIndex(newStartIndex);
    }
  };
  
  return (
    <div className="border rounded-md">
      {/* Table header */}
      <div className="bg-gray-100 border-b sticky top-0 z-10">
        <div className="flex">
          {columns.map((column, idx) => (
            <div 
              key={idx}
              className="p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1 min-w-0"
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>
      
      {/* Table body with virtual scrolling */}
      <div 
        className="overflow-auto relative"
        style={{ height: visibleHeight }}
        onScroll={handleScroll}
      >
        {/* Spacer to maintain scrollbar size */}
        <div style={{ height: totalHeight }} className="absolute inset-0">
          {/* Only render visible rows */}
          <div style={{ transform: `translateY(${startIndex * rowHeight}px)` }}>
            {visibleData.map((row, rowIdx) => (
              <div 
                key={rowIdx}
                className={`flex ${(startIndex + rowIdx) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                style={{ height: rowHeight }}
              >
                {columns.map((column, colIdx) => (
                  <div key={colIdx} className="p-2 text-sm flex-1 min-w-0 truncate">
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key] || <span className="text-gray-400">Not Set</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer with count info */}
      {totalRowsMessage && data.length > visibleRows && (
        <div className="text-center py-2 text-gray-500 text-sm border-t">
          Showing {visibleRows} of {data.length} projects at a time. Scroll to view more.
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualizedTable);