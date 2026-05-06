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

  const label = config.label ?? 'Toggle';
  const checked = config.checked?.toLowerCase() === 'true';
  const disabled = config.disabled?.toLowerCase() === 'true';
  const description = config.description ?? '';

  const uid = `switch-${crypto.randomUUID().slice(0, 8)}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'switch-wrapper';

  const control = document.createElement('div');
  control.className = 'switch-control';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'switch-track';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-checked', checked ? 'true' : 'false');
  btn.setAttribute('aria-labelledby', `${uid}-label`);
  if (description) btn.setAttribute('aria-describedby', `${uid}-desc`);
  if (disabled) btn.disabled = true;

  const thumb = document.createElement('span');
  thumb.className = 'switch-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  btn.appendChild(thumb);

  const textDiv = document.createElement('div');
  textDiv.className = 'switch-text';

  const labelEl = document.createElement('span');
  labelEl.id = `${uid}-label`;
  labelEl.className = 'switch-label';
  labelEl.textContent = label;
  textDiv.appendChild(labelEl);

  if (description) {
    const descEl = document.createElement('span');
    descEl.id = `${uid}-desc`;
    descEl.className = 'switch-description';
    descEl.textContent = description;
    textDiv.appendChild(descEl);
  }

  control.append(btn, textDiv);
  wrapper.appendChild(control);

  const toggle = () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', next ? 'true' : 'false');
    block.dispatchEvent(new CustomEvent('switch:change', {
      bubbles: true,
      composed: true,
      detail: { checked: next, label, disabled },
    }));
  };

  btn.addEventListener('click', toggle);

  textDiv.addEventListener('click', () => {
    if (!btn.disabled) btn.click();
  });

  block.replaceChildren(wrapper);

  Object.defineProperty(block, 'switch', {
    configurable: true,
    enumerable: false,
    get() {
      return {
        getChecked: () => btn.getAttribute('aria-checked') === 'true',
        setChecked: (val) => {
          const next = Boolean(val);
          if (btn.getAttribute('aria-checked') === (next ? 'true' : 'false')) return;
          if (!btn.disabled) toggle();
        },
        toggle: () => { if (!btn.disabled) toggle(); },
        getConfig: () => ({ label, disabled: btn.disabled, description }),
      };
    },
  });
}
