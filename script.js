/**
 * ASTARVAA — Hero Experience Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroVideo');
  const soundToggle = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');

  // Ensure video autoplays smoothly on all devices
  if (video) {
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback or retry on user interaction
        const resumePlayback = () => {
          video.play();
          document.removeEventListener('click', resumePlayback);
          document.removeEventListener('touchstart', resumePlayback);
        };
        document.addEventListener('click', resumePlayback, { once: true });
        document.addEventListener('touchstart', resumePlayback, { once: true });
      });
    }
  }

  // Audio mute / unmute toggle
  if (soundToggle && video) {
    soundToggle.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        soundToggle.classList.add('is-playing');
        if (soundText) soundText.textContent = 'SOUND ON';
      } else {
        video.muted = true;
        soundToggle.classList.remove('is-playing');
        if (soundText) soundText.textContent = 'SOUND OFF';
      }
    });
  }
});
