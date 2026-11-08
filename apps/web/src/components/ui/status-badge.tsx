import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

/**
 * Clean, professional SaaS success status badge.
 * - Flat white background
 * - Subtle green border (1px)
 * - 4px border radius
 * - Minimal check-circle icon
 * - Zero unnecessary shadows or gradients
 */
export function StatusBadge({
  label = 'Verified',
  icon,
  size = 'sm',
  className,
  children,
  style,
  ...props
}: StatusBadgeProps) {
  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center select-none font-medium text-emerald-800 transition-colors',
        isSmall ? 'gap-1 px-2 py-0.5 text-[11px] leading-4' : 'gap-1.5 px-2.5 py-1 text-xs leading-4',
        className
      )}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.375rem',
        padding: isSmall ? '0.1875rem 0.5rem' : '0.25rem 0.625rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid #BBF7D0',
        borderRadius: '4px',
        color: '#15803D',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.01em',
        boxShadow: 'none',
        backgroundImage: 'none',
        ...style,
      }}
      {...props}
    >
      {icon ?? (
        <CheckCircle2
          size={isSmall ? 12 : 13}
          strokeWidth={2.2}
          color="#16A34A"
          style={{ flexShrink: 0, color: '#16A34A' }}
          aria-hidden="true"
        />
      )}
      <span style={{ whiteSpace: 'nowrap' }}>{children ?? label}</span>
    </span>
  );
}

export default StatusBadge;

