import React from 'react';

interface SkeletonProps {
  type: 'text' | 'step' | 'full';
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ type, lines = 3 }) => {
  if (type === 'text') {
    return (
      <div className="animate-pulse space-y-2 min-w-[2500px]">
        {[...Array(lines)].map((_, i) => (
          <div 
            key={i} 
            className={`h-4 bg-gray-200 rounded ${i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }
  
  if (type === 'step') {
    return (
      <div className="animate-pulse space-y-3 p-3 bg-gray-50 rounded-lg min-w-[250px]">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }
  
  if (type === 'full') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Skeleton; 