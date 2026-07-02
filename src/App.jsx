import { useState } from 'react';
import WorldMap from './components/WorldMap';
import Timeline from './components/Timeline';
import TimeSlider from './components/TimeSlider';
import OverlapFinder from './components/OverlapFinder';
import { DateTime } from 'luxon';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [selectedZones, setSelectedZones] = useState([]);
  const now = DateTime.now();
  const [currentHour, setCurrentHour] = useState(now.hour);
  const [referenceIndex, setReferenceIndex] = useState(0);
  const [timeRange, setTimeRange] = useState(null);

  const handleAddZone = (zone) => {
    if (!selectedZones.find(z => z.timezone === zone.timezone)) {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleRemoveZone = (timezone) => {
    const newZones = selectedZones.filter(z => z.timezone !== timezone);
    setSelectedZones(newZones);
    if (referenceIndex >= newZones.length) {
      setReferenceIndex(Math.max(0, newZones.length - 1));
    }
  };

  const handleHourChange = (hour) => {
    setCurrentHour(hour);
    setTimeRange(null);
  };

  const referenceZone = selectedZones[referenceIndex]?.timezone;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Timezone Converter</h1>
        <p className="subtitle">Click cities on the map to compare time zones</p>
      </header>

      <WorldMap
        selectedZones={selectedZones}
        onAddZone={handleAddZone}
        onRemoveZone={handleRemoveZone}
      />

      {selectedZones.length > 0 && (
        <div className="selected-badges">
          {selectedZones.map((zone, i) => (
            <button
              key={zone.timezone}
              className={`zone-badge ${i === referenceIndex ? 'reference' : ''}`}
              onClick={() => handleRemoveZone(zone.timezone)}
              title="Click to remove"
            >
              {zone.name} <span className="badge-x">&times;</span>
            </button>
          ))}
        </div>
      )}

      {selectedZones.length > 0 && (
        <div className="reference-picker">
          <label>Reference timezone:</label>
          <select
            value={referenceIndex}
            onChange={e => setReferenceIndex(Number(e.target.value))}
          >
            {selectedZones.map((zone, i) => (
              <option key={zone.timezone} value={i}>{zone.name}</option>
            ))}
          </select>
        </div>
      )}

      <Timeline
        selectedZones={selectedZones}
        currentHour={currentHour}
        onHourChange={handleHourChange}
        onRangeChange={setTimeRange}
        referenceZone={referenceZone}
        timeRange={timeRange}
      >
        <TimeSlider
          value={currentHour}
          onChange={handleHourChange}
          onRangeChange={setTimeRange}
          referenceZone={referenceZone}
          selectedZones={selectedZones}
          referenceIndex={referenceIndex}
          timeRange={timeRange}
        />
      </Timeline>

      <OverlapFinder selectedZones={selectedZones} />
    </div>
  );
}

export default App;
