import Typed from 'typed.js';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
let W = window.innerWidth, H = window.innerHeight;
window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; skyC.width = W; skyC.height = H; });

// ═══ SKY CANVAS ══════════════════════════
const skyC = $('#sky'), ctx = skyC.getContext('2d');
skyC.width = W; skyC.height = H;

// Fireflies
function spawnFireflies() {
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    const mx = (rand(-40,40)|0)+'px', my = (rand(-40,40)|0)+'px';
    el.style.cssText = `--ffx:${rand(5,95)}%;--ffy:${rand(15,85)}%;--ffd:${rand(4,9).toFixed(1)}s;--ffo:${rand(3,7).toFixed(1)}s;--ffa:${rand(.4,.9).toFixed(2)};--ffmx:${mx};--ffmy:${my};animation-delay:${rand(0,8).toFixed(1)}s`;
    document.body.appendChild(el);
  }
}
spawnFireflies();

const stars = Array.from({ length: 200 }, () => ({
  x: rand(0, 1), y: rand(0, 1), r: rand(.2, 1.3),
  a: rand(.05, .6), da: rand(.001, .005) * (Math.random() < .5 ? 1 : -1)
}));
const shooters = [];
function spawnShooter() {
  const a = rand(20, 50) * Math.PI / 180;
  shooters.push({ x: rand(0, W * .8), y: rand(0, H * .25), vx: Math.cos(a) * rand(8, 16), vy: Math.sin(a) * rand(8, 16), life: 1, decay: rand(.013, .025), tail: [] });
}
setInterval(() => { if (Math.random() < .7) spawnShooter(); }, 3200);

const wisps = Array.from({ length: 4 }, (_, i) => ({
  x: rand(0, W), y: rand(H * .05, H * .4), w: rand(180, 400), h: rand(40, 70),
  a: rand(.02, .06), spd: rand(.07, .22) * (i % 2 ? -1 : 1)
}));

function skyLoop(t) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#020610'); bg.addColorStop(.5, '#040d1e'); bg.addColorStop(1, '#060f1f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // Nebula aurora — vivid purple/rose blobs
  [[W*.15,H*.28,180,75,.055,'#4f1d96'],[W*.75,H*.18,160,65,.045,'#831843'],[W*.5,H*.72,200,80,.062,'#1e3a5f'],[W*.88,H*.5,130,55,.04,'#5b21b6']].forEach(([ax,ay,rw,rh,a,col]) => {
    const pulse = a * (.65 + Math.sin(t * .0009 + ax * .01) * .35);
    const rv=parseInt(col.slice(1,3),16), gv=parseInt(col.slice(3,5),16), bv=parseInt(col.slice(5,7),16);
    const gr=ctx.createRadialGradient(ax,ay,0,ax,ay,rw);
    gr.addColorStop(0,`rgba(${rv},${gv},${bv},${pulse})`); gr.addColorStop(1,'transparent');
    ctx.save(); ctx.scale(1,rh/rw); ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(ax,ay*(rw/rh),rw,0,Math.PI*2); ctx.fill(); ctx.restore();
  });
  // Moon (white-silver)
  const mx = W * .82, my = H * .1 + Math.sin(t * .0008) * 8, mr = Math.min(W, H) * .09;
  [[mr*5,'rgba(200,215,255,.04)'],[mr*3,'rgba(215,230,255,.09)'],[mr*2,'rgba(235,245,255,.16)'],[mr*1.4,'rgba(250,255,255,.25)']].forEach(([r, c]) => {
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
    g.addColorStop(0, c); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
  });
  const gA = .25 + Math.sin(t * .0012) * .12;
  const gG = ctx.createRadialGradient(mx, my, mr * .85, mx, my, mr * 2);
  gG.addColorStop(0, `rgba(255,255,255,${gA})`); gG.addColorStop(1, 'transparent');
  ctx.fillStyle = gG; ctx.beginPath(); ctx.arc(mx, my, mr * 2, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const rad = (i * 45 + t * .009) * Math.PI / 180;
    ctx.save(); ctx.globalAlpha = .055 + Math.sin(t * .0018 + i) * .025;
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(mx + Math.cos(rad)*mr*1.05, my + Math.sin(rad)*mr*1.05); ctx.lineTo(mx + Math.cos(rad)*mr*2, my + Math.sin(rad)*mr*2); ctx.stroke(); ctx.restore();
  }
  const mg = ctx.createRadialGradient(mx - mr*.28, my - mr*.25, mr*.04, mx, my, mr);
  mg.addColorStop(0, '#ffffff'); mg.addColorStop(.3, '#f8faff'); mg.addColorStop(.7, '#e0ecff'); mg.addColorStop(1, '#aabce0');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
  [[.3, -.1, .09], [-.2, .3, .06], [.1, .25, .04]].forEach(([dx, dy, rf]) => {
    ctx.fillStyle = 'rgba(140,160,210,.07)'; ctx.beginPath(); ctx.arc(mx+dx*mr, my+dy*mr, rf*mr, 0, Math.PI*2); ctx.fill();
  });

  wisps.forEach(w => {
    w.x += w.spd; if (w.x > W + w.w) w.x = -w.w; if (w.x < -w.w) w.x = W + w.w;
    const g = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.w / 2);
    g.addColorStop(0, `rgba(210,225,255,${w.a})`); g.addColorStop(1, 'transparent');
    ctx.save(); ctx.scale(1, w.h / w.w); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(w.x, w.y * (w.w / w.h), w.w / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });

  stars.forEach(s => {
    s.a += s.da; if (s.a > .8 || s.a < .04) s.da *= -1;
    ctx.fillStyle = `rgba(200,220,255,${s.a})`; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
  });

  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.tail.push({ x: s.x, y: s.y }); if (s.tail.length > 20) s.tail.shift();
    s.x += s.vx; s.y += s.vy; s.life -= s.decay;
    ctx.save(); ctx.globalAlpha = s.life; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6; ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
    ctx.beginPath(); s.tail.forEach((p, j) => j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke(); ctx.restore();
    if (s.life <= 0 || s.x > W || s.y > H) shooters.splice(i, 1);
  }
  requestAnimationFrame(skyLoop);
}
requestAnimationFrame(skyLoop);

