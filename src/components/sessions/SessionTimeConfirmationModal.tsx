import { useEffect, useState } from "react";
import { format, formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";

interface Props {
  scheduledStartTime: Date;
  durationMinutes: number;
  userTimezone: string;
  partnerTimezone: string;
  partnerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SessionTimeConfirmationModal({
  scheduledStartTime,
  durationMinutes,
  userTimezone,
  partnerTimezone,
  partnerName,
  onConfirm,
  onCancel,
}: Props) {
  const endDate = new Date(scheduledStartTime.getTime() + durationMinutes * 60000);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Confirm Session Time</h2>
        <p className="mb-4">Please confirm the session time below. Both you and your partner will see the session in your local timezones.</p>
        <div className="mb-4">
          <div className="mb-2">
            <span className="font-medium">Your timezone:</span> {userTimezone}
            <br />
            <span className="font-mono">{formatInTimeZone(scheduledStartTime, userTimezone, 'yyyy-MM-dd HH:mm')}</span>
            {' '}to{' '}
            <span className="font-mono">{formatInTimeZone(endDate, userTimezone, 'yyyy-MM-dd HH:mm')}</span>
          </div>
          <div>
            <span className="font-medium">{partnerName}'s timezone:</span> {partnerTimezone}
            <br />
            <span className="font-mono">{formatInTimeZone(scheduledStartTime, partnerTimezone, 'yyyy-MM-dd HH:mm')}</span>
            {' '}to{' '}
            <span className="font-mono">{formatInTimeZone(endDate, partnerTimezone, 'yyyy-MM-dd HH:mm')}</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">Confirm</Button>
        </div>
      </div>
    </div>
  );
}
