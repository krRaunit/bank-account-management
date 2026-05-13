/* ============================================================
   "THE ROYAL COURT" — Animation Engine
   Wax seal break · Royal fanfare · 3D cards · Gold particles ·
   Scratch card · Countdown · Scroll reveals · Ambient court music
   ============================================================ */

(function () {
  'use strict';

  /* ========================================================
     AUDIO ENGINE
     ======================================================== */
  var audioCtx = null;
  function ac() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function tone(freq, dur, type, vol) {
    try {
      var c = ac(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.08, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.start(); o.stop(c.currentTime + dur);
    } catch (_) {}
  }

  // Royal fanfare — trumpet-like ascending
  function playFanfare() {
    var notes = [
      { f: 349.23, d: 0.3, delay: 0 },    // F4
      { f: 349.23, d: 0.3, delay: 200 },
      { f: 349.23, d: 0.3, delay: 400 },
      { f: 523.25, d: 0.8, delay: 600 },   // C5
      { f: 440.00, d: 0.3, delay: 1000 },  // A4
      { f: 523.25, d: 0.5, delay: 1200 },  // C5
      { f: 659.25, d: 1.5, delay: 1500 },  // E5 (hold)
    ];
    notes.forEach(function (n) {
      setTimeout(function () { tone(n.f, n.d + 0.6, 'sawtooth', 0.04); }, n.delay);
      setTimeout(function () { tone(n.f * 2, n.d + 0.3, 'sine', 0.025); }, n.delay + 30);
    });
  }

  // Seal crack sound
  function playCrack() {
    tone(120, 0.15, 'square', 0.10);
    setTimeout(function () { tone(80, 0.1, 'square', 0.08); }, 50);
    setTimeout(function () { tone(200, 0.08, 'sawtooth', 0.06); }, 80);
  }

  // Soft bell
  function playBell() { tone(1174.66, 0.5, 'sine', 0.04); }

  // Tinkle
  function playTinkle() { tone(2000 + Math.random() * 1000, 0.12, 'sine', 0.02); }

  // Sparkle reveal
  function playSparkle() {
    [1318.51, 1567.98, 2093.00, 2637.02].forEach(function (f, i) {
      setTimeout(function () { tone(f, 0.5, 'sine', 0.04); }, i * 80);
    });
  }

  // Court music — deep pad + sitar feel
  var courtNodes = [], musicPlaying = false;
  function startCourtMusic() {
    if (musicPlaying) return;
    try {
      var c = ac();
      // Deep drone
      [130.81, 164.81, 196.00].forEach(function (f) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f;
        o.connect(g); g.connect(c.destination);
        g.gain.value = 0.015;
        o.start();
        courtNodes.push({ o: o, g: g });
      });
      // Shimmery highs
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain();
        var lfo = c.createOscillator(), lg = c.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        lfo.type = 'sine'; lfo.frequency.value = 0.1 + i * 0.03;
        lg.gain.value = 0.008;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(c.destination);
        g.gain.value = 0.01;
        o.start(); lfo.start();
        courtNodes.push({ o: o, g: g, l: lfo });
      });
      musicPlaying = true;
    } catch (_) {}
  }

  function stopCourtMusic() {
    courtNodes.forEach(function (n) {
      try { n.o.stop(); if (n.l) n.l.stop(); } catch (_) {}
    });
    courtNodes = []; musicPlaying = false;
  }

  /* ========================================================
     GOLD PARTICLES
     ======================================================== */
  function createParticles(count) {
    var container = document.getElementById('particles');
    if (!container) return;
    for (var i = 0; i < (count || 55); i++) {
      var p = document.createElement('div');
      p.className = 'ptcl';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = '-10px';
      var size = 1.5 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.animationDuration = (10 + Math.random() * 18) + 's';
      p.style.animationDelay = (Math.random() * 16) + 's';
      container.appendChild(p);
    }
  }

  /* ========================================================
     GOLD SPARK BURST
     ======================================================== */
  function goldSpark(cx, cy, count) {
    for (var i = 0; i < (count || 40); i++) {
      var s = document.createElement('div');
      s.className = 'gold-spark';
      s.style.left = cx + 'px';
      s.style.top  = cy + 'px';
      var size = 2 + Math.random() * 5;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      document.body.appendChild(s);

      var angle = Math.random() * Math.PI * 2;
      var dist  = 60 + Math.random() * 200;
      gsap.to(s, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 0.8 + Math.random() * 1,
        ease: 'power2.out',
        onComplete: function () { s.remove(); }
      });
    }
  }

  /* Seal-break shards */
  function sealShards(cx, cy) {
    var colors = ['#A52A2A', '#800020', '#5A0015', '#D4A044', '#F6D989'];
    for (var i = 0; i < 25; i++) {
      var sh = document.createElement('div');
      sh.className = 'seal-shard';
      sh.style.left = cx + 'px';
      sh.style.top  = cy + 'px';
      var w = 4 + Math.random() * 10;
      var h = 4 + Math.random() * 10;
      sh.style.width = w + 'px';
      sh.style.height = h + 'px';
      sh.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(sh);

      var angle = Math.random() * Math.PI * 2;
      var dist  = 80 + Math.random() * 150;
      gsap.to(sh, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 60,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 0.8 + Math.random() * 0.6,
        ease: 'power2.out',
        onComplete: function () { sh.remove(); }
      });
    }
  }

  /* ========================================================
     WAX SEAL BREAK — OPEN ANIMATION
     ======================================================== */
  function openSeal() {
    var sealSection = document.getElementById('royalSeal');
    var main        = document.getElementById('mainInvitation');
    var musicBtn    = document.getElementById('musicBtn');
    var waxSeal     = document.getElementById('waxSeal');

    // Get seal position for shard burst
    var sealRect  = waxSeal.getBoundingClientRect();
    var sealCx    = sealRect.left + sealRect.width / 2;
    var sealCy    = sealRect.top + sealRect.height / 2;

    // Phase 1: Shake the seal
    var tl = gsap.timeline({
      onComplete: function () {
        sealSection.style.display = 'none';
        document.body.style.overflow = '';
        musicBtn.classList.remove('royal-hidden');
        startCourtMusic();
        musicBtn.classList.add('playing');
        animateWelcome();
        initCountdown();
        initScrollReveals();
      }
    });

    // Shake
    tl.to(waxSeal, {
      x: '+=5', duration: 0.05, repeat: 8, yoyo: true, ease: 'none'
    });

    // Crack sound + shards
    tl.add(function () {
      playCrack();
      sealShards(sealCx, sealCy);
    });

    // Wax seal explodes
    tl.to(waxSeal, { scale: 2, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1');

    // Gold spark burst
    tl.add(function () {
      goldSpark(window.innerWidth / 2, window.innerHeight / 2, 60);
    });

    // Fanfare
    tl.add(function () { playFanfare(); }, '-=0.3');

    // Scroll unfurls (rolls up)
    tl.to('.scroll-body', { scaleY: 0, opacity: 0, duration: 0.6, ease: 'power3.in', transformOrigin: 'top center' }, '-=0.2');
    tl.to('.scroll-top-curl, .scroll-bottom-curl', { opacity: 0, duration: 0.3 }, '<');
    tl.to('.seal-corner', { opacity: 0, duration: 0.3 }, '<');

    // Fade entire seal section
    tl.to(sealSection, { opacity: 0, duration: 0.5 });

    // Reveal main
    tl.add(function () {
      main.classList.remove('royal-hidden');
      // Second wave of sparks
      goldSpark(window.innerWidth / 2, window.innerHeight / 3, 40);
    });

    // Main slides up
    tl.from(main, { opacity: 0, y: 40, duration: 1, ease: 'power2.out' });
  }

  /* ========================================================
     WELCOME PAGE — House Cards Entrance
     ======================================================== */
  function animateWelcome() {
    var tl = gsap.timeline({ delay: 0.2 });

    // Emblem
    tl.from('.royal-emblem', { opacity: 0, scale: 0.3, rotation: -60, duration: 1, ease: 'back.out(1.4)' });

    // Label
    tl.from('.welcome-label', { opacity: 0, y: 12, duration: 0.5 }, '-=0.4');

    // Bride card — 3D tilt from left
    tl.from('.house-bride', { opacity: 0, x: -60, rotateY: 30, duration: 0.8, ease: 'power3.out' }, '-=0.2');

    // Heart/Crown
    tl.from('.royal-heart', { opacity: 0, scale: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.3');

    // Groom card — 3D tilt from right
    tl.from('.house-groom', { opacity: 0, x: 60, rotateY: -30, duration: 0.8, ease: 'power3.out' }, '-=0.3');

    // Divider + decree
    tl.from('.welcome-content > .royal-divider', { opacity: 0, scaleX: 0, duration: 0.6 }, '-=0.2');
    tl.from('.welcome-decree', { opacity: 0, y: 12, duration: 0.5 }, '-=0.2');

    // Ornate frame corners pop in
    gsap.utils.toArray('.of-corner').forEach(function (c, i) {
      gsap.from(c, { opacity: 0, scale: 0, duration: 0.4, delay: 0.5 + i * 0.1, ease: 'back.out(2)' });
    });
    gsap.utils.toArray('.of-edge').forEach(function (e, i) {
      gsap.from(e, { scaleX: 0, scaleY: 0, duration: 0.6, delay: 0.7 + i * 0.08 });
    });
  }

  /* ========================================================
     COUNTDOWN TIMER
     ======================================================== */
  function initCountdown() {
    var target = new Date('December 20, 2026 09:00:00').getTime();
    function update() {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      setText('csDays', String(d).padStart(3, '0'));
      setText('csHrs',  String(h).padStart(2, '0'));
      setText('csMins', String(m).padStart(2, '0'));

      var sEl = document.getElementById('csSecs');
      if (sEl) {
        var prev = sEl.textContent;
        var next = String(s).padStart(2, '0');
        if (prev !== next) {
          sEl.textContent = next;
          gsap.from(sEl, { y: -6, opacity: 0.3, duration: 0.25 });
        }
      }
    }
    function setText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }
    update();
    setInterval(update, 1000);
  }

  /* ========================================================
     SCRATCH CARD
     ======================================================== */
  function initScratchCard() {
    var canvas = document.getElementById('scratchCard');
    if (!canvas || canvas._done) return;
    canvas._done = true;
    var ctx = canvas.getContext('2d');
    var w = canvas.parentElement.offsetWidth;
    var h = canvas.parentElement.offsetHeight;
    canvas.width = w; canvas.height = h;

    // Royal velvet + gold gradient
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#2D1854');
    grad.addColorStop(0.2, '#4A0020');
    grad.addColorStop(0.4, '#800020');
    grad.addColorStop(0.5, '#D4A044');
    grad.addColorStop(0.6, '#F6D989');
    grad.addColorStop(0.7, '#D4A044');
    grad.addColorStop(0.85,'#4A0020');
    grad.addColorStop(1,   '#2D1854');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Diamond pattern
    ctx.strokeStyle = 'rgba(246,217,137,0.08)';
    ctx.lineWidth = 0.5;
    for (var i = -h; i < w + h; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - h, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
    }

    // Crown emoji in center
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText('👑', w / 2, h / 2 - 20);

    // Text
    ctx.fillStyle = 'rgba(246,217,137,0.75)';
    ctx.font = '500 14px "Cinzel", serif';
    ctx.fillText('Scratch the Royal Seal', w / 2, h / 2 + 18);

    var isDown = false, revealed = false;

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      var cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - r.left, y: cy - r.top };
    }
    function scratch(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      ctx.fill();
      playTinkle();
      checkReveal();
    }
    function checkReveal() {
      if (revealed) return;
      var d = ctx.getImageData(0, 0, w, h).data;
      var total = d.length / 4, clear = 0;
      for (var i = 3; i < d.length; i += 4) { if (d[i] === 0) clear++; }
      if (clear / total > 0.40) {
        revealed = true;
        gsap.to(canvas, { opacity: 0, duration: 0.5 });
        playSparkle();
        var sr = document.getElementById('scratchReveal');
        if (sr) {
          var r = sr.getBoundingClientRect();
          goldSpark(r.left + r.width / 2, r.top + r.height / 2, 50);
        }
      }
    }

    canvas.addEventListener('mousedown',  function (e) { isDown = true; scratch(pos(e)); });
    canvas.addEventListener('mousemove',  function (e) { if (isDown) scratch(pos(e)); });
    canvas.addEventListener('mouseup',    function ()  { isDown = false; });
    canvas.addEventListener('mouseleave', function ()  { isDown = false; });
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); isDown = true; scratch(pos(e)); }, { passive: false });
    canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); if (isDown) scratch(pos(e)); }, { passive: false });
    canvas.addEventListener('touchend',   function ()  { isDown = false; });
  }

  /* ========================================================
     3D FLIP CARDS — Touch support
     ======================================================== */
  function initFlipCards() {
    document.querySelectorAll('.event-3d').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
        playBell();
      });
    });
  }

  /* ========================================================
     SCROLL REVEALS
     ======================================================== */
  function initScrollReveals() {
    gsap.registerPlugin(ScrollTrigger);

    // Date page
    gsap.from('.date-page .page-title', {
      scrollTrigger: { trigger: '.date-page', start: 'top 80%' },
      opacity: 0, y: 20, duration: 0.7
    });
    gsap.from('.date-subtitle', {
      scrollTrigger: { trigger: '.date-page', start: 'top 80%' },
      opacity: 0, y: 15, duration: 0.6, delay: 0.15
    });

    // Scratch card init
    ScrollTrigger.create({
      trigger: '.scratch-wrapper',
      start: 'top 80%',
      once: true,
      onEnter: function () {
        gsap.from('.scratch-wrapper', { opacity: 0, scale: 0.9, duration: 0.6 });
        initScratchCard();
      }
    });

    // Countdown
    gsap.from('.countdown-strip', {
      scrollTrigger: { trigger: '.countdown-strip', start: 'top 85%' },
      opacity: 0, y: 20, duration: 0.7
    });

    // Events page
    gsap.from('.events-page .page-title', {
      scrollTrigger: { trigger: '.events-page', start: 'top 80%' },
      opacity: 0, y: 20, duration: 0.7
    });
    gsap.from('.events-subtitle', {
      scrollTrigger: { trigger: '.events-page', start: 'top 80%' },
      opacity: 0, duration: 0.5, delay: 0.15
    });

    // Event 3D cards — stagger appearance
    gsap.utils.toArray('.event-3d').forEach(function (card, i) {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 0, y: 40, rotateX: 20, duration: 0.7, delay: i * 0.1,
        ease: 'power3.out',
        onStart: function () {
          playBell();
          var r = card.getBoundingClientRect();
          goldSpark(r.left + r.width / 2, r.top + 10, 8);
        }
      });
    });

    // Royal dividers
    gsap.utils.toArray('.royal-divider').forEach(function (d) {
      gsap.from(d, {
        scrollTrigger: { trigger: d, start: 'top 88%' },
        scaleX: 0, duration: 0.6
      });
    });

    // Closing
    gsap.from('.closing-quote', {
      scrollTrigger: { trigger: '.closing-quote', start: 'top 85%' },
      opacity: 0, y: 20, duration: 0.8
    });
    gsap.from('.closing-crest', {
      scrollTrigger: { trigger: '.closing-crest', start: 'top 85%' },
      opacity: 0, scale: 0.3, duration: 1, ease: 'back.out(1.7)'
    });
    gsap.from('.closing-message', {
      scrollTrigger: { trigger: '.closing-message', start: 'top 88%' },
      opacity: 0, y: 15, duration: 0.7
    });
    gsap.from('.closing-hashtag', {
      scrollTrigger: { trigger: '.closing-hashtag', start: 'top 88%' },
      opacity: 0, y: 10, duration: 0.6
    });
    gsap.from('.royal-stamp', {
      scrollTrigger: { trigger: '.royal-stamp', start: 'top 90%' },
      opacity: 0, scale: 0, rotation: -90, duration: 0.8, ease: 'back.out(2)'
    });
  }

  /* ========================================================
     INTRO — SEAL ENTRANCE ANIMATION
     ======================================================== */
  function animateIntro() {
    var tl = gsap.timeline({ delay: 0.3 });

    // Corners slide in
    tl.from('.seal-corner', { opacity: 0, scale: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' });

    // Scroll unrolls
    tl.from('.scroll-top-curl', { scaleX: 0, duration: 0.4 }, '-=0.2');
    tl.from('.scroll-body', { scaleY: 0, transformOrigin: 'top center', duration: 0.8, ease: 'power2.out' }, '-=0.1');
    tl.from('.scroll-bottom-curl', { scaleX: 0, duration: 0.4 }, '-=0.3');

    // Content fades up
    tl.from('.seal-hindi', { opacity: 0, y: -15, duration: 0.5 }, '-=0.3');
    tl.from('.seal-crest', { opacity: 0, scale: 0.4, duration: 0.8, ease: 'back.out(1.5)' }, '-=0.2');
    tl.from('.seal-decree', { opacity: 0, duration: 0.4 }, '-=0.3');
    tl.from('.sn-bride', { opacity: 0, x: -30, duration: 0.6, ease: 'power3.out' }, '-=0.2');
    tl.from('.sn-amp', { opacity: 0, scale: 0, duration: 0.3, ease: 'back.out(2)' }, '-=0.2');
    tl.from('.sn-groom', { opacity: 0, x: 30, duration: 0.6, ease: 'power3.out' }, '-=0.2');
    tl.from('.seal-subtitle', { opacity: 0, y: 10, duration: 0.5 }, '-=0.2');
    tl.from('.wax-seal', { opacity: 0, scale: 0.5, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.2');
    tl.from('.seal-tap', { opacity: 0, duration: 0.4 }, '-=0.1');
  }

  /* ========================================================
     MOUSE MOVE — 3D tilt on house cards (desktop)
     ======================================================== */
  function initParallaxCards() {
    document.querySelectorAll('.card-3d').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rotateY = ((x - cx) / cx) * 12;
        var rotateX = ((cy - y) / cy) * 8;
        var inner = card.querySelector('.card-3d-inner');
        if (inner) {
          inner.style.transform = 'rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
        }
      });
      card.addEventListener('mouseleave', function () {
        var inner = card.querySelector('.card-3d-inner');
        if (inner) {
          gsap.to(inner, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
        }
      });
    });
  }

  /* ========================================================
     MUSIC TOGGLE
     ======================================================== */
  function initMusicToggle() {
    var btn = document.getElementById('musicBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (musicPlaying) {
        stopCourtMusic();
        btn.classList.remove('playing');
        btn.querySelector('.mb-icon').textContent = '🔇';
      } else {
        startCourtMusic();
        btn.classList.add('playing');
        btn.querySelector('.mb-icon').textContent = '🎺';
      }
    });
  }

  /* ========================================================
     INIT
     ======================================================== */
  function init() {
    document.body.style.overflow = 'hidden';
    createParticles(60);
    initFlipCards();
    initParallaxCards();
    initMusicToggle();

    animateIntro();

    // Seal click
    var sealBtn = document.getElementById('sealBtn');
    if (sealBtn) {
      sealBtn.addEventListener('click', function handler() {
        sealBtn.removeEventListener('click', handler);
        openSeal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