// ═══ HEARTS ══════════════════════════════
const HC = ['❤', '💕', '💗', '💖', '♡'];
const HCOLS = ['rgba(255,150,170,.9)', 'rgba(255,180,200,.85)', 'rgba(255,200,220,.75)', 'rgba(255,240,248,.7)'];

function spawnHeart(x, y, col, sz) {
  const el = document.createElement('div'); el.className = 'dh'; el.textContent = pick(HC);
  const a = rand(0, Math.PI * 2), d = rand(60, 200), s = sz || rand(.8, 2.2);
  el.style.cssText = `left:${x}px;top:${y}px;--s:${s}rem;--tx:${(Math.cos(a)*d)|0}px;--ty:${(Math.sin(a)*d-rand(30,90))|0}px;--r0:${rand(-20,20)|0}deg;--r1:${rand(-180,180)|0}deg;--dur:${rand(.9,1.8).toFixed(2)}s;--gr:${rand(4,12)|0}px;--gc:${col||pick(HCOLS)};animation-delay:${rand(0,.15).toFixed(2)}s`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2200);
}
function burst(x, y, n = 18) { for (let i = 0; i < n; i++) spawnHeart(x, y); }

// Ambient rising hearts
const rKf = document.createElement('style');
rKf.textContent = `@keyframes rH{0%{opacity:0;transform:translateY(0) scale(.7)}15%{opacity:.8}85%{opacity:.35}100%{opacity:0;transform:translateY(-${H + 80}px) scale(1)}}`;
document.head.appendChild(rKf);
setInterval(() => {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:${rand(5,95)}%;top:${H+10}px;z-index:10;font-size:${rand(.6,1.4)}rem;pointer-events:none;color:rgba(255,170,190,${rand(.12,.4).toFixed(2)});filter:drop-shadow(0 0 ${rand(3,8)|0}px rgba(255,150,170,.35));animation:rH ${rand(5,10).toFixed(1)}s ease-in forwards`;
  el.textContent = pick(['❤', '♡', '💕']);
  document.body.appendChild(el); setTimeout(() => el.remove(), 11000);
}, 1200);

// ═══ TYPEWRITER INTRO ══════════════════════
const twText = $('#tw-text');
const TW_STRING = 'For you, my moon... ❤';
let twIdx = 0;

function typeWriter() {
  if (twIdx <= TW_STRING.length) {
    twText.textContent = TW_STRING.slice(0, twIdx);
    twIdx++;
    setTimeout(typeWriter, twIdx === 1 ? 800 : 70 + Math.random() * 50);
  }
}
setTimeout(typeWriter, 600);

// ═══ PHASE 0 → PHASE 1 ══════════════════════
const pDark = $('#phase-dark');
const pEnv  = $('#phase-envelope');
const pPages = $('#phase-pages');
const sparkle = $('#sparkle');

sparkle.addEventListener('click', startEnvelope);
sparkle.addEventListener('touchstart', startEnvelope, { passive: true });

function startEnvelope() {
  // Sparkle explodes outward
  burst(W / 2, H / 2, 30);
  for (let i = 0; i < 20; i++) {
    setTimeout(() => spawnHeart(rand(W*.2,W*.8), rand(H*.3,H*.7), 'rgba(255,255,255,.7)', rand(.5,1.2)), i * 40);
  }
  pDark.classList.add('exiting');
  setTimeout(() => {
    pDark.classList.add('hidden');
    pEnv.classList.remove('hidden');
  }, 900);
}

// ═══ ENVELOPE OPEN → PAGES ═══════════════
const envEl   = $('#envelope');
const flapWrap = $('#env-flap-wrap');
const envSeal = $('#env-seal');
const envHint = $('#env-hint');

let envTapped = false;
envEl.addEventListener('click', openEnvelope);
envEl.addEventListener('touchstart', openEnvelope, { passive: true });

function openEnvelope() {
  if (envTapped) return; envTapped = true;

  // Step 1 — Envelope shakes (anticipation)
  envEl.style.animation = 'envShake .5s ease';
  const shakeKf = document.createElement('style');
  shakeKf.textContent = `@keyframes envShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-1.5deg) scale(1.01)}40%{transform:rotate(1.5deg)}60%{transform:rotate(-1deg) scale(1.02)}80%{transform:rotate(.8deg)}}`;
  document.head.appendChild(shakeKf);

  // Step 2 — Seal crack: burst + hide seal
  setTimeout(() => {
    burst(W / 2, H * .42, 22);
    for (let i = 0; i < 12; i++) {
      setTimeout(() => spawnHeart(
        W/2 + rand(-50,50), H*.38 + rand(-30,30),
        pick(['rgba(190,24,93,.9)','rgba(249,168,184,.9)','rgba(255,255,255,.8)']),
        rand(.5, 1.1)
      ), i * 30);
    }
    envSeal.classList.add('hide');
    envHint.style.transition = 'opacity .3s';
    envHint.style.opacity = '0';
    $('#env-body-el')?.classList.add('opening');

    // Step 3 — Flap lifts
    setTimeout(() => {
      flapWrap.classList.add('open');

      // Step 4 — Light spills from inside
      setTimeout(() => {
        // Massive heart explosion
        for (let i = 0; i < 50; i++) {
          setTimeout(() => spawnHeart(
            rand(W * .08, W * .92),
            rand(H * .1, H * .9),
            pick(['rgba(249,168,184,.85)','rgba(255,200,220,.8)','rgba(255,255,255,.6)'])
          ), i * 35);
        }
        pEnv.classList.add('hidden');
        pPages.classList.remove('hidden');
        showPage(0);
        startAudio(); // ♪ fade-in music when first letter appears
      }, 1000);
    }, 300);
  }, 500);
}

// ═══ AUDIO ═════════════════════════════
const bgAudio = new Audio(`${import.meta.env.BASE_URL}audio.mp3`);
bgAudio.loop = true;
bgAudio.volume = 0;
let audioStarted = false;

function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  bgAudio.play().then(() => {
    // Smooth fade-in over 3 seconds
    let vol = 0;
    const step = 0.01;
    const interval = setInterval(() => {
      vol = Math.min(vol + step, 0.65);
      bgAudio.volume = vol;
      if (vol >= 0.65) clearInterval(interval);
    }, 45);
  }).catch(() => {
    // Autoplay blocked — retry on next user interaction
    const retry = () => { startAudio(); document.removeEventListener('touchstart', retry); document.removeEventListener('click', retry); };
    document.addEventListener('touchstart', retry, { once: true });
    document.addEventListener('click', retry, { once: true });
  });
}

// ═══ PAGES ════════════════════════════════
const TOTAL_PAGES = 7;
let currentPage = 0;

// Build dots
const dotsEl = $('#page-dots');
for (let i = 0; i < TOTAL_PAGES; i++) {
  const d = document.createElement('button'); d.className = 'pd' + (i === 0 ? ' active' : '');
  d.addEventListener('click', e => { e.stopPropagation(); showPage(i); });
  dotsEl.appendChild(d);
}
const pdots = $$('.pd');

const btnPrev = $('#btn-prev');
const btnNext = $('#btn-next');
btnPrev.classList.add('hidden');

let inPageTransition = false;

function showPage(idx, direction) {
  if (inPageTransition && idx !== 0) return;
  const pages = $$('.page');
  const dir = direction ?? (idx > currentPage ? 'forward' : 'back');
  const exitClass = dir === 'forward' ? 'exiting-left' : 'exiting-right';

  // Exit current page cinematically
  const fromPage = pages[currentPage];
  if (fromPage && fromPage.classList.contains('visible') && idx !== currentPage) {
    inPageTransition = true;
    fromPage.classList.remove('visible');
    fromPage.classList.add(exitClass);

    // Heart burst on transition
    const bx = dir === 'forward' ? W * .75 : W * .25;
    for (let i = 0; i < 14; i++) {
      setTimeout(() => spawnHeart(
        bx + rand(-60, 60), H * .5 + rand(-80, 80),
        pick(['rgba(249,168,184,.8)', 'rgba(255,200,220,.75)', 'rgba(255,255,255,.6)'])
      ), i * 30);
    }

    setTimeout(() => {
      fromPage.classList.remove(exitClass);
      fromPage.classList.add('hidden');
      _activatePage(pages, idx);
      inPageTransition = false;
    }, 620);
  } else {
    _activatePage(pages, idx);
  }

  pdots.forEach((d, i) => d.classList.toggle('active', i === idx));
  btnPrev.classList.toggle('hidden', idx === 0);
  btnNext.classList.toggle('hidden', idx === TOTAL_PAGES - 1);
  currentPage = idx;
}

// ═══ TYPED.JS ENGINE ══════════════════════
const pageTypedTexts = {
  1: `Sometimes, I hate this screen.<br><br>I hate it because it lets me see your smile but won't let me dry your tears. I spend my nights imagining I'm right there, sitting by your side, just listening to you breathe without saying a word.<br><br>It hurts me to know there are moments when you need a physical hug and I can only offer you words. But I want you to know something: every kilometer separating us is just a testament to how much I love you.<br><br>I'd rather wait a thousand years for you than have anyone else by my side tomorrow. You are the thought that makes me wake up wanting to be better, and I won't get tired of fighting for the day when I no longer have to say goodbye to you through a video call. ❤`,
  2: `I know that sometimes you feel like a fire that no one can put out. I know there are days when you look in the mirror and you don't like what you see, or when you feel like you're 'too much' for someone to handle.<br><br>But look at me. I don't see a fire; I see a light that brightens my entire life. Your shadows don't scare me, nor do your silences, or your deepest fears.<br><br>While the rest of the world walks away when things get tough, I'm going to take a step forward and hold you tighter. You don't have to carry it all alone. Let me be your feet when you can't walk and your peace when everything is too loud.<br><br>You are safe here. With me, you will always be safe. 🌙`,
  3: `You told me I'm your favorite human, but the truth is, you rescued me. Before you, I was just existing—working and following a routine. You brought color to my world.<br><br>Seeing how hard you try, how you survive despite everything you've been through, fills me with a pride I can't even explain. Everything I'm building—every promotion at work, every cent I save, every plan... it all has your name carved into it.<br><br>I'm not just working for a future for myself; I'm working for a future for us. You are the woman I want to take care of until we are old, the one I want to see wake up every morning.<br><br>You are my home, no matter where you are on the map. 💕`,
  4: `If you ever doubt yourself, if you ever feel like you aren't enough or that this world is too cruel, come here and read this: I chose you.<br><br>I didn't choose you for your good days; I chose all of you, with your wounds and your dreams. I promise I'll be there when you arrive in August, and I'll be there in November, and I'll be there every year that life grants us.<br><br>You aren't an option; you are my destiny. Cry if you have to cry, but do it knowing that my arms are already around you in my mind.<br><br>I love you more than language allows me to express.<br><br>Always yours, always your rock. ❤`
};

