import React, { Suspense } from 'react';

interface LazyTabProps {
  isActive: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * LazyTab component that only renders its children when active
 * This prevents unnecessary rendering of inactive tabs
 */
const LazyTab: React.FC<LazyTabProps> = ({ isActive, fallback, children }) => {
  // Default loading fallback
  const defaultFallback = (
    <div className="flex items-center justify-center h-64 bg-white shadow rounded-lg p-6">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-500">Loading content...</p>
      </div>
    </div>
  );
  
  // Don't render anything if tab is not active
  if (!isActive) {
    return null;
  }
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyTab;