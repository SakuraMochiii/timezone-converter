import { useState } from 'react';
import { DateTime } from 'luxon';

function parseHour(str, zone) {
  const s = str.trim();
  const formats = ['h a', 'ha', 'h:mm a', 'h:mma', 'HH:mm', 'H:mm', 'H'];
  for (const fmt of formats) {
    const parsed = DateTime.fromFormat(s, fmt, { zone });
    if (parsed.isValid) return parsed.hour;
  }
  return null;
}

export default function TimeSlider({ value, onChange, onRangeChange, referenceZone, selectedZones, referenceIndex, timeRange }) {
  const [manualInput, setManualInput] = useState('');

  const refTime = DateTime.now()
    .setZone(referenceZone || 'America/Los_Angeles')
    .set({ hour: value, minute: 0, second: 0 });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const input = manualInput.trim();
    if (!input) return;

    if (input.includes('-')) {
      const [startStr, endStr] = input.split('-');
      const startHour = parseHour(startStr, referenceZone);
      const endHour = parseHour(endStr, referenceZone);
      if (startHour !== null && endHour !== null) {
        onRangeChange({ start: startHour, end: endHour });
        onChange(startHour);
        setManualInput('');
        return;
      }
    }

    const hour = parseHour(input, referenceZone);
    if (hour !== null) {
      onChange(hour);
      onRangeChange(null);
      setManualInput('');
    }
  };

  const otherZones = selectedZones.filter((_, i) => i !== referenceIndex);

  return (
    <div className="slider-header">
      <label className="slider-label">
        Time in <strong>{selectedZones[referenceIndex]?.name || 'your zone'}</strong>:
        <span className="slider-time">
          {timeRange
            ? `${formatHour(timeRange.start)} – ${formatHour(timeRange.end)}`
            : refTime.toFormat('h:mm a')
          }
        </span>
      </label>
      <form className="manual-input" onSubmit={handleManualSubmit}>
        <input
          type="text"
          className="time-input"
          placeholder="e.g. 9 AM, 9-5, 9am-5pm"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
        />
        <button type="submit" className="time-input-btn">Go</button>
        {timeRange && (
          <button
            type="button"
            className="time-input-btn clear-btn"
            onClick={() => onRangeChange(null)}
          >
            Clear
          </button>
        )}
      </form>
      {otherZones.length > 0 && (
        <div className="slider-conversions">
          {otherZones.map(zone => {
            if (timeRange) {
              const startConverted = DateTime.now()
                .setZone(referenceZone)
                .set({ hour: timeRange.start, minute: 0, second: 0 })
                .setZone(zone.timezone);
              const endConverted = DateTime.now()
                .setZone(referenceZone)
                .set({ hour: timeRange.end, minute: 0, second: 0 })
                .setZone(zone.timezone);
              const startDay = startConverted.day - DateTime.now().setZone(referenceZone).set({ hour: timeRange.start, minute: 0 }).day;
              const endDay = endConverted.day - DateTime.now().setZone(referenceZone).set({ hour: timeRange.start, minute: 0 }).day;
              const startLabel = startDay !== 0 ? ` (+${startDay}d)` : '';
              const endLabel = endDay !== 0 ? ` (+${endDay}d)` : '';
              return (
                <div key={zone.timezone} className="conversion-row">
                  <span className="conv-name">{zone.name}</span>
                  <span className="conv-time">
                    {startConverted.toFormat('h:mm a')}{startLabel} – {endConverted.toFormat('h:mm a')}{endLabel}
                  </span>
                </div>
              );
            }
            const converted = refTime.setZone(zone.timezone);
            const dayDiff = converted.day - refTime.day;
            const dayLabel = dayDiff > 0 ? ' (+1 day)' : dayDiff < 0 ? ' (-1 day)' : '';
            return (
              <div key={zone.timezone} className="conversion-row">
                <span className="conv-name">{zone.name}</span>
                <span className="conv-time">{converted.toFormat('h:mm a')}{dayLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatHour(h) {
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}