const typedInstances = {};
const typedDone = {};
const scrollStops = {};

// Smooth lerp scroll-follower: gently chases the bottom as text is typed
function startScrollFollower(wrap, idx) {
  if (scrollStops[idx]) scrollStops[idx](); // cancel any existing
  let rafId;
  function tick() {
    if (typedDone[idx]) { cancelAnimationFrame(rafId); return; }
    const overflow = wrap.scrollHeight - wrap.clientHeight;
    if (overflow > 0) {
      const delta = overflow - wrap.scrollTop;
      if (delta > 1) wrap.scrollTop += delta * 0.055; // gentle lerp chase
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
  scrollStops[idx] = () => cancelAnimationFrame(rafId);
}

function startTyped(idx) {
  if (!pageTypedTexts[idx]) return;
  if (typedInstances[idx]) { typedInstances[idx].destroy(); }
  if (scrollStops[idx]) { scrollStops[idx](); }
  typedDone[idx] = false;
  const target = document.getElementById(`typed-p${idx}`);
  if (!target) return;
  target.innerHTML = '';
  const hint = $(`.typed-hint-${idx}`);
  if (hint) hint.textContent = 'Swipe to skip ›';
  const wrap = target.closest('.typed-wrap');

  typedInstances[idx] = new Typed(`#typed-p${idx}`, {
    strings: [pageTypedTexts[idx]],
    typeSpeed: 48,       // relaxed, romantic pace
    showCursor: true,
    cursorChar: '|',
    html: true,
    onStringTyped: () => {},
    onComplete: () => {
      typedDone[idx] = true;
      if (scrollStops[idx]) scrollStops[idx]();
      // Smooth scroll to very end after finishing
      if (wrap) wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });
      if (hint) hint.textContent = 'Swipe to continue ›';
    }
  });

  // Start scroll follower after a brief delay so wrap has content
  if (wrap) setTimeout(() => startScrollFollower(wrap, idx), 200);
}

