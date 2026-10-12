/* ============================================================
   Congresso 2027 — lógica de renderização (sem dependências)
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const pct = (x, d = 1) => (x * 100).toFixed(d).replace('.', ',') + '%';
  const pctN = (x, d = 1) => Number(x).toFixed(d).replace('.', ',') + '%';
  const bcolor = (b) => `var(${BLOCS[b].cssVar})`;
  const h = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'style') e.setAttribute('style', attrs[k]);
      else if (k === 'class') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* ---------- tema ---------- */
  (function theme() {
    const root = document.documentElement;
    const btn = $('themeBtn');
    try { const t = localStorage.getItem('tema'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
    btn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tema', next); } catch (e) {}
    });
  })();

  /* ---------- totais por bloco ---------- */
  const blocTotals = (house) => {
    const t = { esq: 0, out: 0, cen: 0, dir: 0 };
    PARTIES.forEach(p => { t[p.b] += p[house]; });
    return t;
  };
  const BC = blocTotals('c'), BS = blocTotals('s');
  const thr = (q, N) => {
    if (q.kind === 'abs') return Math.floor(N / 2) + 1;
    return Math.ceil(N * q.num / q.den - 1e-9);
  };

  /* ---------- tooltip ---------- */
  const tip = $('tip');
  const showTip = (e, txt) => {
    tip.textContent = txt; tip.classList.add('on');
    const w = tip.offsetWidth, x = Math.min(e.clientX + 14, innerWidth - w - 8);
    tip.style.left = Math.max(8, x) + 'px'; tip.style.top = (e.clientY + 16) + 'px';
  };
  const hideTip = () => tip.classList.remove('on');

  /* ---------- HERO ---------- */
  $('heroLede').textContent =
    `A direita tem ${BC.dir} deputados, a esquerda ${BC.esq} e o centrão ${BC.cen}. Maioria absoluta pede 257, uma PEC 308 e um impeachment 342. Quem fecha esses números é o centrão, e a presidência vai ser decidida em 25 de outubro.`;

  $('strip').innerHTML = [
    ['121', 'deputados do PL, a maior bancada (23,6%)'],
    ['28', 'senadores do PL em 2027, de 81 (34,6%)'],
    ['6', 'governadores do PL já eleitos; 6 estados vão ao 2º turno'],
    ['1,87 p.p.', 'diferença entre Flávio e Lula no 1º turno'],
  ].map(([a, b]) => `<div><b class="num">${a}</b><span>${b}</span></div>`).join('');

  /* ---------- HEMICICLO ---------- */
  function hemicycle(svg, house) {
    const N = TOTAL[house], R = 13, cx = 500, cy = 490, rOut = 480, rIn = 170;
    const radii = Array.from({ length: R }, (_, i) => rIn + i * (rOut - rIn) / (R - 1));
    const sum = radii.reduce((a, b) => a + b, 0);
    let counts = radii.map(r => Math.round(N * r / sum));
    counts[R - 1] += N - counts.reduce((a, b) => a + b, 0);
    const seats = [];
    radii.forEach((r, i) => {
      const n = counts[i];
      for (let k = 0; k < n; k++) {
        const a = Math.PI - (n === 1 ? Math.PI / 2 : k * Math.PI / (n - 1));
        seats.push({ a, r, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) });
      }
    });
    seats.sort((p, q) => q.a - p.a || p.r - q.r);
    const order = PARTIES.filter(p => p[house] > 0);
    let idx = 0, blocPrev = null, alt = 0;
    const dot = 10.2;
    order.forEach(p => {
      if (p.b !== blocPrev) { alt = 0; blocPrev = p.b; } else alt++;
      for (let k = 0; k < p[house]; k++) {
        const s = seats[idx++];
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', s.x.toFixed(1)); c.setAttribute('cy', s.y.toFixed(1)); c.setAttribute('r', dot);
        c.setAttribute('class', 'seat'); c.dataset.p = p.id;
        c.style.fill = bcolor(p.b); c.style.fillOpacity = alt % 2 ? 0.72 : 1;
        svg.appendChild(c);
      }
    });
    svg.addEventListener('mousemove', (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.p) {
        const p = PARTY[t.dataset.p];
        showTip(e, `${p.id}: ${p[house]} (${pct(p[house] / N)})`);
      } else hideTip();
    });
    svg.addEventListener('mouseleave', hideTip);
  }
  const hemi = $('hemi');
  hemicycle(hemi, 'c');
  const highlight = (id) => {
    hemi.classList.toggle('dim', !!id);
    hemi.querySelectorAll('.seat').forEach(s => s.classList.toggle('on', s.dataset.p === id));
  };
  $('hemiLegend').innerHTML = BLOC_ORDER.map(b =>
    `<span><i class="sw" style="--c:${bcolor(b)}"></i>${BLOCS[b].name} <b class="num">${BC[b]}</b> · ${pct(BC[b] / TOTAL.c)}</span>`).join('');

  /* ---------- barras genéricas ---------- */
  function barRow(name, v, max, color, valHtml, onEnter, onLeave) {
    const r = h('div', { class: 'bar' });
    r.innerHTML = `<span class="nm">${name}</span><span class="track"><i class="fill" style="--c:${color};width:${(v / max * 100).toFixed(2)}%"></i></span><span class="val">${valHtml}</span>`;
    if (onEnter) { r.addEventListener('mouseenter', onEnter); r.addEventListener('focusin', onEnter); }
    if (onLeave) { r.addEventListener('mouseleave', onLeave); r.addEventListener('focusout', onLeave); }
    return r;
  }

  /* ---------- presidente ---------- */
  PRES.forEach(c => {
    $('presBars').appendChild(barRow(
      `${c.name}${c.party ? ` <small>${c.party}</small>` : ''}`, c.pct, 50, bcolor(c.bloc),
      `${pctN(c.pct, 2)}${c.votes ? ` <small>${c.votes}</small>` : ''}`));
  });
  $('duel').innerHTML = [
    ['Flávio Bolsonaro', 49, 52, 'dir'], ['Lula', 45, 48, 'esq'],
  ].map(([n, t, v, b]) => `<div class="row"><span>${n}</span><span class="track"><i class="fill" style="--c:${bcolor(b)};width:${t / 60 * 100}%"></i></span><b class="num">${t}%</b></div>`).join('') +
    `<p class="sub" style="margin:6px 0 0">Votos válidos: Flávio 52%, Lula 48%.</p>`;

  /* ---------- Câmara: barras de partido ---------- */
  const partyBarsC = $('partyBarsC');
  PARTIES.filter(p => p.c > 0).sort((a, b) => b.c - a.c).forEach(p => {
    partyBarsC.appendChild(barRow(p.id, p.c, 125, bcolor(p.b),
      `${p.c} <small>${pct(p.c / TOTAL.c)}</small>`,
      () => highlight(p.id), () => highlight(null)));
  });
  $('renov').innerHTML = '';
  [['Primeiro mandato', 183, '35,6%'], ['Reeleitos', 301, '58,6%'], ['Ex-deputados de volta', 29, '5,7%'], ['Mulheres eleitas', 108, '21,1%']].forEach(([n, v, p]) => {
    $('renov').appendChild(barRow(n, v, 320, 'var(--ink)', `${v} <small>${p}</small>`));
  });
  DELTAS.forEach(d => {
    const diff = d.b - d.a;
    const row = barRow(d.id, Math.abs(diff), 25, diff >= 0 ? 'var(--pos)' : 'var(--neg)',
      `<span class="delta ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '▲ +' : '▼ −'}${Math.abs(diff)}</span> <small>${d.a}→${d.b}</small>`);
    $('deltaBars').appendChild(row);
  });
  SPECTRUM.forEach(s => {
    $('spectrum').appendChild(barRow(s.name, s.b, 300, bcolor(s.bloc),
      `${s.b} <small>${pct(s.b / 513)} · 2022: ${s.a}</small>`));
  });
  $('blocDefs').innerHTML = BLOC_ORDER.map(b => {
    const names = PARTIES.filter(p => p.b === b && (p.c > 0 || p.s > 0)).map(p => p.id).join(', ');
    return `<div style="grid-template-columns:12px minmax(0,1fr);align-items:start"><i class="sw" style="--c:${bcolor(b)};margin-top:5px"></i><span><b>${BLOCS[b].name}</b> · Câmara ${BC[b]} · Senado ${BS[b]}<br><span style="color:var(--ink2)">${names}</span></span></div>`;
  }).join('');

  /* ---------- régua ---------- */
  function ruler(el, house, items, ticks, simulated) {
    const N = TOTAL[house];
    el.innerHTML = '';
    const bar = h('div', { class: 'rbar' + (simulated ? ' sim' : '') });
    items.forEach(it => {
      const i = h('i', { style: `flex:${it.v} 0 0;--c:${it.color}`, 'aria-label': `${it.label}: ${it.v}` });
      if (it.v === 0) i.style.display = 'none';
      i.addEventListener('mousemove', (e) => showTip(e, `${it.label}: ${it.v} (${pct(it.v / N)})`));
      i.addEventListener('mouseleave', hideTip);
      bar.appendChild(i);
    });
    el.appendChild(bar);
    ticks.forEach(t => {
      const x = h('div', { class: 'tick', style: `left:${(t.v / N * 100).toFixed(2)}%` }, `<span>${t.v}<small>${t.l}</small></span>`);
      el.appendChild(x);
    });
  }
  const tickList = (house) => {
    const N = TOTAL[house];
    const defs = [[1, 3, '1/3'], [0, 0, '1/2+'], [3, 5, '3/5'], [2, 3, '2/3']];
    return defs.map(([n, d, l]) => ({ v: d === 0 ? Math.floor(N / 2) + 1 : Math.ceil(N * n / d - 1e-9), l }));
  };
  ['c', 's'].forEach(hs => {
    const B = hs === 'c' ? BC : BS, N = TOTAL[hs];
    const items = BLOC_ORDER.map(b => ({ v: B[b], label: BLOCS[b].name, color: bcolor(b) }));
    ruler($(hs === 'c' ? 'rulerC' : 'rulerS'), hs, items, tickList(hs));
    $(hs === 'c' ? 'rlegC' : 'rlegS').innerHTML = BLOC_ORDER.map(b =>
      `<span><i class="sw" style="--c:${bcolor(b)}"></i>${BLOCS[b].name} <b>${B[b]}</b> (${pct(B[b] / N)})</span>`).join('') +
      `<span>Tracejados: ${tickList(hs).map(t => `<b>${t.v}</b> ${t.l}`).join(' · ')}</span>`;
  });

  /* ---------- Senado: barras ---------- */
  PARTIES.filter(p => p.s26 > 0).sort((a, b) => b.s26 - a.s26).forEach(p => {
    $('senNew').appendChild(barRow(p.id, p.s26, 20, bcolor(p.b), `${p.s26} <small>${pct(p.s26 / 54)}</small>`));
  });
  PARTIES.filter(p => p.s > 0).sort((a, b) => b.s - a.s).forEach(p => {
    const kept = p.s - p.s26;
    const r = h('div', { class: 'bar' });
    r.innerHTML = `<span class="nm">${p.id}</span><span class="track"><i class="fill" style="--c:var(--ink);width:${p.s26 / 30 * 100}%"></i><i class="fill" style="--c:var(--ink3);left:${p.s26 / 30 * 100}%;width:${kept / 30 * 100}%;border-radius:0 4px 4px 0"></i></span><span class="val">${p.s} <small>${pct(p.s / 81)}</small></span>`;
    r.title = `${p.id}: ${p.s26} eleitos em 2026 + ${kept} mantidos de 2022`;
    $('senTot').appendChild(r);
  });

  /* ---------- governadores ---------- */
  const gb = (p) => PARTY[p] ? PARTY[p].b : 'out';
  const govCount = {};
  GOVS.forEach(g => { govCount[g.p] = (govCount[g.p] || 0) + 1; });
  Object.entries(govCount).sort((a, b) => b[1] - a[1]).forEach(([p, n]) => {
    $('govBars').appendChild(barRow(p, n, 7, bcolor(gb(p)), `${n} <small>${pct(n / GOVS.length)}</small>`));
  });
  const gbloc = { esq: 0, out: 0, cen: 0, dir: 0 };
  GOVS.forEach(g => { gbloc[gb(g.p)]++; });
  $('govStack').innerHTML = BLOC_ORDER.map(b => `<i style="flex:${gbloc[b]};--c:${bcolor(b)}" title="${BLOCS[b].name}: ${gbloc[b]}"></i>`).join('');
  $('govLegend').innerHTML = BLOC_ORDER.map(b => `<span><i class="sw" style="--c:${bcolor(b)}"></i>${BLOCS[b].name} <b class="num">${gbloc[b]}</b></span>`).join('') + '<span>* resultado pendente</span>';
  $('runoffs').innerHTML = RUNOFFS.map(r =>
    `<div style="grid-template-columns:34px minmax(0,1fr)"><b class="num">${r.uf}</b><span>${r.a.nome} <span class="chip" style="padding:2px 7px">${r.a.p}</span> contra ${r.b.nome} <span class="chip" style="padding:2px 7px">${r.b.p}</span></span></div>`).join('');

  const tilesEl = $('tiles'), detail = $('detail');
  const byUF = {};
  GOVS.forEach(g => byUF[g.uf] = { type: 'win', g });
  RUNOFFS.forEach(r => byUF[r.uf] = { type: 'run', r });
  const grid = [];
  Object.entries(TILES).forEach(([uf, [c, r]]) => grid.push({ uf, c, r }));
  const maxR = Math.max(...grid.map(t => t.r));
  const cells = {};
  grid.forEach(t => cells[t.c + ',' + t.r] = t);
  for (let r = 0; r <= maxR; r++) for (let c = 0; c < 7; c++) {
    const t = cells[c + ',' + r];
    if (!t) { tilesEl.appendChild(h('span', { class: 'tile empty', 'aria-hidden': 'true' })); continue; }
    const d = byUF[t.uf];
    const btn = h('button', { class: 'tile', type: 'button', 'data-uf': t.uf });
    if (d.type === 'win') {
      const b = gb(d.g.p);
      btn.style.setProperty('--c', bcolor(b));
      if (b === 'cen') btn.classList.add('dark-txt');
      const pend = d.g.nota && (t.uf === 'AP' || t.uf === 'RR');
      btn.innerHTML = `<span class="uf">${t.uf}${pend ? '*' : ''}</span><span class="pp">${d.g.p === 'Republicanos' ? 'REP' : d.g.p === 'Podemos' ? 'PODE' : d.g.p}</span>`;
      btn.setAttribute('aria-label', `${t.uf}: ${d.g.nome}, ${d.g.p}`);
    } else {
      btn.classList.add('run');
      btn.innerHTML = `<span class="uf">${t.uf}</span><span class="dots"><i style="--c:${bcolor(gb(d.r.a.p))}"></i><i style="--c:${bcolor(gb(d.r.b.p))}"></i></span>`;
      btn.setAttribute('aria-label', `${t.uf}: 2º turno entre ${d.r.a.nome} e ${d.r.b.nome}`);
    }
    btn.addEventListener('click', () => selectUF(t.uf));
    tilesEl.appendChild(btn);
  }
  function selectUF(uf) {
    tilesEl.querySelectorAll('.tile').forEach(b => b.classList.toggle('sel', b.dataset.uf === uf));
    const d = byUF[uf];
    if (d.type === 'win') {
      detail.innerHTML = `<b class="big">${uf}: ${d.g.nome}</b>${d.g.p} · ${d.g.pct} dos votos válidos<br><span class="chip" style="margin-top:8px">Eleito no 1º turno</span>${d.g.nota ? `<br><span style="display:block;margin-top:8px">${d.g.nota}</span>` : ''}`;
    } else {
      detail.innerHTML = `<b class="big">${uf}: 2º turno em 25/10</b>${d.r.a.nome} (${d.r.a.p}) contra ${d.r.b.nome} (${d.r.b.p})`;
    }
  }
  selectUF('SP');

  /* ---------- três poderes ---------- */
  function powerCard(title, tag, parts) { return `<article class="power"><header><h3>${title}</h3><span>${tag}</span></header>${parts.join('')}</article>`; }
  const stackOf = (B, N) => `<div class="stack">${BLOC_ORDER.map(b => `<i style="flex:${B[b]};--c:${bcolor(b)}" title="${BLOCS[b].name}: ${B[b]}"></i>`).join('')}</div>`;
  const listOf = (B, N) => `<div class="plist">${BLOC_ORDER.map(b => `<div><i class="sw" style="--c:${bcolor(b)}"></i><span>${BLOCS[b].name}</span><span class="n">${B[b]}</span><span class="p">${pct(B[b] / N)}</span></div>`).join('')}</div>`;
  const exec = [
    `<h4>Presidência</h4><div class="kicker">Definida em 25 de outubro</div><p class="sub" style="margin:0">Flávio Bolsonaro (PL) 47,03% contra Lula (PT) 45,16% no 1º turno. Posse em 5/jan/2027.</p>`,
    `<h4>27 governos estaduais</h4>`,
    `<div class="stack"><i style="flex:${GOVS.length};--c:var(--ink)"></i><i style="flex:${RUNOFFS.length};--c:var(--soft)"></i></div>`,
    `<div class="plist"><div style="grid-template-columns:12px minmax(0,1fr) auto auto"><i class="sw" style="--c:var(--ink)"></i><span>Definidos</span><span class="n">21</span><span class="p">${pct(21 / 27)}</span></div><div style="grid-template-columns:12px minmax(0,1fr) auto auto"><i class="sw" style="--c:var(--soft);outline:1px solid var(--ink3)"></i><span>2º turno</span><span class="n">6</span><span class="p">${pct(6 / 27)}</span></div></div>`,
    `<h4>Definidos por bloco</h4>`, stackOf(gbloc, 21), listOf(gbloc, 21),
  ];
  const leg = [
    `<h4>Câmara · 513</h4>`, stackOf(BC, 513), listOf(BC, 513),
    `<h4>Senado · 81 (projeção 2027)</h4>`, stackOf(BS, 81), listOf(BS, 81),
  ];
  const stf = [
    `<h4>STF · 11 cadeiras</h4>`,
    `<div class="seats11">${'<i></i>'.repeat(10)}<i class="vac" title="Vaga de Barroso"></i></div>`,
    `<div class="plist"><div style="grid-template-columns:12px minmax(0,1fr) auto auto"><i class="sw" style="--c:var(--ink)"></i><span>Em exercício</span><span class="n">10</span><span class="p">${pct(10 / 11)}</span></div><div style="grid-template-columns:12px minmax(0,1fr) auto auto"><i class="sw" style="--c:var(--esq)"></i><span>Vaga aberta</span><span class="n">1</span><span class="p">${pct(1 / 11)}</span></div></div>`,
    `<p class="sub" style="margin:0">Vaga de Barroso aberta desde out/2025. O Senado rejeitou Jorge Messias por 42 a 34 em 29/04/2026, e Lula ainda não fez nova indicação.</p>`,
    `<h4>Renovação até 2030</h4>`,
    `<div class="seats11"><i class="ret" title="Fux"></i><i class="ret" title="Cármen Lúcia"></i><i class="ret" title="Gilmar Mendes"></i></div>`,
    `<p class="sub" style="margin:0">Fux (2028), Cármen Lúcia (2029) e Gilmar Mendes (fim de 2030) se aposentam aos 75 anos: 3 de 11 cadeiras, ${pct(3 / 11)}. Com a vaga atual, o mandato 2027-2030 pode indicar até 4.</p>`,
  ];
  $('powers').innerHTML =
    powerCard('Executivo', 'presidente + 27 governos', exec) +
    powerCard('Legislativo', '513 + 81 cadeiras', leg) +
    powerCard('Judiciário', 'Supremo Tribunal Federal', stf);

  /* ---------- tabela de quóruns ---------- */
  const q$ = (n) => String(n);
  const gapTxt = (q, hs) => {
    const N = TOTAL[hs], t = thr(q, N), B = hs === 'c' ? BC : BS;
    return `Dir <em>${Math.max(0, t - B.dir)}</em> · Esq <em>${Math.max(0, t - B.esq)}</em>`;
  };
  const cell = (q, hs) => {
    if (!q[hs]) return `<span class="na">Não vota</span>`;
    const N = TOTAL[hs], t = thr(q, N), blk = N - t + 1;
    return `<span class="q">${t}</span><span class="qp">${pct(t / N)} da Casa${q.presentes ? ' (todos presentes)' : ''}<br>bloqueio: ${blk}</span><span class="gap">Faltam: ${gapTxt(q, hs)}</span>`;
  };
  $('qTable').innerHTML = `<thead><tr><th>Matéria</th><th>Regra</th><th>Câmara (513)</th><th>Senado (81)</th></tr></thead><tbody>` +
    QUORUMS.map(q => `<tr><td class="m"><b>${q.nome}</b><small>${q.ref}</small></td><td>${q.regra}<small class="r">${q.nota}</small></td><td>${cell(q, 'c')}</td><td>${cell(q, 's')}</td></tr>`).join('') + '</tbody>';

  /* ---------- simulador ---------- */
  const sel = new Set();
  const presets = {
    'Esquerda': (p) => p.b === 'esq',
    'Direita': (p) => p.b === 'dir',
    'Centrão': (p) => p.b === 'cen',
    'Direita + Centrão': (p) => p.b === 'dir' || p.b === 'cen',
    'Esquerda + Centrão': (p) => p.b === 'esq' || p.b === 'cen',
    'Todos': () => true,
    'Limpar': () => false,
  };
  const chipsEl = $('pchips'), presetEl = $('presets');
  PARTIES.filter(p => p.c > 0 || p.s > 0).forEach(p => {
    const l = h('label', { for: 'chip-' + p.id.replace(/\s/g, '') });
    l.innerHTML = `<input type="checkbox" id="chip-${p.id.replace(/\s/g, '')}" data-p="${p.id}"><i class="sw" style="--c:${bcolor(p.b)}"></i>${p.id} <span class="cnt">${p.c}·${p.s}</span>`;
    chipsEl.appendChild(l);
  });
  chipsEl.addEventListener('change', (e) => {
    const id = e.target.dataset.p;
    e.target.checked ? sel.add(id) : sel.delete(id);
    presetEl.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
    simulate();
  });
  Object.keys(presets).forEach(name => {
    const b = h('button', { class: 'btn', type: 'button', id: 'pre-' + name.replace(/\W+/g, '') }, name);
    b.addEventListener('click', () => {
      sel.clear();
      PARTIES.filter(p => (p.c > 0 || p.s > 0) && presets[name](p)).forEach(p => sel.add(p.id));
      chipsEl.querySelectorAll('input').forEach(i => { i.checked = sel.has(i.dataset.p); });
      presetEl.querySelectorAll('.btn').forEach(x => x.classList.toggle('on', x === b));
      simulate();
    });
    presetEl.appendChild(b);
  });
  function simulate() {
    ['c', 's'].forEach(hs => {
      const N = TOTAL[hs];
      const chosen = PARTIES.filter(p => sel.has(p.id));
      const v = chosen.reduce((a, p) => a + p[hs], 0);
      $(hs === 'c' ? 'simC' : 'simS').innerHTML = `${v} <small>de ${N} · ${pct(v / N)}</small>`;
      const items = chosen.filter(p => p[hs] > 0).map(p => ({ v: p[hs], label: p.id, color: 'var(--ink)' }));
      items.push({ v: N - v, label: 'Fora da maioria', color: 'var(--soft)' });
      const el = $(hs === 'c' ? 'simRulerC' : 'simRulerS');
      ruler(el, hs, items, tickList(hs), true);
      el.querySelector('.rbar').lastChild.className = 'off';
      $(hs === 'c' ? 'resC' : 'resS').innerHTML = QUORUMS.filter(q => q[hs]).map(q => {
        const t = thr(q, N), ok = v >= t;
        return `<li class="${ok ? 'ok' : 'no'}"><span class="st">${ok ? '✓ PASSA' : '✗ FALTA'}</span><span>${q.nome}</span><span class="mn">${ok ? `${v}/${t}` : `faltam ${t - v}`}</span></li>`;
      }).join('');
    });
  }
  document.getElementById('pre-DireitaCentro').click();

  /* ---------- fluxos ---------- */
  const flowHtml = (arr, gates) => arr.map(([t, x], i) => `<li class="${gates.includes(i) ? 'gate' : ''}"><div><b>${t}</b><span>${x}</span></div></li>`).join('');
  $('flowPec').innerHTML = flowHtml(FLOW_PEC, [3, 4, 5]);
  $('flowImp').innerHTML = flowHtml(FLOW_IMP, [3, 5]);

  /* ---------- cronograma ---------- */
  const TAGS = { ele: ['Eleição', 'var(--ink)'], cong: ['Congresso', 'var(--cen)'], stf: ['STF', 'var(--esq)'] };
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  let filter = 'all';
  const fEl = $('filters');
  [['all', 'Tudo'], ['ele', 'Eleição'], ['cong', 'Congresso'], ['stf', 'STF']].forEach(([k, n]) => {
    const b = h('button', { class: 'btn' + (k === 'all' ? ' on' : ''), type: 'button', id: 'f-' + k }, n);
    b.addEventListener('click', () => { filter = k; fEl.querySelectorAll('.btn').forEach(x => x.classList.toggle('on', x === b)); drawTL(); });
    fEl.appendChild(b);
  });
  function drawTL() {
    const now = new Date();
    const list = TIMELINE.filter(e => filter === 'all' || e.tag === filter).sort((a, b) => a.d.localeCompare(b.d));
    const nextIdx = list.findIndex(e => new Date(e.d + 'T23:59:59') >= now);
    $('tl').innerHTML = list.map((e, i) => {
      const dt = new Date(e.d + 'T12:00:00');
      const past = new Date(e.d + 'T23:59:59') < now;
      const dateTxt = e.year ? `<b>${dt.getFullYear()}</b>` : `<b>${String(dt.getDate()).padStart(2, '0')} ${MES[dt.getMonth()]}</b>${dt.getFullYear()}`;
      return `<li class="${past ? 'past' : ''} ${i === nextIdx ? 'next' : ''}" style="--c:${TAGS[e.tag][1]}"><span class="dt">${dateTxt}</span><span class="dot"></span><div class="tx"><b><span class="tag">${TAGS[e.tag][0]}</span>${e.t}${i === nextIdx ? '<span class="proximo">PRÓXIMO</span>' : ''}</b>${e.x ? `<span>${e.x}</span>` : ''}</div></li>`;
    }).join('');
  }
  drawTL();

  /* ---------- fontes ---------- */
  $('src').innerHTML = FONTES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join('');
})();
