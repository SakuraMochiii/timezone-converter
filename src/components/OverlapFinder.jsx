import { DateTime } from 'luxon';
import { getHourCategory } from '../utils/timezones';

export default function OverlapFinder({ selectedZones }) {
  if (selectedZones.length < 2) {
    return null;
  }

  const overlaps = [];
  const refZone = selectedZones[0].timezone;

  for (let h = 0; h < 24; h++) {
    const refTime = DateTime.now().setZone(refZone).set({ hour: h, minute: 0, second: 0 });
    const categories = selectedZones.map(zone => {
      const local = refTime.setZone(zone.timezone);
      return getHourCategory(local.hour);
    });

    const allBusiness = categories.every(c => c === 'business');
    const allAwake = categories.every(c => c !== 'sleeping');

    if (allBusiness || allAwake) {
      overlaps.push({ hour: h, allBusiness, refTime });
    }
  }

  const businessSlots = overlaps.filter(o => o.allBusiness);
  const marginalSlots = overlaps.filter(o => !o.allBusiness);

  return (
    <div className="overlap-finder">
      <h3>Best meeting times</h3>
      {businessSlots.length > 0 ? (
        <div className="overlap-section">
          <h4 className="overlap-good">Business hours for everyone:</h4>
          <div className="overlap-slots">
            {formatSlotRanges(businessSlots, refZone)}
          </div>
        </div>
      ) : (
        <p className="overlap-none">No overlapping business hours found.</p>
      )}
      {marginalSlots.length > 0 && (
        <div className="overlap-section">
          <h4 className="overlap-ok">Possible (early/late for some):</h4>
          <div className="overlap-slots">
            {formatSlotRanges(marginalSlots, refZone)}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSlotRanges(slots, refZone) {
  if (slots.length === 0) return null;

  const ranges = [];
  let start = slots[0].hour;
  let end = slots[0].hour;

  for (let i = 1; i < slots.length; i++) {
    if (slots[i].hour === end + 1) {
      end = slots[i].hour;
    } else {
      ranges.push({ start, end });
      start = slots[i].hour;
      end = slots[i].hour;
    }
  }
  ranges.push({ start, end });

  return ranges.map(({ start, end }) => {
    const startTime = DateTime.now().setZone(refZone).set({ hour: start, minute: 0 });
    const endTime = DateTime.now().setZone(refZone).set({ hour: end + 1, minute: 0 });
    return (
      <span key={start} className="slot-range">
        {startTime.toFormat('h:mm a')} – {endTime.toFormat('h:mm a')}
      </span>
    );
  });
}
