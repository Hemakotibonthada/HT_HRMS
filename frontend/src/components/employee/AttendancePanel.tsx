import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import clsx from 'clsx';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { AttendanceDaySummary, AttendanceLog, AttendanceLogPayload, AttendanceMethod, AttendanceType } from '../../types/api';

interface AttendancePanelProps {
  logs: AttendanceLog[];
  summary: AttendanceDaySummary[];
  onRecord: (payload: AttendanceLogPayload) => Promise<void>;
  isRecording: boolean;
  isLoading: boolean;
}

const methodCopy: Record<AttendanceMethod, string> = {
  BIOMETRIC: 'Biometric device',
  GPS: 'GPS capture',
  REMOTE: 'Remote / manual',
};

const typeCopy: Record<AttendanceType, string> = {
  CHECK_IN: 'Check in',
  CHECK_OUT: 'Check out',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
};

export const AttendancePanel = ({ logs, summary, onRecord, isRecording, isLoading }: AttendancePanelProps) => {
  const [type, setType] = useState<AttendanceType>('CHECK_IN');
  const [method, setMethod] = useState<AttendanceMethod>('REMOTE');
  const [deviceId, setDeviceId] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const lastEvent = logs[0];
  const hasOpenSession = lastEvent?.type === 'CHECK_IN';

  const firstSummaryRow = summary[0];
  const totalMinutesWindow = useMemo(() => summary.reduce((total, day) => total + day.totalDurationMinutes, 0), [summary]);

  useEffect(() => {
    if (hasOpenSession) {
      setType('CHECK_OUT');
    }
  }, [hasOpenSession]);

  const resetForm = () => {
    setType(hasOpenSession ? 'CHECK_OUT' : 'CHECK_IN');
    setMethod('REMOTE');
    setDeviceId('');
    setNotes('');
    setLocationName('');
    setLatitude('');
    setLongitude('');
    setFormError(null);
    setLocationError(null);
  };

  const handleMethodChange = (nextMethod: AttendanceMethod) => {
    setMethod(nextMethod);
    setLocationError(null);
    if (nextMethod !== 'BIOMETRIC') {
      setDeviceId('');
    }
    if (nextMethod !== 'GPS') {
      setLatitude('');
      setLongitude('');
    }
    if (nextMethod !== 'REMOTE') {
      setNotes('');
    }
  };

  const handleCaptureLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Browser does not support geolocation.');
      return;
    }

    setIsCapturingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(5));
        setLongitude(position.coords.longitude.toFixed(5));
        if (!locationName) {
          setLocationName('Current location');
        }
        setIsCapturingLocation(false);
      },
      (error) => {
        setLocationError(error.message);
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (method === 'BIOMETRIC' && deviceId.trim().length === 0) {
      setFormError('Provide the biometric device identifier.');
      return;
    }

    if (method === 'GPS' && (latitude.trim().length === 0 || longitude.trim().length === 0)) {
      setFormError('Capture GPS coordinates before submitting.');
      return;
    }

    if (method === 'REMOTE' && notes.trim().length === 0) {
      setFormError('Add a short note to explain the remote check-in/out.');
      return;
    }

    setFormError(null);

    const payload: AttendanceLogPayload = {
      type,
      method,
      deviceId: deviceId || undefined,
      notes: notes || undefined,
      locationName: locationName || undefined,
      latitude: latitude ? Number.parseFloat(latitude) : undefined,
      longitude: longitude ? Number.parseFloat(longitude) : undefined,
    };

    await onRecord(payload);
    resetForm();
  };

  const recentMethods = Array.from(new Set(logs.map((entry) => entry.method))).slice(0, 3);

  return (
    <Card
      title="Attendance"
      subtitle="Capture check-ins, location context, and review recent activity"
      action={
        <Badge variant={hasOpenSession ? 'warning' : 'success'}>
          {hasOpenSession ? 'Checked in' : 'No active session'}
        </Badge>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-xs uppercase tracking-[0.3em] text-blue-200">Action</legend>
              <div className="flex gap-2">
                {(['CHECK_IN', 'CHECK_OUT'] as AttendanceType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={clsx(
                      'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition',
                      type === option ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-300/40',
                    )}
                    disabled={isRecording}
                  >
                    {typeCopy[option]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="space-y-2">
              <legend className="text-xs uppercase tracking-[0.3em] text-blue-200">Method</legend>
              <div className="flex gap-2">
                {(['REMOTE', 'GPS', 'BIOMETRIC'] as AttendanceMethod[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleMethodChange(option)}
                    className={clsx(
                      'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition',
                      method === option ? 'border-emerald-400 bg-emerald-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/40',
                    )}
                    disabled={isRecording}
                  >
                    {methodCopy[option]}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {method === 'BIOMETRIC' && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
                placeholder="Scanner or tablet identifier"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-xs text-slate-400">Typically pre-configured by facilities or security teams.</p>
            </div>
          )}

          {method === 'REMOTE' && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Remote note</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Eg. WFH due to client visit"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          )}

          {method === 'GPS' && (
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-blue-200">Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder="Client site or office name"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="Latitude"
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <input
                    type="text"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="Longitude"
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button type="button" variant="secondary" onClick={handleCaptureLocation} loading={isCapturingLocation}>
                  Use current GPS
                </Button>
              </div>
            </div>
          )}

          {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
          {locationError ? <p className="text-sm text-amber-300">{locationError}</p> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetForm} disabled={isRecording}>
              Reset
            </Button>
            <Button type="submit" variant="secondary" loading={isRecording}>
              {typeCopy[type]}
            </Button>
          </div>
        </form>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Today</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-slate-400">First check-in</p>
                <p className="mt-1 text-base font-semibold text-white">{formatDateTime(firstSummaryRow?.firstCheckIn)}</p>
              </div>
              <div>
                <p className="text-slate-400">Last check-out</p>
                <p className="mt-1 text-base font-semibold text-white">{formatDateTime(firstSummaryRow?.lastCheckOut)}</p>
              </div>
              <div>
                <p className="text-slate-400">Sessions</p>
                <p className="mt-1 text-base font-semibold text-white">{firstSummaryRow?.totalSessions ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-400">Hours logged</p>
                <p className="mt-1 text-base font-semibold text-white">{((firstSummaryRow?.totalDurationMinutes ?? 0) / 60).toFixed(1)} hrs</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              Methods used:
              {recentMethods.length === 0 ? (
                <span className="text-slate-400">No activity yet</span>
              ) : (
                recentMethods.map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-3 py-1">
                    {methodCopy[item]}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Last 30 days</p>
            <p className="mt-2 text-2xl font-semibold text-white">{(totalMinutesWindow / 60).toFixed(1)} hrs</p>
            <p className="text-xs text-slate-400">Summed across recorded sessions</p>
            <div className="mt-4 max-h-64 overflow-y-auto pr-1">
              {isLoading ? (
                <p className="text-xs text-slate-400">Loading attendance records…</p>
              ) : logs.length === 0 ? (
                <p className="text-xs text-slate-400">No attendance logs yet.</p>
              ) : (
                <ul className="space-y-3">
                  {logs.slice(0, 10).map((entry) => (
                    <li key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{typeCopy[entry.type]}</p>
                          <p className="text-xs text-slate-400">{methodCopy[entry.method]}</p>
                        </div>
                        <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      {entry.locationName ? (
                        <p className="mt-2 text-xs text-slate-300">Location: {entry.locationName}</p>
                      ) : null}
                      {entry.notes ? (
                        <p className="mt-1 text-xs text-slate-300">Note: {entry.notes}</p>
                      ) : null}
                      {entry.deviceId ? (
                        <p className="mt-1 text-xs text-slate-300">Device: {entry.deviceId}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
};
