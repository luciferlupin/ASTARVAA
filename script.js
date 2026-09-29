/**
 * ASTARVAA — Two-Chapter Storytelling Engine
 * Auto-flow sequencing, chapter progress bars, scroll synchronization, and sound management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const storyContainer = document.getElementById('storyContainer');
  const sectionCaliber = document.getElementById('sectionCaliber');
  const sectionSanctum = document.getElementById('sectionSanctum');

  const videoCaliber = document.getElementById('videoCaliber');
  const videoSanctum = document.getElementById('videoSanctum');

  const btnChapter1 = document.getElementById('btnChapter1');
  const btnChapter2 = document.getElementById('btnChapter2');
  const fillChapter1 = document.getElementById('fillChapter1');
  const fillChapter2 = document.getElementById('fillChapter2');

  const cueToSanctum = document.getElementById('cueToSanctum');
  const cueToCaliber = document.getElementById('cueToCaliber');
  const brandHomeLink = document.getElementById('brandHomeLink');

  const soundToggle = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');

  const vipModal = document.getElementById('vipModal');
  const btnNotify = document.getElementById('btnNotify');
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
        // Autoplay policy fallback: mute and retry
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }

  function syncAudioState() {
    if (activeChapter === 1) {
      if (videoCaliber) videoCaliber.muted = !isSoundOn;
      if (videoSanctum) videoSanctum.muted = true;
    } else {
      if (videoSanctum) videoSanctum.muted = !isSoundOn;
      if (videoCaliber) videoCaliber.muted = true;
    }

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
    if (chapterNum === activeChapter && !manual) return;
    activeChapter = chapterNum;

    // Update Nav Pills
    if (btnChapter1 && btnChapter2) {
      if (chapterNum === 1) {
        btnChapter1.classList.add('active');
        btnChapter2.classList.remove('active');
      } else {
        btnChapter2.classList.add('active');
        btnChapter1.classList.remove('active');
      }
    }

    const targetSection = chapterNum === 1 ? sectionCaliber : sectionSanctum;
    if (targetSection) {
      isTransitioning = true;
      targetSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isTransitioning = false;
      }, 1000);
    }

    if (chapterNum === 1) {
      if (videoCaliber) {
        if (manual) videoCaliber.currentTime = 0;
        playVideoSafely(videoCaliber);
      }
      if (videoSanctum) {
        videoSanctum.pause();
      }
    } else {
      if (videoSanctum) {
        if (manual) videoSanctum.currentTime = 0;
        playVideoSafely(videoSanctum);
      }
      if (videoCaliber) {
        videoCaliber.pause();
      }
    }

    syncAudioState();
  }

  // --------------------------------------------------------------------------
  // Progress Bar Tracking & Automatic Video Flow Logic
  // --------------------------------------------------------------------------
  if (videoCaliber) {
    videoCaliber.addEventListener('timeupdate', () => {
      if (videoCaliber.duration) {
        const pct = (videoCaliber.currentTime / videoCaliber.duration) * 100;
        if (fillChapter1) fillChapter1.style.width = `${Math.min(100, pct)}%`;

        // When Video 1 completes (within 250ms of end), smoothly transition to Act II
        if (activeChapter === 1 && !isTransitioning && videoCaliber.currentTime >= videoCaliber.duration - 0.25) {
          if (fillChapter1) fillChapter1.style.width = '100%';
          goToChapter(2, true);
        }
      }
    });

    videoCaliber.addEventListener('ended', () => {
      if (activeChapter === 1 && !isTransitioning) {
        goToChapter(2, true);
      }
    });
  }

  if (videoSanctum) {
    videoSanctum.addEventListener('timeupdate', () => {
      if (videoSanctum.duration) {
        const pct = (videoSanctum.currentTime / videoSanctum.duration) * 100;
        if (fillChapter2) fillChapter2.style.width = `${Math.min(100, pct)}%`;

        // When Video 2 completes, smoothly return to Act I for infinite luxury exhibition loop
        if (activeChapter === 2 && !isTransitioning && videoSanctum.currentTime >= videoSanctum.duration - 0.25) {
          if (fillChapter2) fillChapter2.style.width = '100%';
          goToChapter(1, true);
        }
      }
    });

    videoSanctum.addEventListener('ended', () => {
      if (activeChapter === 2 && !isTransitioning) {
        goToChapter(1, true);
      }
    });
  }

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
          if (chapter === 1) {
            btnChapter1.classList.add('active');
            btnChapter2.classList.remove('active');
            playVideoSafely(videoCaliber);
            if (videoSanctum) videoSanctum.pause();
          } else {
            btnChapter2.classList.add('active');
            btnChapter1.classList.remove('active');
            playVideoSafely(videoSanctum);
            if (videoCaliber) videoCaliber.pause();
          }
          syncAudioState();
        }
      }
    });
  }, observerOptions);

  if (sectionCaliber) sectionObserver.observe(sectionCaliber);
  if (sectionSanctum) sectionObserver.observe(sectionSanctum);

  // --------------------------------------------------------------------------
  // Interactive Navigation Handlers
  // --------------------------------------------------------------------------
  if (btnChapter1) {
    btnChapter1.addEventListener('click', () => goToChapter(1, true));
  }
  if (btnChapter2) {
    btnChapter2.addEventListener('click', () => goToChapter(2, true));
  }
  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      goToChapter(1, true);
    });
  }
  if (cueToSanctum) {
    cueToSanctum.addEventListener('click', () => goToChapter(2, true));
  }
  if (cueToCaliber) {
    cueToCaliber.addEventListener('click', () => goToChapter(1, true));
  }

  // --------------------------------------------------------------------------
  // Sound Toggle Control
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
  if (btnNotify && vipModal) {
    btnNotify.addEventListener('click', () => {
      vipModal.showModal();
    });
  }

  if (modalClose && vipModal) {
    modalClose.addEventListener('click', () => {
      vipModal.close();
    });
  }

  if (vipModal) {
    // Close on backdrop click
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
