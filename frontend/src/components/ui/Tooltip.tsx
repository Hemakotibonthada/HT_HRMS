import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

interface Position {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const calculatePosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  requestedPlacement: 'top' | 'bottom' | 'left' | 'right' | 'auto'
): Position => {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const offset = 8; // Distance from trigger element

  const positions = {
    top: {
      top: triggerRect.top + scrollY - tooltipRect.height - offset,
      left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      placement: 'top' as const,
    },
    bottom: {
      top: triggerRect.bottom + scrollY + offset,
      left: triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2,
      placement: 'bottom' as const,
    },
    left: {
      top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.left + scrollX - tooltipRect.width - offset,
      placement: 'left' as const,
    },
    right: {
      top: triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.right + scrollX + offset,
      placement: 'right' as const,
    },
  };

  // Check if requested placement fits
  if (requestedPlacement !== 'auto') {
    const pos = positions[requestedPlacement];
    const fitsHorizontally = pos.left >= 0 && pos.left + tooltipRect.width <= viewport.width;
    const fitsVertically = pos.top >= 0 && pos.top + tooltipRect.height <= viewport.height;
    
    if (fitsHorizontally && fitsVertically) {
      return pos;
    }
  }

  // Auto-placement: find the best fit
  const placements: (keyof typeof positions)[] = ['top', 'bottom', 'right', 'left'];
  
  for (const placement of placements) {
    const pos = positions[placement];
    const fitsHorizontally = pos.left >= 0 && pos.left + tooltipRect.width <= viewport.width;
    const fitsVertically = pos.top >= 0 && pos.top + tooltipRect.height <= viewport.height;
    
    if (fitsHorizontally && fitsVertically) {
      return pos;
    }
  }

  // Fallback to top if nothing fits perfectly
  return positions.top;
};

const TooltipPortal = ({ 
  children, 
  position, 
  className 
}: { 
  children: ReactNode; 
  position: Position;
  className?: string;
}) => {
  const arrowClasses = {
    top: 'border-t-gray-800 border-x-transparent border-b-transparent top-full left-1/2 -translate-x-1/2',
    bottom: 'border-b-gray-800 border-x-transparent border-t-transparent bottom-full left-1/2 -translate-x-1/2',
    left: 'border-l-gray-800 border-y-transparent border-r-transparent left-full top-1/2 -translate-y-1/2',
    right: 'border-r-gray-800 border-y-transparent border-l-transparent right-full top-1/2 -translate-y-1/2',
  };

  const animationClasses = {
    top: 'animate-slide-up',
    bottom: 'animate-slide-up',
    left: 'animate-slide-up',
    right: 'animate-slide-up',
  };

  return createPortal(
    <div
      className={`
        fixed z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg backdrop-blur-sm
        max-w-xs break-words pointer-events-none select-none
        ${animationClasses[position.placement]}
        ${className || ''}
      `}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="tooltip"
      aria-hidden="true"
    >
      {children}
      {/* Arrow */}
      <div
        className={`absolute w-0 h-0 border-4 ${arrowClasses[position.placement]}`}
        aria-hidden="true"
      />
    </div>,
    document.body
  );
};

export const Tooltip = ({
  content,
  children,
  placement = 'auto',
  delay = 500,
  disabled = false,
  className,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || disabled) return;

    // Create a temporary element to measure tooltip dimensions
    const tempTooltip = document.createElement('div');
    tempTooltip.className = 'fixed invisible px-3 py-2 text-sm max-w-xs break-words';
    tempTooltip.innerHTML = typeof content === 'string' ? content : 'Sample text';
    document.body.appendChild(tempTooltip);
    
    const tooltipRect = tempTooltip.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    document.body.removeChild(tempTooltip);

    const newPosition = calculatePosition(triggerRect, tooltipRect, placement);
    setPosition(newPosition);
  }, [content, placement, disabled]);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  }, [delay, disabled, updatePosition]);

  const hideTooltip = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleBlur = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  }, [hideTooltip]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="inline-block"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>
      
      {isVisible && position && (
        <TooltipPortal position={position} className={className}>
          {content}
        </TooltipPortal>
      )}
    </>
  );
};