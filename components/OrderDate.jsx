'use client';

import { formatDistanceToNow } from 'date-fns';

export function OrderDate({ dateString }) {
  const date = new Date(dateString);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  const fullDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <time dateTime={dateString} title={fullDate} className="text-sm text-gray-500">
      {relativeTime}
    </time>
  );
}