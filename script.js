
'use strict';


/* ───────────── ۰) تنظیمات ─────────────*/
const CONFIG = {
  name: 'سینا',                       
  relationshipStart: '2024-06-24',   
  birthday: '2006-11-15',            
  musicSrc: 'music/romantic(tiktok ver).mp3'                        
};


/* ───────────── ۱) ابزارهای کمکی ───────────── */
const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// کاربری که انیمیشن رو خاموش کرده؟
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// عدد به رقم فارسی با جداکننده‌ی هزارگان: 12345 → ۱۲٬۳۴۵
const faNum = (n) => Math.round(n).toLocaleString('fa-IR');

// تبدیل رشته‌ی 'YYYY-MM-DD' به تاریخ (ظهر،)
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

// تاریخ شمسی خوانا: ۱ دی ۱۴۰۳
const formatJalali = (date) =>
  new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

// اسم رو توی همه‌ی جاهایی که data-name دارن می‌ذاریم
$$('[data-name]').forEach((el) => { el.textContent = CONFIG.name; });


/* ───────────── ۲) کنفتی ─────────────
   confetti.burst()  → انفجار کنفتی
   confetti.rain()   → بارش قلب و کنفتی از بالا */
const confetti = (() => {
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#f2559a', '#ff7eb0', '#ffa8c9', '#ffc94d', '#d9b8ff', '#ffffff'];
  const EMOJIS = ['💗', '💖', '✨', '🎀'];
  let particles = [];
  let running = false;
  let width = 0;
  let height = 0;

  // اندازه‌ی بوم رو با صفحه یکی می‌کنیم (واضح روی صفحه‌های رتینا)
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function add(x, y, vx, vy) {
    const shape = Math.random() < 0.25 ? 'emoji' : (Math.random() < 0.5 ? 'rect' : 'circle');
    particles.push({
      x, y, vx, vy, shape,
      size: rand(6, 12),
      color: pick(COLORS),
      emoji: pick(EMOJIS),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      life: 0
    });
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.vy += 0.12;            // جاذبه
      p.vx *= 0.99;            // مقاومت هوا
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.font = `${p.size * 2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
      }
      ctx.restore();
    });

    // ذره‌هایی که از صفحه خارج شدن حذف می‌شن
    particles = particles.filter((p) => p.y < height + 30);

    if (particles.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  function start() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  return {
    // x و y بین ۰ تا ۱ هستن (۰.۵ و ۰.۴ یعنی وسط صفحه، کمی بالاتر)
    burst({ count = 120, x = 0.5, y = 0.4 } = {}) {
      if (reducedMotion) return;
      for (let i = 0; i < count; i++) {
        const angle = rand(-Math.PI, 0);              // به سمت بالا
        const speed = rand(4, 11);
        add(x * width, y * height, Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
      start();
    },
    rain(duration = 4500) {
      if (reducedMotion) return;
      const timer = setInterval(() => {
        for (let i = 0; i < 3; i++) add(rand(0, width), -20, rand(-1, 1), rand(1, 3));
        start();
      }, 90);
      setTimeout(() => clearInterval(timer), duration);
    }
  };
})();


/* ───────────── ۳) ستاره‌های Hero و اکلیل ───────────── */
// ستاره‌های چشمک‌زن پشت تیتر
(function initHeroSparkles() {
  const box = $('.hero__sparkles');
  const symbols = ['✦', '✧', '✨', '★'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    s.textContent = pick(symbols);
    s.style.left = rand(2, 96) + '%';
    s.style.top = rand(2, 96) + '%';
    s.style.fontSize = rand(10, 26) + 'px';
    s.style.setProperty('--dur', rand(2.4, 4.6).toFixed(1) + 's');
    s.style.setProperty('--delay', rand(0, 3).toFixed(1) + 's');
    box.appendChild(s);
  }
})();

// اکلیل دنبال‌کننده‌ی موس و انگشت
(function initGlitterTrail() {
  if (reducedMotion) return;
  const symbols = ['✨', '💖', '⭐', '✦', '💗'];
  let last = 0;

  function spawn(x, y) {
    if ($$('.glitter').length > 40) return;          // سقف تعداد، برای سبک موندن گوشی
    const s = document.createElement('span');
    s.className = 'glitter';
    s.textContent = pick(symbols);
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--dx', rand(-26, 26) + 'px');
    s.style.setProperty('--s', rand(0.7, 1.5).toFixed(2));
    s.addEventListener('animationend', () => s.remove());
    document.body.appendChild(s);
  }

  window.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - last < 55) return;                     // هر ۵۵ میلی‌ثانیه یکی
    last = now;
    spawn(e.clientX, e.clientY);
  }, { passive: true });

  // با لمس یا کلیک، یه مشت اکلیل می‌پاشه
  window.addEventListener('pointerdown', (e) => {
    for (let i = 0; i < 6; i++) spawn(e.clientX + rand(-16, 16), e.clientY + rand(-16, 16));
  }, { passive: true });
})();


/* ───────────── ۴) پاکت و نامه ───────────── */
(function initLetter() {
  const btn = $('#envelopeBtn');
  const paper = $('#letterPaper');

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    paper.classList.toggle('is-open', open);
    if (open) confetti.burst({ count: 40, x: 0.5, y: 0.5 });
  });
})();


/* ───────────── ۵) تقویم عشق ───────────── */

(function initCounter() {
  const DAY = 24 * 60 * 60 * 1000;
  const start = parseDate(CONFIG.relationshipStart);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // تاریخ تولد در سال جاری یا سال آینده
  const birthDate = parseDate(CONFIG.birthday);
  const birthday = parseDate(
    `${today.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`
  );

  if (birthday < today) {
    birthday.setFullYear(birthday.getFullYear() + 1);
  }

  // محاسبه مدت رابطه تا امروز
  const totalDays = Math.max(0, Math.round((today - start) / DAY));

  const values = {
    statDays: totalDays,
    statWeeks: Math.floor(totalDays / 7),
    statHours: totalDays * 24,
    statMinutes: totalDays * 24 * 60
  };

  // تاریخ‌ها به شمسی
  $('#dateStart').textContent = formatJalali(start);
  $('#dateBirthday').textContent = formatJalali(birthday);

  // شمارش معکوس تا تولد
  const daysLeft = Math.round((birthday - today) / DAY);
  const note = $('#countdownNote');

  if (daysLeft > 0)
    note.textContent = `${faNum(daysLeft)} روز دیگه تا تولدته 🎈`;
  else if (daysLeft === 0)
    note.textContent = 'امروز تولدته! 🎉';
  else
    note.textContent = 'تولدت گذشته ولی جشن ما هنوز ادامه داره 🥳';

  // درصد پیشرفت مسیر
  const span = birthday - start;
  const progress = span > 0 ? clamp((today - start) / span, 0, 1) : 1;

  // انیمیشن شمارش اعداد
  function countUp(el, target) {
    if (reducedMotion) {
      el.textContent = faNum(target);
      return;
    }

    const duration = 1600;
    const t0 = performance.now();

    (function step(now) {
      const t = clamp((now - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = faNum(target * eased);

      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  function run() {
    Object.entries(values).forEach(([id, target]) =>
      countUp($('#' + id), target)
    );

    $('#journeyFill').style.width = Math.max(progress * 100, 4) + '%';
  }

  // مقدار اولیه قبل از اسکرول
  Object.entries(values).forEach(([id, target]) => {
    $('#' + id).textContent = faNum(target);
  });

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        run();
      }
    }, { threshold: 0.35 });

    obs.observe($('#counter'));
  } else {
    run();
  }
})();



/* ───────────── ۶) کیک و فوت کردن شمع‌ها ───────────── */
(function initCake() {
  const section = $('#cake');
  const cakeBtn = $('#cakeBtn');
  const candles = $$('.candle', cakeBtn);
  const blowBtn = $('#blowBtn');
  const relightBtn = $('#relightBtn');
  const hint = $('#cakeHint');
  const wish = $('#wishMessage');

  const HINT_START = 'آرزوتو توی دلت بگو و بعد فوت کن (یا فقط روی کیک بزن)';
  const BLOW_LABEL = '🌬️ با میکروفون فوت کن';

  let isOut = false;
  let mic = null;          // وضعیت میکروفون وقتی روشنه

  // چشمک‌زدن شعله‌ها رو یکی‌یکی جدا می‌کنیم تا طبیعی‌تر باشن
  candles.forEach((c, i) => { $('.flame', c).style.animationDelay = (i * 0.25) + 's'; });

  // خاموش کردن شمع‌ها (یکی‌یکی)
  function blowOut() {
    if (isOut) return;
    isOut = true;
    stopMic();
    candles.forEach((c, i) => setTimeout(() => c.classList.add('is-out'), i * 180));

    setTimeout(() => {
      section.classList.add('is-out');
      wish.hidden = false;
      blowBtn.hidden = true;
      relightBtn.hidden = false;
      hint.textContent = 'تولدت مبارک! 🎉';
      confetti.burst({ count: 160, x: 0.5, y: 0.45 });
    }, candles.length * 180 + 250);
  }

  // روشن کردن دوباره
  function relight() {
    isOut = false;
    candles.forEach((c) => c.classList.remove('is-out'));
    section.classList.remove('is-out');
    wish.hidden = true;
    blowBtn.hidden = false;
    relightBtn.hidden = true;
    hint.textContent = HINT_START;
  }

  // ─── فوت کردن با میکروفون ───
  // صدای فوت یه صدای بلند و ممتد داره. اگه چند فریم پشت سر هم صدا بلند بود، یعنی فوت کرده.
  async function startMic() {
    if (mic) { stopMic(); hint.textContent = HINT_START; return; }   // دوباره زدن = لغو

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      hint.textContent = 'این مرورگر میکروفون رو پشتیبانی نمی‌کنه؛ روی کیک بزن 🎂';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      audioCtx.createMediaStreamSource(stream).connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      mic = { stream, audioCtx, raf: 0 };
      blowBtn.textContent = '🛑 لغو';
      hint.textContent = 'حالا محکم فوت کن سمت گوشی 🌬️';

      let loudFrames = 0;
      const THRESHOLD = 0.12;     // حساسیت: کوچیک‌تر = حساس‌تر
      const NEEDED = 8;           // چند فریم پشت هم (حدود ۰.۱۳ ثانیه)

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const volume = Math.sqrt(sum / data.length);
        loudFrames = volume > THRESHOLD ? loudFrames + 1 : Math.max(0, loudFrames - 1);

        if (loudFrames >= NEEDED) { blowOut(); return; }
        mic.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      mic = null;
      hint.textContent = 'اشکال نداره! فقط روی کیک بزن تا شمع‌ها خاموش بشن 🎂';
    }
  }

  function stopMic() {
    if (!mic) return;
    cancelAnimationFrame(mic.raf);
    mic.stream.getTracks().forEach((t) => t.stop());
    mic.audioCtx.close();
    mic = null;
    blowBtn.textContent = BLOW_LABEL;
  }

  cakeBtn.addEventListener('click', blowOut);
  blowBtn.addEventListener('click', startMic);
  relightBtn.addEventListener('click', relight);
})();


/* ───────────── ۷) گالری عکس ───────────── */
(function initGallery() {
  const dialog = $('#lightbox');
  const bigImg = $('#lightboxImg');
  const caption = $('#lightboxCaption');

  $$('.polaroid').forEach((card) => {
    const photo = $('.polaroid__photo', card);
    const img = $('img', card);
    const btn = $('.polaroid__btn', card);

    
    const markEmpty = () => photo.classList.add('is-empty');
    img.addEventListener('error', markEmpty);
    if (img.complete && img.naturalWidth === 0) markEmpty();

    // کلیک روی عکس → نمایش بزرگ
    btn.addEventListener('click', () => {
      if (photo.classList.contains('is-empty')) return;
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt;
      caption.textContent = $('figcaption', card).textContent;
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });

  // کلیک بیرون از کادر، پنجره رو می‌بنده
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
})();


/* ───────────── ۸) کوپن‌ها ─────────────
   کوپن‌هایی که استفاده شدن توی مرورگر خودش ذخیره می‌شن (localStorage) */
(function initCoupons() {
  const STORAGE_KEY = 'birthday-coupons-used';
  const coupons = $$('.coupon');
  const leftEl = $('#couponsLeft');
  let used = new Set();

  // خوندن از حافظه 
  try { used = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch (e) { /* ignore */ }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...used])); } catch (e) { /* ignore */ }
  }

  function render() {
    coupons.forEach((c) => {
      const isUsed = used.has(c.dataset.id);
      c.classList.toggle('is-used', isUsed);
      c.disabled = isUsed;
      $('.coupon__status', c).textContent = isUsed ? 'استفاده شد ✓' : 'استفاده کن';
    });
    leftEl.textContent = faNum(coupons.length - used.size);
  }

  coupons.forEach((c) => {
    c.addEventListener('click', () => {
      if (used.has(c.dataset.id)) return;
      used.add(c.dataset.id);
      save();
      render();
      // کنفتی از جایی که کوپن هست می‌پاشه
      const r = c.getBoundingClientRect();
      confetti.burst({ count: 50, x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight });
    });
  });

  $('#couponsReset').addEventListener('click', () => { used.clear(); save(); render(); });

  render();
})();


/* ───────────── ۹) سورپرایز آخر ───────────── */
(function initFinale() {
  const btn = $('#finaleBtn');
  const message = $('#finaleMessage');

  btn.addEventListener('click', () => {
    btn.hidden = true;
    message.hidden = false;
    message.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    confetti.burst({ count: 150, x: 0.5, y: 0.5 });
    confetti.rain();
  });
})();


/* ─────────────  موسیقی ─────────────*/
  
(function initMusic() {
  if (!CONFIG.musicSrc) return;
  const btn = $('#musicBtn');
  const audio = new Audio(CONFIG.musicSrc);
  audio.loop = true;
  btn.hidden = false;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => btn.classList.add('is-playing')).catch(() => { /* ignore */ });
    } else {
      audio.pause();
      btn.classList.remove('is-playing');
    }
  });
})();

/* ───────────── پیام‌های تصادفی عاشقانه ───────────── */

(function initLoveMessages() {
  const messages = {
    compliment: [
      'می‌دونی قشنگ‌ترین اتفاق زندگی من چی بوده؟ آشنا شدن با تو 💗',
      'حتی وقتی حواست نیست، بازم به نظرم دوست‌داشتنی‌ترین آدم دنیایی.',
      'لبخندت از اون چیزاست که هیچ‌وقت برام تکراری نمی‌شه.',
      'تو ترکیب عجیبی از بامزه بودن و دوست‌داشتنی بودنی!',
      'اگه قرار بود دوباره انتخاب کنم، باز هم تو رو انتخاب می‌کردم.'
    ],

    confession: [
      'یه اعتراف کنم؟ هنوزم  وقتی پیام می‌دی ذوق می‌کنم!',
      'گاهی بی‌دلیل وسط روز یاد تو می‌افتم و لبخند می‌زنم.',
      'فکر کنم یکم زیادی بهت وابسته شدم... البته اصلاً پشیمون نیستم!',
      'دلم میخواد خیلی بیشتر از اینا کنارت باشم ',
      'تو یکی از معدود آدمایی هستی که می‌تونم پیشش خود واقعیم باشم.',
      'یه چیزی بگم؟ بعضی وقتا فقط برای اینکه صدات رو بشنوم، بهونه می‌گیرم'
    ],

    promise: [
      'قول می‌دم همیشه برای خندوندنت تلاش کنم.',
      'قول می‌دم توی روزای سخت هم کنارت بمونم.',
      'قول می‌دم هیچ‌وقت از ساختن خاطره‌های قشنگ باهات خسته نشم.',
      'قول می‌دم حتی بعد از کلی سال، تولدت رو با ذوق جشن بگیرم.',
      'قول می‌دم تا جایی که می‌تونم، دلیل لبخندت باشم.'
    ],

    cute: [
      'الان باید بیای بغلم. این یه دستوره! 😾',
      'دودو جان، لطفاً کمتر خوشگل باش. تمرکز منو بهم می‌زنی!',
      'گربه‌ی خپل من، بیا که دلم برات یه ذره شده 🐈',
      'ارسال یک عالمه بوس مجازی...  😘',
      'تو مال منی و منم مال تو. حالا برو یه آب بخور عزیزم 😂',
      'امروز مجاز نیستی غمگین باشی، چون من اینجام و کلی بوس دارم برات 😚'
    ]
  };

  const options = $$('.message-option');
  const result = $('#messageResult');
  const resultText = $('p', result);
  const againBtn = $('#messageAgain');

  let currentType = '';

  function showMessage(type) {
    currentType = type;

    const message = pick(messages[type]);

    resultText.textContent = message;

    // اجرای دوباره‌ی انیمیشن نمایش پیام
    resultText.style.animation = 'none';
    resultText.offsetHeight;
    resultText.style.animation = '';

    options.forEach((button) => {
      const active = button.dataset.messageType === type;

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    againBtn.hidden = false;

    const box = result.getBoundingClientRect();

    confetti.burst({
      count: 25,
      x: (box.left + box.width / 2) / window.innerWidth,
      y: (box.top + box.height / 2) / window.innerHeight
    });
  }

  options.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      showMessage(button.dataset.messageType);
    });
  });

  againBtn.addEventListener('click', () => {
    if (currentType) {
      showMessage(currentType);
    }
  });
})();
