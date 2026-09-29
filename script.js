/**
 * ASTARVAA — Haute Horlogerie Engine
 * Single & Multi-World Cinematic Playback Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // World Elements
  const world1 = document.getElementById('world1');
  const world2 = document.getElementById('world2');
  const world3 = document.getElementById('world3');
  const worlds = [world1, world2, world3].filter(Boolean);

  // Videos
  const videoCaliber = document.getElementById('videoCaliber');
  const videoSanctum = document.getElementById('videoSanctum');
  const videoAtelier = document.getElementById('videoAtelier');
  const videos = [videoCaliber, videoSanctum, videoAtelier].filter(Boolean);

  // FX Layers
  const fxPortal = document.getElementById('fxPortal');
  const fxBlueprintScan = document.getElementById('fxBlueprintScan');
  const fxAperture = document.getElementById('fxAperture');

  // World Rail
  const node1 = document.getElementById('node1');
  const node2 = document.getElementById('node2');
  const node3 = document.getElementById('node3');
  const railNodes = [node1, node2, node3].filter(Boolean);
  const railThumb = document.getElementById('railThumb');

  // Nav & Controls
  const brandHomeLink = document.getElementById('brandHomeLink');
  const soundToggle = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');

  // VIP Modal
  const vipModal = document.getElementById('vipModal');
  const notifyTriggers = document.querySelectorAll('.notify-trigger');
  const modalClose = document.getElementById('modalClose');
  const vipForm = document.getElementById('vipForm');
  const formFeedback = document.getElementById('formFeedback');

  // Engine State
  let currentWorld = 1;
  let isTransitioning = false;
  let isSoundOn = false;
  let lastWheelTime = 0;
  let touchStartY = 0;

  // Ensure hero video loops continuously when running single hero mode
  if (videoCaliber) {
    videoCaliber.loop = true;
  }

  // --------------------------------------------------------------------------
  // Rail Thumb Positioning
  // --------------------------------------------------------------------------
  function updateRail(targetIndex) {
    if (railNodes.length === 0) return;
    railNodes.forEach((node, idx) => {
      if (!node) return;
      if (idx + 1 === targetIndex) {
        node.classList.add('active');
        if (railThumb) {
          railThumb.style.transform = `translateY(${idx * 48}px)`;
        }
      } else {
        node.classList.remove('active');
      }
    });
  }

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
      if (index + 1 === currentWorld) {
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
  // World Switcher with Cinematic Transition FX (Active only when multiple worlds exist)
  // --------------------------------------------------------------------------
  function switchWorld(targetIndex, direction = 1) {
    if (worlds.length <= 1) return;
    if (targetIndex === currentWorld || isTransitioning) return;
    if (targetIndex < 1 || targetIndex > worlds.length) return;

    isTransitioning = true;
    const prevIndex = currentWorld;
    currentWorld = targetIndex;

    const prevSlide = worlds[prevIndex - 1];
    const nextSlide = worlds[targetIndex - 1];

    updateRail(targetIndex);

    // 1. Trigger Custom Transition Animation
    if (prevIndex === 1 && targetIndex === 2) {
      if (fxPortal) {
        fxPortal.classList.add('animating');
        setTimeout(() => fxPortal.classList.remove('animating'), 1200);
      }
    } else if (prevIndex === 2 && targetIndex === 3) {
      if (fxBlueprintScan) {
        fxBlueprintScan.classList.add('animating');
        setTimeout(() => fxBlueprintScan.classList.remove('animating'), 1200);
      }
    } else if (prevIndex === 3 && targetIndex === 1) {
      if (fxAperture) {
        fxAperture.classList.add('animating');
        setTimeout(() => fxAperture.classList.remove('animating'), 1300);
      }
    }

    // 2. Animate Slide Layers with Depth Parallax
    if (prevSlide) {
      prevSlide.classList.remove('active');
      if (direction > 0) {
        prevSlide.classList.add('exited-up');
      } else {
        prevSlide.classList.add('exited-down');
      }
    }

    if (nextSlide) {
      nextSlide.classList.remove('exited-up', 'exited-down');
      nextSlide.classList.add('active');
    }

    // 3. Audio & Video Lifecycle
    videos.forEach((vid, idx) => {
      if (!vid) return;
      if (idx + 1 === targetIndex) {
        vid.currentTime = 0;
        playVideoSafely(vid);
      } else {
        setTimeout(() => vid.pause(), 400);
      }
    });

    syncAudioState();

    // 4. Release Transition Lock
    setTimeout(() => {
      if (prevSlide) {
        prevSlide.classList.remove('exited-up', 'exited-down');
      }
      isTransitioning = false;
    }, 1100);
  }

  function nextWorld() {
    if (worlds.length <= 1) return;
    const next = currentWorld === worlds.length ? 1 : currentWorld + 1;
    switchWorld(next, 1);
  }

  function prevWorld() {
    if (worlds.length <= 1) return;
    const prev = currentWorld === 1 ? worlds.length : currentWorld - 1;
    switchWorld(prev, -1);
  }

  // --------------------------------------------------------------------------
  // Automatic Story Flow (Enabled only if multiple worlds exist)
  // --------------------------------------------------------------------------
  function setupVideoFlow(video, worldIndex) {
    if (!video || worlds.length <= 1) return;

    video.addEventListener('timeupdate', () => {
      if (video.duration && worlds.length > 1) {
        if (currentWorld === worldIndex && !isTransitioning && video.currentTime >= video.duration - 0.3) {
          const next = worldIndex === worlds.length ? 1 : worldIndex + 1;
          switchWorld(next, 1);
        }
      }
    });

    video.addEventListener('ended', () => {
      if (currentWorld === worldIndex && !isTransitioning && worlds.length > 1) {
        const next = worldIndex === worlds.length ? 1 : worldIndex + 1;
        switchWorld(next, 1);
      }
    });
  }

  if (worlds.length > 1) {
    setupVideoFlow(videoCaliber, 1);
    setupVideoFlow(videoSanctum, 2);
    setupVideoFlow(videoAtelier, 3);
  }

  // --------------------------------------------------------------------------
  // Gestures & User Interactions (Active only if multiple worlds)
  // --------------------------------------------------------------------------
  if (worlds.length > 1) {
    // Wheel / Trackpad Scroll (Debounced with Luxury Feel)
    window.addEventListener('wheel', (e) => {
      const now = Date.now();
      if (now - lastWheelTime < 950) return;
      if (Math.abs(e.deltaY) > 24) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          nextWorld();
        } else {
          prevWorld();
        }
      }
    }, { passive: true });

    // Touch Swipe
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextWorld();
        } else {
          prevWorld();
        }
      }
    }, { passive: true });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextWorld();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevWorld();
      }
    });

    // Rail Nodes Clicking
    railNodes.forEach((node, idx) => {
      if (node) {
        node.addEventListener('click', () => {
          const target = idx + 1;
          const dir = target >= currentWorld ? 1 : -1;
          switchWorld(target, dir);
        });
      }
    });
  }

  if (brandHomeLink) {
    brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (worlds.length > 1) {
        switchWorld(1, -1);
      }
    });
  }

  // Universal Sound Control
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      syncAudioState();
    });
  }

  // VIP Modal Dialog
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
      const inDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!inDialog) vipModal.close();
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
          submitBtn.textContent = 'NOTIFY ME';
          emailInput.value = '';
          if (formFeedback) formFeedback.textContent = '';
        }, 2200);
      }
    });
  }

  // Initial State
  playVideoSafely(videoCaliber);
  syncAudioState();
  updateRail(1);
});
