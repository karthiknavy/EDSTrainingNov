export default function decorate(block) {
  const raw = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.children]
      .map((c) => c.textContent?.trim())
      .filter(Boolean);
    if (cells.length === 2) {
      const [key, val] = cells;
      raw[key.toLowerCase()] = val;
    }
  });

  const labelText = raw.label ?? 'Select date';
  const format = raw.format ?? 'yyyy-mm-dd';

  const parseDateString = (str) => {
    const sep = format.match(/[^a-z0-9]/i)?.[0] ?? '-';
    const fParts = format.toLowerCase().split(sep);
    const vParts = str.split(sep);

    const di = fParts.findIndex((p) => p === 'dd' || p === 'd');
    const mi = fParts.findIndex((p) => p === 'mm' || p === 'm');
    const yi = fParts.findIndex((p) => p === 'yyyy' || p === 'yy');

    if (di === -1 || mi === -1 || yi === -1) return null;

    const d = parseInt(vParts[di], 10);
    const m = parseInt(vParts[mi], 10);
    let y = parseInt(vParts[yi], 10);

    if (y < 100) y += 2000;
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;

    return new Date(y, m - 1, d);
  };

  const minDate = raw.min ? parseDateString(raw.min) : null;
  const maxDate = raw.max ? parseDateString(raw.max) : null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const uid = `cd-${crypto.randomUUID().slice(0, 8)}`;
  const pad2 = (n) => String(n).padStart(2, '0');
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const isDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) return '';
    const tokens = {
      yyyy: date.getFullYear(),
      yy: String(date.getFullYear()).slice(-2),
      mm: pad2(date.getMonth() + 1),
      m: date.getMonth() + 1,
      dd: pad2(date.getDate()),
      d: date.getDate(),
    };
    return format.replace(/yyyy|yy|mm|m|dd|d/gi, (match) => tokens[match.toLowerCase()]);
  };

  let defaultDate = null;
  const rawDefault = raw.default?.toLowerCase().trim();

  if (rawDefault === 'none') {
    defaultDate = null;
  } else if (!rawDefault || rawDefault === 'today') {
    defaultDate = !isDisabled(todayMidnight) ? todayMidnight : null;
  } else {
    const parsed = parseDateString(raw.default);
    defaultDate = (parsed && !isDisabled(parsed)) ? parsed : null;
  }

  let committedDate = defaultDate;
  let selectedDate = defaultDate;
  let draftValue = '';
  let current = defaultDate
    ? new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  let activeCell = null;
  let isOpen = false;

  // ── DOM ────────────────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'cb-datepicker';

  const labelEl = document.createElement('label');
  labelEl.id = `${uid}-label`;
  labelEl.htmlFor = uid;
  labelEl.textContent = labelText;

  const input = document.createElement('input');
  input.id = uid;
  input.type = 'text';
  input.readOnly = true;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-haspopup', 'dialog');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', `${uid}-dialog`);

  input.placeholder = formatDate(new Date(2000, 0, 31));

  if (defaultDate) {
    input.value = formatDate(defaultDate);
  }

  const dialog = document.createElement('div');
  dialog.id = `${uid}-dialog`;
  dialog.className = 'cb-datepicker-dialog';
  dialog.setAttribute('role', 'dialog');

  dialog.setAttribute('aria-labelledby', `${uid}-label`);

  dialog.setAttribute('aria-modal', 'true');
  dialog.hidden = true;

  const announcement = document.createElement('div');
  announcement.className = 'cb-datepicker-sr-announcement';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');

  // Header
  const header = document.createElement('div');
  header.className = 'cb-datepicker-header';

  const monthSel = document.createElement('select');
  monthSel.setAttribute('aria-label', 'Month');

  const yearSel = document.createElement('select');
  yearSel.setAttribute('aria-label', 'Year');

  for (let i = 0; i < 12; i += 1) {
    monthSel.append(new Option(new Date(2000, i).toLocaleString(undefined, { month: 'long' }), i));
  }

  const yearFrom = minDate?.getFullYear() ?? (today.getFullYear() - 100);
  const yearTo = maxDate?.getFullYear() ?? (today.getFullYear() + 100);
  for (let y = yearFrom; y <= yearTo; y += 1) {
    yearSel.append(new Option(y, y));
  }

  header.append(monthSel, yearSel);

  // Grid
  const table = document.createElement('table');
  table.className = 'cb-datepicker-grid';
  table.setAttribute('role', 'grid');

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) => {
    const th = document.createElement('th');
    th.setAttribute('scope', 'col');
    th.setAttribute('abbr', day);
    th.textContent = day;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'cb-datepicker-footer';

  const okBtn = document.createElement('button');
  okBtn.type = 'button';
  okBtn.textContent = 'OK';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';

  footer.append(okBtn, cancelBtn);
  dialog.append(announcement, header, table, footer);
  wrapper.append(labelEl, input, dialog);
  block.replaceChildren(wrapper);

  function setActiveCell(cell = null) {
    const target = cell
      || tbody.querySelector('td.selected')
      || tbody.querySelector('td[role="gridcell"]:not(.disabled):not([aria-hidden])');

    if (!target) return;

    tbody.querySelectorAll('td[tabindex="0"]').forEach((td) => { td.tabIndex = -1; });
    target.tabIndex = 0;
    target.focus();
    activeCell = target;
  }

  const makeDayClickHandler = (clickDate, clickTd) => () => {
    selectedDate = clickDate;
    input.value = formatDate(clickDate);
    setActiveCell(clickTd);
  };

  const renderCalendar = () => {
    tbody.replaceChildren();
    activeCell = null;

    const y = current.getFullYear();
    const m = current.getMonth();
    monthSel.value = m;
    yearSel.value = y;

    const monthName = new Date(y, m).toLocaleString(undefined, { month: 'long' });
    announcement.textContent = `${monthName} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    let tr = document.createElement('tr');

    for (let i = 0; i < firstDay; i += 1) {
      const empty = document.createElement('td');
      empty.setAttribute('aria-hidden', 'true');
      tr.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(y, m, d);
      const td = document.createElement('td');
      td.textContent = d;
      td.setAttribute('role', 'gridcell');
      td.tabIndex = -1;

      const isToday = date.getFullYear() === todayMidnight.getFullYear()
        && date.getMonth() === todayMidnight.getMonth()
        && date.getDate() === todayMidnight.getDate();
      if (isToday) td.dataset.today = '';

      if (isDisabled(date)) {
        td.classList.add('disabled');
        td.setAttribute('aria-disabled', 'true');
        td.setAttribute('aria-selected', 'false');
      } else {
        const isSelected = committedDate instanceof Date
          && date.getFullYear() === committedDate.getFullYear()
          && date.getMonth() === committedDate.getMonth()
          && date.getDate() === committedDate.getDate();

        td.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) td.classList.add('selected');

        td.addEventListener('click', makeDayClickHandler(date, td));
      }

      tr.appendChild(td);
      if ((firstDay + d) % 7 === 0) {
        tbody.appendChild(tr);
        tr = document.createElement('tr');
      }
    }

    tbody.appendChild(tr);
    setActiveCell();
  };

  const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll(
      'select, button, [tabindex="0"]',
    )].filter((el) => !el.disabled && !el.closest('[aria-hidden="true"]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  let docClickHandler = null;

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    dialog.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    dialog.removeEventListener('keydown', trapFocus);
    if (docClickHandler) document.removeEventListener('click', docClickHandler);
    input.focus();
  };

  const restoreAndClose = () => {
    input.value = draftValue;
    selectedDate = committedDate;
    close();
  };

  // Keyboard navigation
  table.addEventListener('keydown', (e) => {
    if (!activeCell) return;

    const cells = [...tbody.querySelectorAll(
      'td[role="gridcell"]:not(.disabled):not([aria-hidden])',
    )];
    const idx = cells.indexOf(activeCell);
    let next = null;

    switch (e.key) {
      case 'ArrowRight': next = cells[idx + 1]; break;
      case 'ArrowLeft': next = cells[idx - 1]; break;
      case 'ArrowDown': next = cells[idx + 7]; break;
      case 'ArrowUp': next = cells[idx - 7]; break;
      case 'Home': [next] = cells; break;
      case 'End': next = cells[cells.length - 1]; break;
      case 'PageDown':
        current = new Date(current.getFullYear(), current.getMonth() + (e.shiftKey ? 12 : 1), 1);
        renderCalendar();
        e.preventDefault();
        return;
      case 'PageUp':
        current = new Date(current.getFullYear(), current.getMonth() - (e.shiftKey ? 12 : 1), 1);
        renderCalendar();
        e.preventDefault();
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activeCell.click();
        return;
      case 'Escape':
        restoreAndClose();
        return;
      default: return;
    }

    if (next) { e.preventDefault(); setActiveCell(next); }
  });

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    draftValue = input.value;
    selectedDate = committedDate;

    if (committedDate instanceof Date) {
      current = new Date(committedDate.getFullYear(), committedDate.getMonth(), 1);
    }

    dialog.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    dialog.addEventListener('keydown', trapFocus);
    docClickHandler = (e) => {
      if (!e.composedPath().includes(wrapper)) restoreAndClose();
    };
    document.addEventListener('click', docClickHandler);
    renderCalendar();
  };

  input.addEventListener('click', open);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  okBtn.addEventListener('click', () => {
    if (!(selectedDate instanceof Date)) return;
    committedDate = selectedDate;
    input.value = formatDate(committedDate);
    close();
  });

  cancelBtn.addEventListener('click', restoreAndClose);

  monthSel.addEventListener('change', () => {
    current = new Date(current.getFullYear(), +monthSel.value, 1);
    renderCalendar();
  });

  yearSel.addEventListener('change', () => {
    current = new Date(+yearSel.value, current.getMonth(), 1);
    renderCalendar();
  });
}
