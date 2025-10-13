const buttonContainer = document.querySelector('.button-container');

if (buttonContainer) {
  buttonContainer.style.display = 'none';

  const customContainer = document.createElement('div');
  customContainer.style.textAlign = 'center';

  const video = document.createElement('video');
  video.src = 'https://www.w3schools.com/howto/rain.mp4';
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.controls = false;
  video.style.width = '100%';
  video.style.maxWidth = '100%'; // Full width
  video.setAttribute('playsinline', '');

  customContainer.appendChild(video);

  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Pause';
  toggleButton.style.marginTop = '10px';

  toggleButton.addEventListener('click', function () {
    if (video.paused) {
      video.play();
      toggleButton.textContent = 'Pause';
    } else {
      video.pause();
      toggleButton.textContent = 'Play';
    }
  });

  customContainer.appendChild(toggleButton);
  buttonContainer.parentNode.insertBefore(customContainer, buttonContainer.nextSibling);

  video.play().catch(err => console.warn('Autoplay failed:', err));
}
