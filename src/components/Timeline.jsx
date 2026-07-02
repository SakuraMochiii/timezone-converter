import { useState, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import { getHourCategory } from '../utils/timezones';

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a';
  if (i < 12) return `${i}a`;
  if (i === 12) return '12p';
  return `${i - 12}p`;
});

function formatHour(h) {
  const normalized = ((h % 24) + 24) % 24;
  if (normalized === 0) return '12 AM';
  if (normalized < 12) return `${normalized} AM`;
  if (normalized === 12) return '12 PM';
  return `${normalized - 12} PM`;
}

function isInRange(hour, range) {
  if (!range) return false;
  const { start, end } = range;
  if (start <= end) {
    return hour >= start && hour < end;
  }
  return hour >= start || hour < end;
}

function getLocalRange(range, referenceZone, targetZone) {
  if (!range) return null;
  const startRef = DateTime.now()
    .setZone(referenceZone)
    .set({ hour: range.start, minute: 0, second: 0 });
  const endRef = DateTime.now()
    .setZone(referenceZone)
    .set({ hour: range.end, minute: 0, second: 0 });
  const startLocal = startRef.setZone(targetZone);
  const endLocal = endRef.setZone(targetZone);
  return { start: startLocal.hour, end: endLocal.hour };
}

function HourBlock({ hour, category, isSelected, isInRange, onMouseDown, onMouseEnter }) {
  const colors = {
    business: '#22c55e',
    marginal: '#f59e0b',
    sleeping: '#374151',
  };

  return (
    <div
      className={`hour-block ${category} ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
      style={{ backgroundColor: colors[category] }}
      title={`${HOUR_LABELS[hour]} - ${category}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
    </div>
  );
}

export default function Timeline({ selectedZones, currentHour, onHourChange, onRangeChange, referenceZone, timeRange, children }) {
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((h) => {
    setDragStart(h);
    setDragging(true);
    onRangeChange({ start: h, end: h + 1 });
  }, [onRangeChange]);

  const handleMouseEnter = useCallback((h) => {
    if (!dragging || dragStart === null) return;
    const start = Math.min(dragStart, h);
    const end = Math.max(dragStart, h) + 1;
    onRangeChange({ start, end });
  }, [dragging, dragStart, onRangeChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  if (selectedZones.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Click cities on the map to compare time zones</p>
      </div>
    );
  }

  return (
    <div
      className="timeline"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="timeline-legend">
        <span className="legend-item"><span className="dot business"></span> Business (9a–6p)</span>
        <span className="legend-item"><span className="dot marginal"></span> Early/Late (7–9a, 6–9p)</span>
        <span className="legend-item"><span className="dot sleeping"></span> Sleeping</span>
      </div>

      {children}

      <div className="slider-row">
        <div className="zone-info"></div>
        <div className="slider-track">
          <input
            type="range"
            min={0}
            max={23}
            value={currentHour}
            onChange={e => onHourChange(Number(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      {selectedZones.map(zone => {
        const now = DateTime.now().setZone(zone.timezone);
        const offset = now.toFormat('ZZZZ');
        const localRange = getLocalRange(timeRange, referenceZone, zone.timezone);

        return (
          <div key={zone.timezone} className="zone-row">
            <div className="zone-info">
              <span className="zone-name">{zone.name}</span>
              <span className="zone-time">{now.toFormat('h:mm a')}</span>
              <span className="zone-offset">{offset}</span>
            </div>
            <div className="hour-strip-wrapper">
              <div className="hour-strip">
                {Array.from({ length: 24 }, (_, h) => {
                  const refTime = DateTime.now()
                    .setZone(referenceZone || selectedZones[0].timezone)
                    .set({ hour: h, minute: 0, second: 0 });
                  const localTime = refTime.setZone(zone.timezone);
                  const localHour = localTime.hour;
                  const category = getHourCategory(localHour);

                  return (
                    <HourBlock
                      key={h}
                      hour={localHour}
                      category={category}
                      isSelected={!timeRange && h === currentHour}
                      isInRange={isInRange(h, timeRange)}
                      onMouseDown={() => handleMouseDown(h)}
                      onMouseEnter={() => handleMouseEnter(h)}
                    />
                  );
                })}
              </div>
              {timeRange && localRange && (
                <div className="range-label">
                  {formatHour(localRange.start)} – {formatHour(localRange.end)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="hour-axis">
        <div className="zone-info"></div>
        <div className="hour-strip-wrapper">
          <div className="hour-strip">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className={`hour-block axis-label ${isInRange(h, timeRange) ? 'in-range' : ''}`}>
                {h % 3 === 0 && <span>{HOUR_LABELS[h]}</span>}
              </div>
            ))}
          </div>
          {timeRange && (
            <div className="range-label ref-range-label">
              {formatHour(timeRange.start)} – {formatHour(timeRange.end)}
            </div>
          )}
        </div>
      </div>
      <p className="axis-note">
        Hours shown in {selectedZones[0]?.name || 'reference'} time — drag across blocks to select an interval
      </p>
    </div>
  );
}