function skipTyped(idx) {
  if (!pageTypedTexts[idx]) return false;
  if (typedDone[idx]) return false;
  if (typedInstances[idx]) { typedInstances[idx].destroy(); }
  if (scrollStops[idx]) scrollStops[idx]();
  const target = document.getElementById(`typed-p${idx}`);
  if (target) target.innerHTML = pageTypedTexts[idx];
  typedDone[idx] = true;
  const hint = $(`.typed-hint-${idx}`);
  if (hint) hint.textContent = 'Swipe to continue ›';
  // Smooth scroll to bottom after reveal
  const wrap = target?.closest('.typed-wrap');
  if (wrap) setTimeout(() => wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' }), 80);
  return true;
}

function _activatePage(pages, idx) {
  pages.forEach((p, i) => {
    if (i !== idx) { p.classList.add('hidden'); p.classList.remove('visible'); }
  });
  const toPage = pages[idx];
  toPage.classList.remove('hidden', 'exiting-left', 'exiting-right');
  void toPage.offsetWidth;
  toPage.classList.add('visible');
  // Start Typed.js after title animation finishes (~0.6s)
  if (pageTypedTexts[idx]) setTimeout(() => startTyped(idx), 600);
}

btnPrev.addEventListener('click', e => { e.stopPropagation(); if (currentPage > 0) showPage(currentPage - 1, 'back'); });
btnNext.addEventListener('click', e => { e.stopPropagation(); if (currentPage < TOTAL_PAGES - 1) showPage(currentPage + 1, 'forward'); });

// Tap on page = ONLY skips typing. Navigation is swipe-only.
$$('.page').forEach((p, idx) => {
  let tapStartX = 0, tapStartY = 0;
  p.addEventListener('touchstart', e => {
    if (e.target.closest('.big-gi, .gi, .page-arrow, .pd')) return;
    tapStartX = e.touches[0].clientX;
    tapStartY = e.touches[0].clientY;
  }, { passive: true });
  p.addEventListener('touchend', e => {
    if (e.target.closest('.big-gi, .gi, .page-arrow, .pd')) return;
    const dx = Math.abs(e.changedTouches[0].clientX - tapStartX);
    const dy = Math.abs(e.changedTouches[0].clientY - tapStartY);
    if (dx < 12 && dy < 12) skipTyped(idx); // pure tap — skip typing only
  }, { passive: true });
  // Desktop click — skip typing only
  p.addEventListener('click', e => {
    if (e.target.closest('.big-gi, .gi, .page-arrow, .pd')) return;
    skipTyped(idx);
  });
});

// ═══ LIGHTBOX ═════════════════════════════
const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbBox = $('.lb-box'), lbClose = $('#lb-close');
let lbOpenTime = 0; // guard against immediate accidental close
let lastLbSrc = '';  // track which image was last opened

function openLB(src, cap) {
  lbOpenTime = Date.now();
  lastLbSrc = src;
  lbImg.src = src;
  lbCap.textContent = cap;
  lbBox.classList.remove('closing');
  lb.classList.remove('lb-hidden');
  burst(W / 2, H / 2, 14);
}
function closeLB() {
  if (Date.now() - lbOpenTime < 400) return;
  lbBox.classList.add('closing');
  const wasSrc = lastLbSrc;
  setTimeout(() => {
    lb.classList.add('lb-hidden');
    lbImg.src = '';
    // Reveal "one more thing" only after 3rd image closes
    if (wasSrc.includes('images/3.png') && omtBtn) {
      setTimeout(() => omtBtn.classList.add('show'), 50);
    }
  }, 380);
}

// Wire both old .gi and new .big-gi
$$('.gi, .big-gi').forEach(gi => {
  const open = (e) => { if(e) e.stopPropagation(); openLB(gi.dataset.src, gi.dataset.cap); };
  gi.addEventListener('click', open);
  gi.addEventListener('touchstart', e => {
    e.stopPropagation();
    swipeLocked = true; // block swipe when touching a gallery item
    openLB(gi.dataset.src, gi.dataset.cap);
  }, { passive: true });
  gi.addEventListener('touchend', e => { e.stopPropagation(); }, { passive: true });
});
lbClose.addEventListener('click', closeLB);
// Only close lightbox if the bg itself was the direct target
$('.lb-bg').addEventListener('click', e => { if (e.target === e.currentTarget) closeLB(); });
$('.lb-bg').addEventListener('touchend', e => { if (e.target === e.currentTarget) closeLB(); }, { passive: true });

// ═══ SWIPE GESTURES (pages left ↔ right) ═
let swipeStartX = 0, swipeStartY = 0, swipeLocked = false;
const pagesStage = $('#pages-stage');
pagesStage.addEventListener('touchstart', e => {
  swipeLocked = !!e.target.closest('.big-gi, .gi, #lightbox, .lb-box');
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
}, { passive: true });

pagesStage.addEventListener('touchend', e => {
  if (swipeLocked) { swipeLocked = false; return; }
  if (lb && !lb.classList.contains('lb-hidden')) return;
  const dx = e.changedTouches[0].clientX - swipeStartX;
  const dy = e.changedTouches[0].clientY - swipeStartY;
  // Require clear horizontal swipe: >65px, and more horizontal than vertical
  if (Math.abs(dx) < 65 || Math.abs(dy) > Math.abs(dx) * .7) return;
  if (dx < 0) {
    // Swipe left: skip typing first if in progress, otherwise advance
    if (skipTyped(currentPage)) return;
    if (currentPage < TOTAL_PAGES - 1) { burst(W * .75, H * .5, 10); showPage(currentPage + 1, 'forward'); }
  } else {
    // Swipe right: go back
    if (currentPage > 0) { burst(W * .25, H * .5, 10); showPage(currentPage - 1, 'back'); }
  }
}, { passive: true });

// ═══ ONE MORE THING — VOICE MOMENT ═══════
const omtBtn    = $('#omt-btn');
const voiceEl   = $('#phase-voice');
const voicePhrase = $('#voice-phrase');
const voiceHeart  = $('#voice-heart');

// ── Fade out background music smoothly ──
function fadeOutBgAudio(duration = 2200, cb) {
  const startVol = bgAudio.volume;
  const steps = 40;
  const stepTime = duration / steps;
  const dec = startVol / steps;
  let s = 0;
  const iv = setInterval(() => {
    s++;
    bgAudio.volume = Math.max(0, startVol - dec * s);
    if (s >= steps) {
      clearInterval(iv);
      bgAudio.pause();
      bgAudio.volume = 0;
      if (cb) cb();
    }
  }, stepTime);
}

// ── Phrase timeline ─────────────────────
// ⚠️  Adjust 'at' values after listening to cuak.mp3
const VOICE_PHRASES = [
  { text: 'Babe...',                           at: 1.0  },
  { text: 'look at how far we\'ve come.',      at: 4.5  },
  { text: 'We\'re almost there.',              at: 9.0  },
  { text: 'Just...',                           at: 12.5 },
  { text: 'hold on a little longer.',          at: 14.0 },
  { text: 'I\'m your rock, and you are my home.',  at: 17.5 },
  { text: 'I love you,',                            at: 22.0 },
  { text: 'and I\'ll see you soon.',                at: 24.0 },
];

// Build waveform HTML
const waveDiv = document.createElement('div');
waveDiv.className = 'voice-wave';
waveDiv.innerHTML = '<span></span>'.repeat(7);
voiceEl.querySelector('.voice-overlay').insertBefore(waveDiv, voiceHeart);

const voiceAudio = new Audio(`${import.meta.env.BASE_URL}cuak.mp3`);
let voiceTimers = [];

function clearVoiceTimers() { voiceTimers.forEach(clearTimeout); voiceTimers = []; }

function startVoiceMoment() {
  clearVoiceTimers();
  voicePhrase.textContent = '';
  voicePhrase.className = 'voice-phrase';
  voiceHeart.classList.remove('show');
  waveDiv.classList.remove('active');

  // 1. Show overlay + fade to dark
  voiceEl.classList.remove('voice-hidden');
  voiceEl.classList.add('voice-active');
  voiceAudio.currentTime = 0;

  // 2. Start audio after darkness settles (1.8s fade)
  const t0 = setTimeout(() => {
    voiceAudio.play().catch(() => {});
    waveDiv.classList.add('active');

    // 3. Schedule each phrase
    VOICE_PHRASES.forEach((p, i) => {
      const tShow = setTimeout(() => {
        voicePhrase.className = 'voice-phrase phrase-dim';
        void voicePhrase.offsetWidth;
        voicePhrase.textContent = p.text;
        voicePhrase.classList.remove('phrase-dim');
        voicePhrase.classList.add('phrase-show');
      }, p.at * 1000);
      voiceTimers.push(tShow);
    });

    // 4. After audio ends — stop wave, fade everything, show ONLY heart
    voiceAudio.onended = () => {
      waveDiv.classList.remove('active');
      // Fade out phrase and wave completely
      voicePhrase.style.transition = 'opacity 1s ease';
      voicePhrase.style.opacity = '0';
      waveDiv.style.transition = 'opacity 1s ease';
      waveDiv.style.opacity = '0';
      const th = setTimeout(() => {
        // Also hide phrase-wrap so layout centers on heart
        const pw = $('#voice-phrase-wrap');
        if (pw) { pw.style.transition = 'opacity .8s ease'; pw.style.opacity = '0'; }
        setTimeout(() => {
          voiceHeart.classList.add('show');
          // Subtle heart particle burst
          for (let i = 0; i < 14; i++) {
            setTimeout(() => spawnHeart(
              W/2 + rand(-60,60), H/2 + rand(-60,60),
              pick(['rgba(249,168,184,.9)','rgba(255,200,220,.8)','rgba(255,255,255,.7)'])
            ), i * 80);
          }
        }, 400);
      }, 600);
      voiceTimers.push(th);
    };
  }, 1900);
  voiceTimers.push(t0);
}

if (omtBtn) {
  const doOMT = () => {
    // Fade out background music first, then start voice moment
    if (!bgAudio.paused) {
      fadeOutBgAudio(2000, startVoiceMoment);
    } else {
      startVoiceMoment();
    }
  };
  omtBtn.addEventListener('click', e => { e.stopPropagation(); doOMT(); });
  omtBtn.addEventListener('touchstart', e => { e.stopPropagation(); doOMT(); }, { passive: true });
}

spawnShooter();
