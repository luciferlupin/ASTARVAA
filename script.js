/**
 * ASTARVAA — Three-Chapter Storytelling Engine
 * Auto-flow sequencing across 3 acts, chapter progress bars, scroll synchronization, and sound management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Container & Sections
  const storyContainer = document.getElementById('storyContainer');
  const sectionCaliber = document.getElementById('sectionCaliber');
  const sectionSanctum = document.getElementById('sectionSanctum');
  const sectionAtelier = document.getElementById('sectionAtelier');

  const sections = [sectionCaliber, sectionSanctum, sectionAtelier];

  // Videos
  const videoCaliber = document.getElementById('videoCaliber');
  const videoSanctum = document.getElementById('videoSanctum');
  const videoAtelier = document.getElementById('videoAtelier');

  const videos = [videoCaliber, videoSanctum, videoAtelier];

  // Chapter Buttons & Progress Bars
  const btnChapter1 = document.getElementById('btnChapter1');
  const btnChapter2 = document.getElementById('btnChapter2');
  const btnChapter3 = document.getElementById('btnChapter3');
  const chapterButtons = [btnChapter1, btnChapter2, btnChapter3];

  const fillChapter1 = document.getElementById('fillChapter1');
  const fillChapter2 = document.getElementById('fillChapter2');
  const fillChapter3 = document.getElementById('fillChapter3');
  const progressFills = [fillChapter1, fillChapter2, fillChapter3];

  // Navigation & Scroll Cue Links
  const brandHomeLink = document.getElementById('brandHomeLink');
  const cueToSanctum = document.getElementById('cueToSanctum');
  const cueToCaliber = document.getElementById('cueToCaliber');
  const cueToAtelier = document.getElementById('cueToAtelier');
  const cueToSanctumFrom3 = document.getElementById('cueToSanctumFrom3');
  const cueRestartToCaliber = document.getElementById('cueRestartToCaliber');

  // Sound Controls
  const soundToggle = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');

  // VIP Modal Elements
  const vipModal = document.getElementById('vipModal');
  const notifyTriggers = document.querySelectorAll('.notify-trigger');
  const modalClose = document.getElementById('modalClose');
  const vipForm = document.getElementById('vipForm');
  const formFeedback = document.getElementById('formFeedback');

  // Application State
  let activeChapter = 1;
  let isSoundOn = false;
  let isTransitioning = false;

  // --------------------------------------------------------------------------
  // Video Playback & Sound Helpers
  // --------------------------------------------------------------------------
  function playVideoSafely(video) {
    if (!video) return;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }

  function syncAudioState() {
    videos.forEach((vid, index) => {
      if (!vid) return;
      if (index + 1 === activeChapter) {
        vid.muted = !isSoundOn;
      } else {
        vid.muted = true;
      }
    });

    if (soundToggle) {
      if (isSoundOn) {
        soundToggle.classList.add('is-playing');
        if (soundText) soundText.textContent = 'SOUND ON';
      } else {
        soundToggle.classList.remove('is-playing');
        if (soundText) soundText.textContent = 'SOUND OFF';
      }
    }
  }

  // --------------------------------------------------------------------------
  // Chapter Navigation & Switching
  // --------------------------------------------------------------------------
  function goToChapter(chapterNum, manual = false) {
    if (chapterNum < 1 || chapterNum > 3) return;
    activeChapter = chapterNum;

    // Update Nav Button Active Highlights
    chapterButtons.forEach((btn, index) => {
      if (!btn) return;
      if (index + 1 === chapterNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const targetSection = sections[chapterNum - 1];
    if (targetSection) {
      isTransitioning = true;
      targetSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isTransitioning = false;
      }, 1000);
    }

    // Manage Video playback for active vs inactive
    videos.forEach((vid, index) => {
      if (!vid) return;
      if (index + 1 === chapterNum) {
        if (manual) vid.currentTime = 0;
        playVideoSafely(vid);
      } else {
        vid.pause();
      }
    });

    syncAudioState();
  }

  // --------------------------------------------------------------------------
  // Progress Bar Tracking & Automatic Story Flow Logic (1 -> 2 -> 3 -> 1)
  // --------------------------------------------------------------------------
  function setupVideoFlow(video, chapterIndex) {
    if (!video) return;
    const fillBar = progressFills[chapterIndex - 1];

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (fillBar) fillBar.style.width = `${Math.min(100, pct)}%`;

        // Near completion (last 250ms), transition to the next chapter
        if (activeChapter === chapterIndex && !isTransitioning && video.currentTime >= video.duration - 0.25) {
          if (fillBar) fillBar.style.width = '100%';
          const nextChapter = chapterIndex === 3 ? 1 : chapterIndex + 1;
          goToChapter(nextChapter, true);
        }
      }
    });

    video.addEventListener('ended', () => {
      if (activeChapter === chapterIndex && !isTransitioning) {
        const nextChapter = chapterIndex === 3 ? 1 : chapterIndex + 1;
        goToChapter(nextChapter, true);
      }
    });
  }

  setupVideoFlow(videoCaliber, 1);
  setupVideoFlow(videoSanctum, 2);
  setupVideoFlow(videoAtelier, 3);

  // --------------------------------------------------------------------------
  // Scroll Synchronization (IntersectionObserver)
  // --------------------------------------------------------------------------
  const observerOptions = {
    root: storyContainer,
    threshold: 0.6
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isTransitioning) {
        const chapter = parseInt(entry.target.getAttribute('data-chapter'), 10);
        if (chapter && chapter !== activeChapter) {
          activeChapter = chapter;

          chapterButtons.forEach((btn, index) => {
            if (!btn) return;
            if (index + 1 === chapter) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });

          videos.forEach((vid, index) => {
            if (!vid) return;
            if (index + 1 === chapter) {
              playVideoSafely(vid);
            } else {
              vid.pause();
            }
          });

          syncAudioState();
        }
      }
    });
  }, observerOptions);

  sections.forEach((sec) => {
    if (sec) sectionObserver.observe(sec);
  });

  // --------------------------------------------------------------------------
  // Interactive Navigation Handlers
  // --------------------------------------------------------------------------
  if (btnChapter1) btnChapter1.addEventListener('click', () => goToChapter(1, true));
  if (btnChapter2) btnChapter2.addEventListener('click', () => goToChapter(2, true));
  if (btnChapter3) btnChapter3.addEventListener('click', () => goToChapter(3, true));

  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      goToChapter(1, true);
    });
  }

  // Scroll Cues between chapters
  if (cueToSanctum) cueToSanctum.addEventListener('click', () => goToChapter(2, true));
  if (cueToCaliber) cueToCaliber.addEventListener('click', () => goToChapter(1, true));
  if (cueToAtelier) cueToAtelier.addEventListener('click', () => goToChapter(3, true));
  if (cueToSanctumFrom3) cueToSanctumFrom3.addEventListener('click', () => goToChapter(2, true));
  if (cueRestartToCaliber) cueRestartToCaliber.addEventListener('click', () => goToChapter(1, true));

  // --------------------------------------------------------------------------
  // Universal Sound Toggle Control
  // --------------------------------------------------------------------------
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      syncAudioState();
    });
  }

  // --------------------------------------------------------------------------
  // VIP Register Interest Dialog
  // --------------------------------------------------------------------------
  notifyTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (vipModal) vipModal.showModal();
    });
  });

  if (modalClose && vipModal) {
    modalClose.addEventListener('click', () => {
      vipModal.close();
    });
  }

  if (vipModal) {
    vipModal.addEventListener('click', (e) => {
      const rect = vipModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        vipModal.close();
      }
    });
  }

  if (vipForm) {
    vipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('vipEmail');
      const submitBtn = document.getElementById('submitBtn');
      if (emailInput && emailInput.value) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'REGISTERED ✓';
        if (formFeedback) {
          formFeedback.textContent = 'Your private invitation request has been registered.';
          formFeedback.className = 'form-feedback success';
        }
        setTimeout(() => {
          if (vipModal) vipModal.close();
          submitBtn.disabled = false;
          submitBtn.textContent = 'JOIN WAITLIST';
          emailInput.value = '';
          if (formFeedback) formFeedback.textContent = '';
        }, 2200);
      }
    });
  }

  // Initial playback start
  playVideoSafely(videoCaliber);
  syncAudioState();
});
