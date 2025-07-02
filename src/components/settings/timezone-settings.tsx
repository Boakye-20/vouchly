import { useState, useEffect } from 'react';
import { useTimezone } from '@/hooks/use-timezone';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// List of common timezones for study abroad locations
const COMMON_TIMEZONES = [
  { value: 'Europe/London', label: 'London (UK)' },
  { value: 'Europe/Paris', label: 'Paris, France' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany' },
  { value: 'America/New_York', label: 'New York, USA' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China' },
  { value: 'Asia/Singapore', label: 'Singapore' },
];

export function TimezoneSettings() {
  const {
    studyingAbroadMode,
    currentLocation,
    timeFormat,
    updatePreferences,
    isLoading
  } = useTimezone();
  
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || 'Europe/London');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(timeFormat || '24h');
  
  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    }
    if (timeFormat) {
      setSelectedTimeFormat(timeFormat);
    }
  }, [currentLocation, timeFormat]);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePreferences({
        studyingAbroadMode,
        currentLocation: selectedLocation,
        timeFormat: selectedTimeFormat as '12h' | '24h',
      });
      // Show success message
    } catch (error) {
      console.error('Failed to save timezone settings:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleStudyingAbroad = async (checked: boolean) => {
    try {
      setIsSaving(true);
      await updatePreferences({
        studyingAbroadMode: checked,
        currentLocation: checked ? selectedLocation : 'Europe/London',
      });
    } catch (error) {
      console.error('Failed to update study abroad status:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Time Zone Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how dates and times are displayed in your timezone
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="studying-abroad">I'm currently studying abroad</Label>
            <p className="text-sm text-muted-foreground">
              Enable to see UK times with your local timezone
            </p>
          </div>
          <Switch
            id="studying-abroad"
            checked={studyingAbroadMode}
            onCheckedChange={toggleStudyingAbroad}
            disabled={isSaving}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Your current location</Label>
          <Select
            value={selectedLocation}
            onValueChange={setSelectedLocation}
            disabled={!studyingAbroadMode || isSaving}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label} (GMT{getTimezoneOffset(tz.value)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Used to show time differences with UK time
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time-format">Time format</Label>
          <Select
            value={selectedTimeFormat}
            onValueChange={(value: '12h' | '24h') => setSelectedTimeFormat(value)}
            disabled={isSaving}
          >
            <SelectTrigger id="time-format" className="w-[180px]">
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
              <SelectItem value="24h">24-hour (14:30)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get timezone offset
function getTimezoneOffset(timeZone: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZoneName: 'short',
      timeZone,
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
    
    // Extract the GMT offset (e.g., "GMT+1")
    const match = timeZoneName.match(/(GMT[+-]\d{1,2}:?\d{0,2})/);
    return match ? match[0] : timeZoneName;
  } catch (e) {
    return '';
  }
}
