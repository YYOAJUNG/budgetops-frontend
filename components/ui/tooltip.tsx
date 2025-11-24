'use client';

import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-lg whitespace-nowrap ${
            side === 'top' ? 'bottom-full mb-2' :
            side === 'bottom' ? 'top-full mt-2' :
            side === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          }`}
          style={{
            [side === 'top' || side === 'bottom' ? 'left' : 'top']: '50%',
            transform: side === 'top' || side === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const TooltipTrigger = ({ children, asChild, ...props }: any) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
};
export const TooltipContent = ({ children, ...props }: any) => <>{children}</>;
