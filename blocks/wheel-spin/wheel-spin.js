export default function decorate(block) { 
  const container = block.closest('.wheel-spin-container');
 
  const rows = [...block.querySelectorAll(':scope > div')];
  const config = {};
 
  rows.forEach((row) => {
    const cols = row.querySelectorAll('div');
    const key = cols[0]?.textContent.trim();
    const value = cols[1]?.textContent.trim();
    if (key) config[key] = value;
  });
 
  const segments = Object.keys(config)
    .filter((k) => k.startsWith('segment-'))
    .map((k) => config[k]);
 
  const buttonText = config['button-text'] || 'Spin';
  const resultPrefix = config['result-prefix'] || 'You won';
  const storageType = config['storage-type'] || 'localStorage';
  const disableDuringSpin = config['disable-during-spin'] === 'true';
 
  block.innerHTML = '';
 
  const wheel = document.createElement('div');
  wheel.className = 'wheel';

  const pointer = document.createElement('div');
  pointer.className = 'pointer';
 
  const button = document.createElement('button');
  button.className = 'spin-btn';
  button.textContent = buttonText;
 
  const result = document.createElement('div');
  result.className = 'result';
 
  segments.forEach((seg, i) => {
    const slice = document.createElement('div');
    slice.className = 'slice';
    slice.textContent = seg;
 
    const angle = (360 / segments.length) * i;
    slice.style.transform = `rotate(${angle}deg) skewY(${90 - (360 / segments.length)}deg)`;
 
    wheel.appendChild(slice);
  });
 
  block.append(pointer, wheel, button, result);
 
  let spinning = false;
 
  let currentRotation = 0;
   
  button.addEventListener('click', () => {
    if (spinning) return;
   
    spinning = true;
   
    if (disableDuringSpin) {
      button.disabled = true;
    }
   
    const randomIndex = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
   
    currentRotation = currentRotation % 360;
   
    wheel.style.transition = 'none';
    wheel.style.transform = `rotate(${currentRotation}deg)`;
   
    wheel.offsetHeight;
   
    const extraSpins = 5 * 360;
    const pointerOffset = 90; // because pointer is at top
    const targetRotation = extraSpins + (360 - (randomIndex * segmentAngle + segmentAngle / 2) - pointerOffset) - (currentRotation % 360);
   
    currentRotation += targetRotation;
   
    wheel.style.transition = 'transform 3s ease-out';
    wheel.style.transform = `rotate(${currentRotation}deg)`;
   
    setTimeout(() => {
      const selected = segments[randomIndex];
   
      result.textContent = `${resultPrefix}: ${selected}`;
   
      if (storageType === 'localStorage') {
        localStorage.setItem('wheel-result', selected);
      } else {
        sessionStorage.setItem('wheel-result', selected);
      }
   
      spinning = false;
      button.disabled = false;
    }, 3000);
  });
}