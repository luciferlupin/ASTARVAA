/**
 * ASTARVAA — Interactive Hero Atmosphere
 * Features:
 * - Parallax depth tracking (mouse & gyroscope)
 * - Fine golden particle canvas (sunlit dust motes)
 * - Pure Web Audio API ambient drone synthesis (Harmonic Dawn)
 */

(function () {
  'use strict';

  // DOM Elements
  const heroViewport = document.getElementById('heroViewport');
  const artworkContainer = document.getElementById('artworkContainer');
  const brandHeroContent = document.getElementById('brandHeroContent');
  const sunGlow = document.getElementById('sunGlow');
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const soundToggle = document.getElementById('soundToggle');

  // Parallax State
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const lerpFactor = 0.06;

  // Window bounds
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse Move Parallax Listener
  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / width - 0.5) * 2; // -1 to +1
    const normY = (e.clientY / height - 0.5) * 2; // -1 to +1
    targetX = normX;
    targetY = normY;
  });

  // Mobile Device Orientation Support
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
        targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
      }
    });
  }

  // Animation Loop for Parallax & Particles
  function updateParallax() {
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    if (artworkContainer) {
      artworkContainer.style.transform = `translate3d(${currentX * -14}px, ${currentY * -10}px, 0) scale(1.02)`;
    }

    if (sunGlow) {
      sunGlow.style.transform = `translate(calc(-50% + ${currentX * -22}px), calc(50% + ${currentY * -16}px)) scale(${1 + currentY * 0.05})`;
    }

    if (brandHeroContent) {
      brandHeroContent.style.transform = `translate3d(${currentX * 12}px, ${currentY * 8}px, 0)`;
    }
  }

  // --------------------------------------------------------------------------
  // Golden Dust / Ember Particles
  // --------------------------------------------------------------------------
  const particles = [];
  const PARTICLE_COUNT = Math.min(Math.floor(width / 35), 45);

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = Math.random() * 1.6 + 0.5;
      this.speedY = Math.random() * 0.35 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.55 + 0.15;
      this.maxOpacity = this.opacity;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.y -= this.speedY;
      this.angle += 0.02;
      this.x += Math.sin(this.angle) * 0.35 + this.speedX + currentX * 0.4;

      this.opacity = (Math.sin(this.angle) * 0.5 + 0.5) * this.maxOpacity;

      if (this.y < -10 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw(context) {
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      // Warm golden gradient glow
      const grad = context.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 2.2
      );
      grad.addColorStop(0, `rgba(255, 235, 195, ${this.opacity})`);
      grad.addColorStop(0.5, `rgba(217, 142, 60, ${this.opacity * 0.8})`);
      grad.addColorStop(1, `rgba(180, 75, 30, 0)`);

      context.fillStyle = grad;
      context.fill();
      context.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function renderParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx);
    }
  }

  // Unified RequestAnimationFrame Loop
  function loop() {
    updateParallax();
    renderParticles();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --------------------------------------------------------------------------
  // Pure Web Audio API Ambient Atmosphere (Synthesizer)
  // Generates a soft, meditation dawn drone with zero external assets
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let masterGain = null;
  let isSoundActive = false;
  let activeNodes = [];

  function initAmbientAudio() {
    if (audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Warm Tanpura / Drone Frequencies (Root: 108Hz Vedic Harmonic, with 5th and Octave)
    const baseFreqs = [108, 162, 216, 324, 432];

    baseFreqs.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Subtle detune for rich organic shimmer
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, audioCtx.currentTime);

      // Volume balance
      const individualVolume = 0.035 / (index * 0.7 + 1);
      gain.gain.setValueAtTime(individualVolume, audioCtx.currentTime);

      // Lowpass warmth filter
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 - index * 60, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);

      if (panner) {
        panner.pan.setValueAtTime((index % 2 === 0 ? 0.3 : -0.3), audioCtx.currentTime);
        gain.connect(panner);
        panner.connect(masterGain);
      } else {
        gain.connect(masterGain);
      }

      osc.start();
      activeNodes.push(osc);
    });
  }

  function toggleSound() {
    if (!audioCtx) {
      initAmbientAudio();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isSoundActive) {
      // Fade in smoothly
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.45, audioCtx.currentTime + 2.5);
      isSoundActive = true;
      soundToggle.classList.add('active');
    } else {
      // Fade out smoothly
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
      isSoundActive = false;
      soundToggle.classList.remove('active');
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
  }

})();
