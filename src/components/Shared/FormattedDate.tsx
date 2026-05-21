'use client';

import { useEffect, useState } from 'react';

interface FormattedProps {
  isoString: string;
}

export function FormattedTime({ isoString }: FormattedProps) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    if (isoString) {
      setFormatted(
        new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }, [isoString]);

  // Return empty string during server rendering to prevent hydration mismatch
  return <span suppressHydrationWarning>{formatted}</span>;
}

export function FormattedDate({ isoString, options }: FormattedProps & { options?: Intl.DateTimeFormatOptions }) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    if (isoString) {
      const defaultOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      };
      setFormatted(
        new Date(isoString).toLocaleDateString([], options || defaultOptions)
      );
    }
  }, [isoString, options]);

  return <span suppressHydrationWarning>{formatted}</span>;
}
