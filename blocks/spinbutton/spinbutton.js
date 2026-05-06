export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};

  rows.forEach((row) => {
    const cells = [...row.children]
      .map((c) => c.textContent?.trim())
      .filter(Boolean);
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
  const step = toNum(config.step, 1);
  const initial = toNum(config.value, min);
  const label = config.label ?? 'Quantity';
  const unit = config.unit ?? '';
  const disabled = config.disabled?.toLowerCase() === 'true';

  const stepDecimals = (step.toString().split('.')[1] ?? '').length;
  const roundToPrecision = (v) => Number(v.toFixed(stepDecimals));

  const clamp = (v) => Math.max(min, Math.min(max, v));
  const snapToStep = (v) => {
    const steps = Math.round((v - min) / step);
    return roundToPrecision(clamp(min + steps * step));
  };

  const formatValue = (v) => (unit ? `${v} ${unit}` : `${v}`);

  let value = snapToStep(initial);

  const uid = `sb-${crypto.randomUUID().slice(0, 8)}`;

  block.replaceChildren();

  const labelEl = document.createElement('label');
  labelEl.className = 'spinbutton-label';
  labelEl.htmlFor = uid;
  labelEl.textContent = label;

  const container = document.createElement('div');
  container.className = 'spinbutton-container';

  const decreaseBtn = document.createElement('button');
  decreaseBtn.type = 'button';
  decreaseBtn.className = 'spinbutton-button spinbutton-button-decrease';
  decreaseBtn.textContent = '−';
  decreaseBtn.setAttribute('aria-label', `Decrease ${label}`);
  decreaseBtn.setAttribute('aria-controls', uid);

  const input = document.createElement('input');
  input.id = uid;
  input.type = 'text';
  input.className = 'spinbutton-input';
  input.setAttribute('role', 'spinbutton');
  input.setAttribute('inputmode', 'decimal');
  input.setAttribute('aria-valuemin', min);
  input.setAttribute('aria-valuemax', max);
  input.setAttribute('aria-valuenow', value);
  input.setAttribute('aria-valuetext', formatValue(value));
  input.value = value;

  const increaseBtn = document.createElement('button');
  increaseBtn.type = 'button';
  increaseBtn.className = 'spinbutton-button spinbutton-button-increase';
  increaseBtn.textContent = '+';
  increaseBtn.setAttribute('aria-label', `Increase ${label}`);
  increaseBtn.setAttribute('aria-controls', uid);

  let unitEl = null;
  if (unit) {
    unitEl = document.createElement('span');
    unitEl.className = 'spinbutton-unit';
    unitEl.textContent = unit;
    unitEl.setAttribute('aria-hidden', 'true');
  }

  const updateButtonStates = () => {
    decreaseBtn.disabled = disabled || value <= min;
    increaseBtn.disabled = disabled || value >= max;
  };

  if (disabled) {
    input.disabled = true;
  }

  const update = (next) => {
    value = snapToStep(next);
    input.value = value;
    input.setAttribute('aria-valuenow', value);
    input.setAttribute('aria-valuetext', formatValue(value));
    updateButtonStates();

    block.dispatchEvent(
      new CustomEvent('spinbutton:change', {
        bubbles: true,
        composed: true,
        detail: {
          value, min, max, step, unit,
        },
      }),
    );
  };

  const handleDecrease = () => update(value - step);
  const handleIncrease = () => update(value + step);

  decreaseBtn.addEventListener('click', handleDecrease);
  increaseBtn.addEventListener('click', handleIncrease);

  const handleInputCommit = () => {
    const parsed = parseFloat(input.value);
    const next = Number.isFinite(parsed) ? parsed : value;
    if (snapToStep(next) === value) {
      input.value = value;
      return;
    }
    update(next);
  };

  input.addEventListener('change', handleInputCommit);
  input.addEventListener('blur', handleInputCommit);

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        handleIncrease();
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleDecrease();
        break;
      case 'Home':
        e.preventDefault();
        update(min);
        break;
      case 'End':
        e.preventDefault();
        update(max);
        break;
      case 'PageUp': {
        e.preventDefault();
        const bigStep = roundToPrecision(Math.round(((max - min) * 0.1) / step) * step);
        update(value + bigStep);
        break;
      }
      case 'PageDown': {
        e.preventDefault();
        const bigStep = roundToPrecision(Math.round(((max - min) * 0.1) / step) * step);
        update(value - bigStep);
        break;
      }
      default:
        break;
    }
  });

  container.append(decreaseBtn, input);
  if (unitEl) container.append(unitEl);
  container.append(increaseBtn);

  block.append(labelEl, container);

  updateButtonStates();

  Object.defineProperty(block, 'spinbutton', {
    configurable: true,
    enumerable: false,
    get() {
      return {
        getValue: () => value,
        setValue: (v) => update(v),
        getConfig: () => ({
          min, max, step, unit, label,
        }),
      };
    },
  });
}
