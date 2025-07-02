import React from 'react';
import { useTimezone } from '@/hooks/use-timezone';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface TimeDisplayProps {
  date: Date | string | number;
  format?: 'full' | 'date' | 'time' | 'relative';
  className?: string;
  showTimeZone?: boolean;
  tooltip?: boolean;
}

export function TimeDisplay({
  date,
  format = 'full',
  className = '',
  showTimeZone = true,
  tooltip = true,
}: TimeDisplayProps) {
  const { formatTime, studyingAbroadMode, getTimeDifferenceMessage } = useTimezone();
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    full: {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    date: {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    relative: {
      // For relative time (e.g., "2 hours ago")
      // We'll handle this differently
    },
  };

  const formattedTime = format === 'relative' 
    ? getRelativeTimeString(new Date(date))
    : formatTime(date, formatOptions[format]);

  const timeZoneInfo = showTimeZone && studyingAbroadMode ? (
    <span className="text-xs text-muted-foreground ml-1">
      (UK time)
    </span>
  ) : null;

  const content = (
    <time 
      dateTime={new Date(date).toISOString()}
      className={`whitespace-nowrap ${className}`}
    >
      {formattedTime}
      {timeZoneInfo}
    </time>
  );

  if (!tooltip) {
    return content;
  }

  const timeDifferenceMessage = getTimeDifferenceMessage();
  const tooltipContent = (
    <div className="text-center">
      <div>{formatTime(date, { ...formatOptions.full, timeZoneName: 'short' })}</div>
      {timeDifferenceMessage && (
        <div className="text-sm mt-1 text-yellow-500">
          {timeDifferenceMessage}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{content}</span>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
// Helper function for relative time (e.g., "2 hours ago")
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Minutes
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Days
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // For older dates, show the actual date
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
