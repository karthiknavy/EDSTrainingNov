export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};

  rows.forEach((row) => {
    const cells = [...row.children].map((c) => c.textContent?.trim()).filter(Boolean);
    if (cells.length === 2) {
      const [key, val] = cells;
      config[key.toLowerCase()] = val;
    }
  });

  const toNum = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const min = toNum(config.min, 0);
  const max = toNum(config.max, 100);
  const value = Math.min(max, Math.max(min, toNum(config.value, min)));
  const label = config.label ?? '';
  const unit = config.unit ?? '';
  const low = config.low != null ? toNum(config.low, min) : null;
  const high = config.high != null ? toNum(config.high, max) : null;
  const optimum = config.optimum != null ? toNum(config.optimum, (min + max) / 2) : null;

  const range = max - min;
  const pct = range > 0 ? ((value - min) / range) * 100 : 0;
  const fmt = (v) => (unit ? `${v}${unit}` : `${v}`);
  const toPct = (v) => (range > 0 ? ((v - min) / range) * 100 : 0);

  const getZone = () => {
    if (low === null && high === null) return 'optimal';

    const isInLow = low !== null && value < low;
    const isInHigh = high !== null && value > high;
    const isInNormal = !isInLow && !isInHigh;

    if (optimum === null) {
      return isInNormal ? 'optimal' : 'suboptimal';
    }

    const optInLow = low !== null && optimum <= low;
    const optInHigh = high !== null && optimum >= high;

    if (optInLow) {
      if (isInLow) return 'optimal';
      if (isInNormal) return 'suboptimal';
      return 'bad';
    }
    if (optInHigh) {
      if (isInHigh) return 'optimal';
      if (isInNormal) return 'suboptimal';
      return 'bad';
    }
    if (isInNormal) return 'optimal';
    return 'suboptimal';
  };

  const zone = getZone();
  const uid = `meter-${crypto.randomUUID().slice(0, 8)}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'meter-wrapper';

  const header = document.createElement('div');
  header.className = 'meter-header';

  if (label) {
    const labelEl = document.createElement('span');
    labelEl.id = `${uid}-label`;
    labelEl.className = 'meter-label';
    labelEl.textContent = label;
    header.appendChild(labelEl);
  }

  const valueEl = document.createElement('span');
  valueEl.className = `meter-value meter-value-${zone}`;
  valueEl.textContent = fmt(value);
  header.appendChild(valueEl);

  wrapper.appendChild(header);

  const trackArea = document.createElement('div');
  trackArea.className = 'meter-track-area';
  if (optimum !== null) trackArea.classList.add('meter-track-area-has-optimum');

  const track = document.createElement('div');
  track.className = 'meter-track';
  track.setAttribute('role', 'meter');
  track.setAttribute('aria-valuenow', value);
  track.setAttribute('aria-valuemin', min);
  track.setAttribute('aria-valuemax', max);
  track.setAttribute('aria-valuetext', fmt(value));
  if (label) {
    track.setAttribute('aria-labelledby', `${uid}-label`);
  } else {
    track.setAttribute('aria-label', 'Meter');
  }

  if (low !== null || high !== null) {
    const segments = document.createElement('div');
    segments.className = 'meter-segments';
    segments.setAttribute('aria-hidden', 'true');

    const lowPct = low !== null ? toPct(low) : 0;
    const highPct = high !== null ? toPct(high) : 100;

    if (low !== null) {
      const seg = document.createElement('div');
      seg.className = 'meter-segment meter-segment-low';
      seg.style.width = `${lowPct}%`;
      segments.appendChild(seg);
    }

    const mid = document.createElement('div');
    mid.className = 'meter-segment meter-segment-normal';
    mid.style.width = `${highPct - (low !== null ? lowPct : 0)}%`;
    segments.appendChild(mid);

    if (high !== null) {
      const seg = document.createElement('div');
      seg.className = 'meter-segment meter-segment-high';
      seg.style.width = `${100 - highPct}%`;
      segments.appendChild(seg);
    }

    track.appendChild(segments);
  }

  const fill = document.createElement('div');
  fill.className = `meter-fill meter-fill-${zone}`;
  fill.style.width = `${pct.toFixed(4)}%`;
  fill.setAttribute('aria-hidden', 'true');
  track.appendChild(fill);

  trackArea.appendChild(track);

  const addMarker = (pos, cls) => {
    const marker = document.createElement('div');
    marker.className = `meter-marker ${cls}`;
    marker.style.left = `${toPct(pos).toFixed(4)}%`;
    marker.setAttribute('aria-hidden', 'true');
    trackArea.appendChild(marker);
  };

  if (low !== null) addMarker(low, 'meter-marker-threshold');
  if (high !== null) addMarker(high, 'meter-marker-threshold');
  if (optimum !== null) addMarker(optimum, 'meter-marker-optimum');

  wrapper.appendChild(trackArea);

  const rangeRow = document.createElement('div');
  rangeRow.className = 'meter-range-labels';
  rangeRow.setAttribute('aria-hidden', 'true');

  const minSpan = document.createElement('span');
  minSpan.textContent = fmt(min);

  const maxSpan = document.createElement('span');
  maxSpan.textContent = fmt(max);

  rangeRow.append(minSpan, maxSpan);
  wrapper.appendChild(rangeRow);

  block.replaceChildren(wrapper);
}
