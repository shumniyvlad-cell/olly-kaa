(() => {
  const CONFIG = {
    tg: 'https://t.me/mogu_budu', // до запуска бота все «в Telegram» ведут в канал
  };

  /* ---------- движение: ?motion=1 включает на маках с «Уменьшить движение» ---------- */
  const q = new URLSearchParams(location.search);
  try { if (q.has('motion')) localStorage.setItem('motion', q.get('motion')); } catch (e) {}
  let forced = null; try { forced = localStorage.getItem('motion'); } catch (e) {}
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = forced === '1' ? true : forced === '0' ? false : !reduce;
  document.documentElement.classList.add(motion ? 'motion' : 'no-motion');
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- слово «Оттепель»: буквы оттаивают ---------- */
  const word = document.getElementById('word');
  [...'Оттепель'].forEach((c, i) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); word.appendChild(s); });
  const chars = [...word.children];
  if (motion) {
    chars.forEach((s, i) => {
      s.animate([
        { color: '#9fb8c4', filter: 'blur(10px)', transform: 'translateY(-18%) scaleY(1.08)', opacity: 0 },
        { color: '#b9cbd3', filter: 'blur(4px)', transform: 'translateY(-4%) scaleY(1.02)', opacity: 1, offset: .45 },
        { color: '#16120f', filter: 'blur(0px)', transform: 'translateY(3%) scaleY(.97)', offset: .8 },
        { color: '#16120f', filter: 'blur(0px)', transform: 'none', opacity: 1 }
      ], { duration: 1500, delay: 250 + i * 110, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both' });
    });
  }

  /* ---------- снег: идёт на первом экране и стихает по мере прокрутки ---------- */
  const snow = document.getElementById('snow');
  const hero = document.getElementById('top');
  let thaw = 0; // 0 — лёд, 1 — тепло
  if (motion) {
    const g = snow.getContext('2d'); let W, H, flakes = [];
    const fit = () => { W = snow.width = hero.offsetWidth; H = snow.height = hero.offsetHeight; flakes = Array.from({ length: Math.round(W / 9) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 2.4, v: .25 + Math.random() * .7, s: Math.random() * 6 })); };
    fit(); addEventListener('resize', fit);
    let heroVis = true; new IntersectionObserver(e => heroVis = e[0].isIntersecting).observe(hero);
    (function tick(t) {
      if (heroVis) {
        g.clearRect(0, 0, W, H);
        const k = 1 - clamp(scrollY / (H * .8));
        g.fillStyle = 'rgba(255,255,255,.85)';
        for (const f of flakes) {
          f.y += f.v * (0.4 + k); f.x += Math.sin(t / 1600 + f.s) * .3;
          if (f.y > H) { f.y = -4; f.x = Math.random() * W; }
          g.globalAlpha = k * (.35 + f.r / 4); g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
        }
        g.globalAlpha = 1;
      }
      requestAnimationFrame(tick);
    })(0);
  }

  /* ---------- иней на портрете ---------- */
  const cv = document.getElementById('frost'), hint = document.getElementById('frostHint');
  const fx = cv.getContext('2d'); let FW = 0, FH = 0, tex = null, last = null, touched = false, lastMove = 0;
  function makeFrost(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.fillStyle = 'rgba(226,236,241,.82)'; g.fillRect(0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() * 34) | 0; d[i] -= n; d[i + 1] -= n * .6; d[i + 2] -= n * .3; d[i + 3] = 210 + ((Math.random() * 40) | 0); }
    g.putImageData(im, 0, 0); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1;
    for (let k = 0; k < 60; k++) { let x = Math.random() * w, y = Math.random() * h, a = Math.random() * 6.28; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { a += (Math.random() - .5) * .9; x += Math.cos(a) * 18; y += Math.sin(a) * 18; g.lineTo(x, y); } g.stroke(); }
    return c;
  }
  function melt(x, y, r) {
    fx.globalCompositeOperation = 'destination-out';
    const gr = fx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.6, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    fx.fillStyle = gr; fx.beginPath(); fx.arc(x, y, r, 0, 6.283); fx.fill(); fx.globalCompositeOperation = 'source-over';
  }
  function frostSize() {
    const r = cv.getBoundingClientRect(); FW = Math.round(r.width); FH = Math.round(r.height);
    if (!FW || !FH) return; cv.width = FW; cv.height = FH; tex = makeFrost(FW, FH); fx.drawImage(tex, 0, 0);
    if (!motion) { melt(FW * .5, FH * .38, FW * .5); melt(FW * .5, FH * .6, FW * .35); }
  }
  function trail(x, y) {
    const r = Math.max(36, FW * .13);
    if (last) { const dx = x - last.x, dy = y - last.y, n = Math.ceil(Math.hypot(dx, dy) / (r * .3)); for (let i = 1; i <= n; i++) melt(last.x + dx * i / n, last.y + dy * i / n, r); } else melt(x, y, r);
    last = { x, y }; lastMove = performance.now();
    if (!touched) { touched = true; hint.classList.add('gone'); }
  }
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); trail(e.clientX - r.left, e.clientY - r.top); });
  ['pointerleave', 'pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => last = null));
  frostSize(); let rs; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(frostSize, 200); });
  if (motion) {
    const t0 = performance.now();
    (function intro(t) { const p = (t - t0) / 2400; if (p < 1 && !touched) { melt(FW * (.22 + .56 * p), FH * (.38 + .08 * Math.sin(p * 6)), FW * .17); requestAnimationFrame(intro); } })(t0);
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    setInterval(() => { if (!vis) return; fx.globalAlpha = .03; fx.drawImage(tex, 0, 0); fx.globalAlpha = 1; }, 110);
    setInterval(() => {
      if (!vis || performance.now() - lastMove < 3000) return;
      const s = performance.now(), dir = Math.random() < .5;
      (function breath(t) { const p = (t - s) / 1800; if (p >= 1) return; melt(FW * (dir ? .26 + .48 * p : .74 - .48 * p), FH * (.38 + .08 * Math.sin(p * Math.PI)), FW * .16); requestAnimationFrame(breath); })(s);
    }, 4200);
  }

  /* ---------- фон страницы теплеет по прокрутке, градусник в шапке ---------- */
  const secs = [...document.querySelectorAll('[data-bg]')];
  const nav = document.querySelector('.nav'), thermVal = document.getElementById('thermVal'), thermFill = document.getElementById('thermFill');
  const meta = document.querySelector('meta[name=theme-color]');
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const cols = secs.map(s => hex(s.dataset.bg));
  let tops = [];
  const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); };
  measure(); addEventListener('resize', measure); addEventListener('load', measure);
  function paint() {
    const y = scrollY + innerHeight * .55;
    let i = 0; while (i < secs.length - 1 && tops[i + 1] <= y) i++;
    const next = Math.min(i + 1, secs.length - 1);
    const h = (tops[next] || y + 1) - tops[i];
    const k = next === i ? 0 : clamp((y - tops[i] - h * .62) / (h * .38));
    const c = cols[i].map((v, j) => Math.round(lerp(v, cols[next][j], k)));
    const rgb = `rgb(${c[0]},${c[1]},${c[2]})`;
    document.body.style.background = rgb; meta.setAttribute('content', rgb);
    const lum = (.299 * c[0] + .587 * c[1] + .114 * c[2]) / 255;
    nav.classList.toggle('dark', lum < .5);
    const p = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    const temp = lerp(-12, 36.6, p);
    thermVal.textContent = (p > .985 ? '36,6' : (temp > 30 ? temp.toFixed(1).replace('.', ',') : Math.round(temp).toString()).replace('-', '−')) + '°';
    thermFill.style.width = (p * 100).toFixed(1) + '%';
  }

  /* ---------- кинетическая фраза ---------- */
  const kin = document.getElementById('kin'), kinText = document.getElementById('kinText');
  const words = kinText.textContent.trim().split(/ +/);
  kinText.textContent = '';
  const hotFrom = words.indexOf('говорить');
  words.forEach((w, i) => { const s = document.createElement('span'); s.className = 'w' + (i >= hotFrom ? ' hotc' : ''); s.textContent = w; kinText.appendChild(s); kinText.appendChild(document.createTextNode(i < words.length - 1 ? ' ' : '')); });
  const wEls = [...kinText.querySelectorAll('.w')];
  function kinPaint() {
    if (!motion) { wEls.forEach(w => { w.classList.add('on'); if (w.classList.contains('hotc')) w.classList.add('hot'); }); return; }
    const r = kin.getBoundingClientRect(); const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const n = Math.floor(p * (wEls.length + 2));
    wEls.forEach((w, i) => { const on = i < n; w.classList.toggle('on', on); w.classList.toggle('hot', on && w.classList.contains('hotc')); });
  }

  /* ---------- двое сближаются ---------- */
  const dvoe = document.getElementById('dvoe'), c1 = dvoe.querySelector('.c1'), c2 = dvoe.querySelector('.c2');
  function pairPaint() {
    const r = dvoe.getBoundingClientRect(); const p = motion ? clamp((innerHeight - r.top) / (innerHeight + r.height * .5)) : 1;
    const w = c1.parentElement.offsetWidth; const d = (w * .38 - w * .1) * (1 - p) ; // в начале расходятся, к концу почти соприкасаются
    c1.style.transform = `translate(${-d}px,-50%)`; c2.style.transform = `translate(${d}px,-50%)`;
  }

  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { paint(); kinPaint(); pairPaint(); dockPaint(); ticking = false; }); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);

  /* ---------- карта тела ---------- */
  const Z = [
    ['head', 'Голова', 120, 44, 'Мысли по кругу и бессонница', 'Голова, которая не выключается, часто значит, что телу небезопасно расслабиться. Контроль держит, пока есть силы.', 'Сначала возвращаем телу чувство опоры. Когда тело перестаёт ждать удара, мысли стихают сами.'],
    ['throat', 'Горло', 120, 96, 'Ком в горле и несказанное', 'Ком, сжатие, частые больные горла часто про слова, которые годами проглатывались: обиды, «нет», злость «хорошей девочки».', 'Через дыхание и голос даём выйти тому, что застряло. На практике люди впервые за годы кричат или плачут, и становится легче.'],
    ['shoulders', 'Шея и плечи', 66, 128, 'Тащу всё сама', 'Каменные плечи и шея часто у тех, кто несёт на себе семью, бизнес и чужие ожидания. Тело буквально держит груз.', 'Работаю с точками на плечах и шее. Тело отпускает напряжение, которое не берёт массаж, потому что дело не только в мышцах.'],
    ['chest', 'Грудь', 120, 160, 'Тревога и панические атаки', 'Нечем дышать, сердце колотится, страх без причины. Нервная система годами живёт в режиме «беги или замри» и перестаёт выходить из него сама.', 'Учу тело выходить из тревожной реакции. Многие отмечают, что приступы становятся реже и слабее. Лечение не отменяем.'],
    ['belly', 'Живот', 120, 230, 'Страх, контроль, «заедаю стресс»', 'Живот первым реагирует на страх: спазмы, тяжесть, тяга к сладкому вечером. Часто это про контроль и невозможность расслабиться.', 'Через тело находим, где живёт страх, и даём ему выйти. После этого еда и сон часто перестают быть единственным способом успокоиться.'],
    ['pelvis', 'Таз', 120, 296, 'Нет желания, «я как замороженная»', 'Пропало желание, близость стала обязанностью, после 40 будто выключили. Часто за этим запреты, усталость и обиды, которые тело хранит.', 'Работаем мягко, без обнажения и без разговоров о подробностях. Возвращаем чувствительность и разрешение себе хотеть.'],
    ['skin', 'Кожа', 196, 262, 'Псориаз, нейродермит, зуд', 'Кожа часто реагирует на стресс и подавленные эмоции. Обострения после ссор, переездов, разводов знакомы многим.', 'Не лечу кожу, это задача дерматолога. Работаю с напряжением и стрессом, которые влияют на обострения.'],
    ['joints', 'Суставы и спина', 99, 410, 'Болит, а причину не находят', 'Обследования в норме, а боль годами остаётся. Тело может держать напряжение так долго, что оно становится привычной болью.', 'Ищем через тело, что держит. Иногда меняется уже после первых встреч, но у каждого по-своему.']
  ];
  const NS = 'http://www.w3.org/2000/svg', zg = document.getElementById('zones'), zlist = document.getElementById('zlist'), bodyNow = document.getElementById('bodyNow');
  Z.forEach(([id, name, x, y, h, p, w], i) => {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'zone'); g.dataset.z = id; g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', name);
    g.innerHTML = `<circle class="halo" cx="${x}" cy="${y}" r="26"/><circle class="dot" cx="${x}" cy="${y}" r="6"/><circle cx="${x}" cy="${y}" r="22" fill="transparent"/>`;
    zg.appendChild(g);
    const li = document.createElement('li'); li.className = 'zitem'; li.id = 'z-' + id; li.dataset.z = id;
    li.innerHTML = `<h3><small>${name}</small>${h}</h3><p>${p}</p><p><b>Как я с этим работаю.</b> ${w}</p>` + (i === Z.length - 1 || id === 'chest' ? `<a class="btn btn-ink" href="${CONFIG.tg}" target="_blank" rel="noopener">Практика на 12 минут в Telegram</a>` : '');
    zlist.appendChild(li);
    const go = () => { const el = document.getElementById('z-' + id); scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .3, behavior: motion ? 'smooth' : 'auto' }); setZone(id); };
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  function setZone(id) {
    zg.querySelectorAll('.zone').forEach(g => g.classList.toggle('on', g.dataset.z === id));
    zlist.querySelectorAll('.zitem').forEach(li => li.classList.toggle('on', li.dataset.z === id));
    bodyNow.textContent = Z.find(z => z[0] === id)[1];
  }
  setZone('head');
  const zIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setZone(e.target.dataset.z); }), { rootMargin: '-42% 0px -52% 0px' });
  zlist.querySelectorAll('.zitem').forEach(li => zIO.observe(li));

  /* ---------- зал на 70 ковриков ---------- */
  const hall = document.getElementById('hall');
  for (let i = 0; i < 70; i++) { const m = document.createElement('i'); m.className = 'mat ' + (i < 30 ? 'p1' : i < 60 ? 'p2' : 'p3'); m.style.transitionDelay = (motion ? (i % 10) * 25 + Math.floor(i / 10) * 70 : 0) + 'ms'; hall.appendChild(m); }
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')], ottBtn = document.getElementById('ottBtn');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t)); const d = t.dataset.d + ' декабря';
    ottBtn.textContent = 'Забронировать коврик на ' + d; ottBtn.dataset.date = d;
    hall.classList.remove('in'); void hall.offsetWidth; hall.classList.add('in');
  }));
  ottBtn.dataset.date = '13 декабря';

  /* ---------- калькулятор пакетов ---------- */
  const PR = { online: { 4: 90000, 6: 130000 }, office: { 4: 180000, 6: 250000 } };
  const INCL = { online: ['Встречи по видео, по 2 часа', 'Работа через ощущения в теле и подсознание', 'Связь со мной между встречами', 'Из любого города'], office: ['Встречи в Москве, по 2 часа', 'Телесный транс и работа с точками на теле', 'Связь со мной между встречами', 'Самый глубокий формат'] };
  let f = 'online', n = 4, shown = 90000;
  const sum = document.getElementById('sum'), per = document.getElementById('per'), incl = document.getElementById('incl');
  const fmt = v => v.toLocaleString('ru-RU').replace(/ |\s/g, ' ');
  function calc() {
    const v = PR[f][n]; incl.innerHTML = INCL[f].map(x => `<li>${x}</li>`).join('');
    per.textContent = fmt(Math.round(v / n / 100) * 100) + ' ₽ за встречу по 2 часа';
    if (!motion) { sum.textContent = fmt(v); shown = v; return; }
    const from = shown, t0 = performance.now();
    (function run(t) { const p = clamp((t - t0) / 600), e = 1 - Math.pow(1 - p, 3); const cur = Math.round(lerp(from, v, e) / 1000) * 1000; sum.textContent = fmt(cur); if (p < 1) requestAnimationFrame(run); else { shown = v; sum.textContent = fmt(v); } })(t0);
  }
  document.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { f = b.dataset.f; document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-checked', x === b)); calc(); }));
  document.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { n = +b.dataset.n; document.querySelectorAll('[data-n]').forEach(x => x.setAttribute('aria-checked', x === b)); calc(); }));
  calc();

  /* ---------- появления ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; el.classList.add('in');
    if (el.id === 'cups') [...el.children].forEach((c, i) => { c.style.setProperty('--lvl', ['34%', '20%', '6%'][i]); setTimeout(() => c.classList.add('full'), motion ? i * 450 : 0); });
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv,.step,#hall,#cups').forEach(el => motion ? io.observe(el) : (el.classList.add('in'), el.id === 'cups' && [...el.children].forEach((c, i) => { c.style.setProperty('--lvl', ['34%', '20%', '6%'][i]); c.classList.add('full'); })));

  /* ---------- нижняя кнопка на телефоне ---------- */
  const dock = document.getElementById('dock'), ott = document.getElementById('ottepel');
  function dockPaint() {
    const past = scrollY > hero.offsetHeight * .8; const r = ott.getBoundingClientRect(); const onOtt = r.top < innerHeight && r.bottom > 0;
    const end = scrollY + innerHeight > document.documentElement.scrollHeight - 300;
    dock.classList.toggle('show', past && !onOtt && !end);
  }

  /* ---------- лист записи ---------- */
  const sheet = document.getElementById('sheet'), bg = document.getElementById('sheetBg'), body = document.getElementById('sheetBody');
  let opener = null;
  const forms = {
    ottepel: (d, tier) => ({ title: 'Коврик на «Оттепели»', sub: 'Адрес и короткую анкету пришлю после оплаты.', opts: [['o13', '13 декабря, первые 30 мест', '4 900 ₽', d !== '27 декабря' && tier !== 'vip'], ['o27', '27 декабря, первые 30 мест', '4 900 ₽', d === '27 декабря' && tier !== 'vip'], ['vip', 'Первый ряд и разбор 20 минут', '15 000 ₽', tier === 'vip']], cta: 'Перейти к оплате' }),
    dvoe: () => ({ title: '«Двое», 20 декабря', sub: 'Практика для пары, цена за двоих.', opts: [['d1', 'Ранняя бронь до 30 ноября', '19 000 ₽', true], ['d2', 'Обычная цена', '25 000 ₽', false]], cta: 'Перейти к оплате' }),
    gift: () => ({ title: 'Сертификат на «Оттепель»', sub: 'Открытку пришлю в Telegram сразу после оплаты.', opts: [['g1', 'Место на практике', '4 900 ₽', true], ['g2', 'Первый ряд и разбор', '15 000 ₽', false]], cta: 'Перейти к оплате' }),
    talk: () => ({ title: 'Разговор 20 минут', sub: 'Бесплатно. Я напишу вам и предложу время.', opts: [], cta: 'Записаться на разговор' })
  };
  function open(kind, d, tier, btn) {
    opener = btn; const fm = forms[kind](d, tier);
    body.innerHTML = `<h3 id="sheetTitle">${fm.title}</h3><p class="sub">${fm.sub}</p><form id="bookForm" novalidate>
      ${fm.opts.map(o => `<label class="opt"><span><input type="radio" name="opt" value="${o[0]}" ${o[3] ? 'checked' : ''}>${o[1]}</span><b>${o[2]}</b></label>`).join('')}
      <label class="field" for="fName">Как вас зовут</label><input class="inp" id="fName" autocomplete="name"><div class="err" id="eName"></div>
      <label class="field" for="fTel">Телефон или ник в Telegram</label><input class="inp" id="fTel" autocomplete="tel"><div class="err" id="eTel"></div>
      <button class="btn btn-ink" type="submit">${fm.cta}</button><p class="fine">Нажимая кнопку, вы соглашаетесь с офертой и обработкой данных.</p></form>`;
    sheet.style.transform = ''; sheet.classList.add('open'); bg.classList.add('open'); document.body.style.overflow = 'hidden';
    history.pushState({ sheet: 1 }, '');
    setTimeout(() => document.getElementById('fName').focus({ preventScroll: true }), 350);
    document.getElementById('bookForm').addEventListener('submit', submit);
  }
  function submit(e) {
    e.preventDefault(); const nm = document.getElementById('fName'), tl = document.getElementById('fTel'); let bad = null;
    [[nm, 'eName', 'Напишите, как к вам обращаться'], [tl, 'eTel', 'Оставьте телефон или ник, чтобы я могла написать']].forEach(([el, id, msg]) => { const ok = el.value.trim().length > 1; el.setAttribute('aria-invalid', !ok); document.getElementById(id).textContent = ok ? '' : msg; if (!ok && !bad) bad = el; });
    if (bad) { bad.focus(); return; }
    const b = e.target.querySelector('[type=submit]'); b.disabled = true; b.textContent = 'Отправляем…';
    setTimeout(() => { body.innerHTML = `<div class="done"><h3>Заявка принята</h3><p class="sub">Это черновик: оплата и отправка в бота появятся после согласования. Пока заявку можно продублировать в Telegram.</p><a class="btn btn-ink" href="${CONFIG.tg}" target="_blank" rel="noopener">Открыть Telegram</a></div>`; }, 700);
  }
  function close(fromPop) {
    if (!sheet.classList.contains('open')) return;
    sheet.classList.remove('open'); bg.classList.remove('open'); sheet.style.transform = ''; document.body.style.overflow = '';
    if (!fromPop && history.state && history.state.sheet) history.back();
    opener && opener.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => open(b.dataset.book, b.dataset.date, b.dataset.tier, b)));
  bg.onclick = () => close(); document.getElementById('sheetX').onclick = () => close();
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('popstate', () => close(true));
  // смахнуть лист вниз за ручку
  const grab = document.getElementById('grab'); let sy = null;
  grab.addEventListener('pointerdown', e => { sy = e.clientY; grab.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
  grab.addEventListener('pointermove', e => { if (sy === null) return; const d = Math.max(0, e.clientY - sy); sheet.style.transform = `translate(-50%,${d}px)`; });
  grab.addEventListener('pointerup', e => { if (sy === null) return; const d = e.clientY - sy; sy = null; sheet.style.transition = ''; if (d > 90) close(); else sheet.style.transform = ''; });

  paint(); kinPaint(); pairPaint(); dockPaint();
})();
