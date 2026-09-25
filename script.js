/**
 * ASTARVAA — Photo Atmosphere & Coming Soon
 */

(function () {
  'use strict';

  const photoStage = document.getElementById('photoStage');
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const soundToggle = document.getElementById('soundToggle');

  // Parallax Variables
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const lerpFactor = 0.05;

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

  // Subtle Mouse Parallax
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / width - 0.5) * 2;
    targetY = (e.clientY / height - 0.5) * 2;
  });

  // Device orientation for mobile
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX = Math.min(Math.max(e.gamma / 25, -1), 1);
        targetY = Math.min(Math.max((e.beta - 45) / 25, -1), 1);
      }
    });
  }

  function updateParallax() {
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;

    if (photoStage) {
      photoStage.style.transform = `translate3d(${currentX * 10}px, ${currentY * 7}px, 0)`;
    }
  }

  // --------------------------------------------------------------------------
  // Gentle Golden Dust Particles
  // --------------------------------------------------------------------------
  const particles = [];
  const PARTICLE_COUNT = Math.min(Math.floor(width / 40), 35);

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.3 + 0.12;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.12;
      this.maxOpacity = this.opacity;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.y -= this.speedY;
      this.angle += 0.015;
      this.x += Math.sin(this.angle) * 0.25 + this.speedX + currentX * 0.3;
      this.opacity = (Math.sin(this.angle) * 0.5 + 0.5) * this.maxOpacity;

      if (this.y < -10 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw(context) {
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      const grad = context.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 2
      );
      grad.addColorStop(0, `rgba(255, 238, 205, ${this.opacity})`);
      grad.addColorStop(0.6, `rgba(217, 142, 60, ${this.opacity * 0.7})`);
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

  function loop() {
    updateParallax();
    renderParticles();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --------------------------------------------------------------------------
  // Pure Web Audio API Harmonic Atmosphere
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let masterGain = null;
  let isSoundActive = false;

  function initAmbientAudio() {
    if (audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    const baseFreqs = [108, 162, 216, 324];

    baseFreqs.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 5, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.03 / (index + 1), audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 - index * 60, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start();
    });
  }

  function toggleSound() {
    if (!audioCtx) initAmbientAudio();

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isSoundActive) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 2);
      isSoundActive = true;
      soundToggle.classList.add('active');
    } else {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
      isSoundActive = false;
      soundToggle.classList.remove('active');
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
  }

})();
