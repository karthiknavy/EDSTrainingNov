export default function decorate(block) {
  const rows = [...block.children];
  const config = {};
  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length >= 2) {
      const key = cols[0].textContent.trim().toLowerCase().replace(/\s+/g, '-');
      const value = cols[1].textContent.trim();
      config[key] = value;
    }
  });

  const label = config.label || 'Date of Joining';
  const placeholder = config.placeholder || 'DD/MM/YYYY';
  const fieldName = config.name || 'date-of-joining';
  const errorRequired = config['error-required'] || 'Date of Joining is required.';
  const errorInvalid = config['error-invalid'] || 'Please enter a valid date in DD/MM/YYYY format.';
  const errorFuture = config['error-future'] || 'Date of Joining cannot be a future date.';

  block.textContent = '';

  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'doj-field-wrapper';

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', `doj-${fieldName}`);
  labelEl.textContent = label;
  labelEl.dataset.required = 'true';
  fieldWrapper.append(labelEl);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'doj-input-container';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.id = `doj-${fieldName}`;
  textInput.name = fieldName;
  textInput.placeholder = placeholder;
  textInput.required = true;
  textInput.setAttribute('aria-label', label);
  textInput.setAttribute('aria-required', 'true');
  textInput.setAttribute('autocomplete', 'off');
  textInput.setAttribute('maxlength', '10');
  inputContainer.append(textInput);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'doj-date-picker';
  dateInput.setAttribute('aria-hidden', 'true');
  dateInput.tabIndex = -1;
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  dateInput.setAttribute('max', todayISO);
  inputContainer.append(dateInput);

  const calendarBtn = document.createElement('button');
  calendarBtn.type = 'button';
  calendarBtn.className = 'doj-calendar-btn';
  calendarBtn.setAttribute('aria-label', 'Open date picker');
  calendarBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`;
  inputContainer.append(calendarBtn);

  fieldWrapper.append(inputContainer);

  const errorEl = document.createElement('div');
  errorEl.className = 'doj-error';
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'polite');
  fieldWrapper.append(errorEl);

  block.append(fieldWrapper);

  function parseDDMMYYYY(value) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(regex);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < 1900) return null;

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year
      || date.getMonth() !== month - 1
      || date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    inputContainer.classList.add('doj-invalid');
    textInput.setAttribute('aria-invalid', 'true');
  }

  function clearError() {
    errorEl.textContent = '';
    inputContainer.classList.remove('doj-invalid');
    textInput.removeAttribute('aria-invalid');
  }

  function validate() {
    const value = textInput.value.trim();

    if (!value) {
      showError(errorRequired);
      return false;
    }

    const date = parseDDMMYYYY(value);
    if (!date) {
      showError(errorInvalid);
      return false;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date > now) {
      showError(errorFuture);
      return false;
    }

    clearError();
    return true;
  }

  textInput.addEventListener('input', (e) => {
    let val = textInput.value.replace(/[^0-9/]/g, '');

    const digits = val.replace(/\//g, '');
    if (digits.length <= 2) {
      val = digits;
    } else if (digits.length <= 4) {
      val = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    textInput.value = val;

    if (e.inputType && textInput.value.length < 10) {
      clearError();
    }
  });

  textInput.addEventListener('blur', () => {
    validate();
  });

  calendarBtn.addEventListener('click', () => {
    dateInput.showPicker();
  });

  dateInput.addEventListener('change', () => {
    const val = dateInput.value;
    if (val) {
      const [year, month, day] = val.split('-');
      textInput.value = `${day}/${month}/${year}`;
      clearError();
      validate();
    }
  });

  block.validate = validate;

  const form = block.closest('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      if (!validate()) {
        e.preventDefault();
        textInput.focus();
      }
    });
  }
}
