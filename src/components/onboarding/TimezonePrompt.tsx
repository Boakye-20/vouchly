"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TimezonePrompt({ onSave }: { onSave: (tz: string) => void }) {
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow-md flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Set your timezone</h2>
      <p className="mb-4">We detected your timezone as <b>{timezone}</b>. Is this correct?</p>
      <div className="flex gap-2">
        <Button onClick={() => onSave(timezone)} className="bg-green-600 hover:bg-green-700">Yes, save</Button>
        <Button variant="outline" onClick={() => setTimezone("")}>No, choose manually</Button>
      </div>
      {timezone === "" && (
        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="timezone-select" className="mb-1 text-sm font-medium">Choose your timezone</label>
          <select
            id="timezone-select"
            title="Select your timezone"
            className="border rounded p-2"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            <option value="">Select timezone...</option>
            {Intl.supportedValuesOf('timeZone').map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
