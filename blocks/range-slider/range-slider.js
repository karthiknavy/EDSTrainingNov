export default function decorate(block) {

  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};

  rows.forEach((row) => {
    const cells = [...row.children]
      .map((c) => c.textContent?.trim())
      .filter(Boolean);
    if (cells.length === 2) {
      config[cells[0].toLowerCase()] = cells[1];
    }
  });

  const toNum = (v, f) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : f;
  };

  const min   = toNum(config.min,   0);
  const max   = toNum(config.max,   100);
  const step  = toNum(config.step,  1);
  const value = toNum(config.value, min);

  const label        = config.label ?? '';
  const unit         = config.unit  ?? '';
  const unitPosition = config['unit-position'] ?? 'suffix';
  const showValue    = config['show-value']?.toLowerCase() === 'true';


  const VALID_STYLES  = ['round', 'square', 'pill'];
  const sliderStyle   = VALID_STYLES.includes(config['slider-style'])
    ? config['slider-style']
    : 'round';

  const thumbImage = config['thumb-image'] ?? '';

  const MIN_THUMB  = 8;
  const thumbSize  = toNum(config['thumb-size'], null);
  const safeThumb  = (thumbSize !== null && thumbSize >= MIN_THUMB) ? thumbSize : null;

  const stepDecimals = (step.toString().split('.')[1] ?? '').length;
  const roundDisplay = (v) => Number(v.toFixed(stepDecimals));


  const formatValue = (v) => {
    const rounded = roundDisplay(v);
    if (!unit) return `${rounded}`;
    return unitPosition === 'prefix' ? `${unit}${rounded}` : `${rounded} ${unit}`;
  };


  const uid = `rs-${crypto.randomUUID().slice(0, 8)}`;

  const wrapper = document.createElement('div');
  wrapper.className = `range-slider range-slider--${sliderStyle}`;

  if (thumbImage) {
    const isSafeUrl = (url) => {
      try {
        if (url.startsWith('/') || url.startsWith('.')) return true;
        const parsed = new URL(url, window.location.origin);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    };
    if (isSafeUrl(thumbImage)) {
      wrapper.style.setProperty('--rs-thumb-image', `url(${thumbImage})`);
    }
  }

  if (safeThumb !== null) {
    wrapper.style.setProperty('--rs-thumb-size', `${safeThumb}px`);
  }

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.className   = 'range-slider__label';
    labelEl.htmlFor     = uid;
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  } else {

    if (typeof console !== 'undefined') {

      console.warn('[range-slider] Missing "label" config — provide a descriptive label for accessibility.');
    }
  }

  const input = document.createElement('input');
  input.type      = 'range';
  input.id        = uid;
  input.className = 'range-slider__input';
  input.min       = min;
  input.max       = max;
  input.step      = step;
  input.value     = value;

  input.setAttribute('aria-label',     label || 'Range slider');
  input.setAttribute('aria-valuemin',  min);
  input.setAttribute('aria-valuemax',  max);
  input.setAttribute('aria-valuenow',  value);
  input.setAttribute('aria-valuetext', formatValue(value));

  wrapper.appendChild(input);

  let valueEl = null;
  if (showValue) {
    valueEl = document.createElement('span');
    valueEl.className = 'range-slider__value';
    valueEl.setAttribute('aria-live',   'polite');
    valueEl.setAttribute('aria-atomic', 'true');
    valueEl.textContent = formatValue(value);
    wrapper.appendChild(valueEl);
  }

  const updateAll = (current) => {
    const pct = (((current - min) / (max - min)) * 100).toFixed(4);
    wrapper.style.setProperty('--rs-pct', `${pct}%`);

    input.setAttribute('aria-valuenow',  current);
    input.setAttribute('aria-valuetext', formatValue(current));

    if (valueEl) {
      valueEl.textContent = formatValue(current);
    }
  };


  let dispatchTimer;

  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    updateAll(val);

    clearTimeout(dispatchTimer);
    dispatchTimer = setTimeout(() => {
      block.dispatchEvent(new CustomEvent('range-slider:change', {
        bubbles:  true,
        composed: true,
        detail:   { value: val, label, min, max, unit },
      }));
    }, 80);
  });

  input.addEventListener('keydown', (e) => {
    const bigStep = Math.round(((max - min) * 0.1) / step) * step;
    const current = parseFloat(input.value);

    const deltas = {
      PageUp:   bigStep,
      PageDown: -bigStep,
      Home:     min - current,
      End:      max - current,
    };

    if (!(e.key in deltas)) return;

    e.preventDefault();
    const next = Math.min(max, Math.max(min, current + deltas[e.key]));
    input.value = next;
    updateAll(next);
  });

  updateAll(value);
  block.replaceChildren(wrapper);
}