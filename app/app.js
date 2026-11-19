// Leonida Trophy Atlas: checklist, filters, spoiler mode, roadmap and progress — all offline.
// Progress lives in localStorage; export/import moves it as a JSON file. Nothing is fetched
// from the network at run time: the trophy and roadmap data are local files under data/.
const KEY = 'gta6-trophy-checklist';
const KIND_LABELS = { all: 'All kinds', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', meta: 'Meta' };
const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'meta'];

const cardsEl = document.getElementById('cards');
const countLine = document.getElementById('countLine');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const kindChipsEl = document.getElementById('kindChips');

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
let demoMode = false;

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  demoMode = true;
  // Demo states for screenshots: applied in memory only, never saved over the reader's checklist.
  if (shot === 'cover' || shot === 'guide' || shot === 'roadmap') earned = new Set([2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 17, 21, 28]);
  if (shot === 'spoiler') { spoilerEl.checked = true; earned = new Set([2, 3, 4, 5, 6, 8, 9]); }
}

function save() {
  if (demoMode) return;
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

const [doc, roadmapDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
const trophies = doc.trophies;
const sources = doc.sources;
const byId = new Map(trophies.map((t) => [t.id, t]));

function gradeCount(grade) {
  return trophies.filter((t) => t.grade === grade).length;
}
function earnedGradeCount(grade) {
  return trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
}

function renderProgress() {
  const n = earned.size;
  document.getElementById('earnedCount').textContent = String(n);
  const bar = document.getElementById('progressBar');
  const fill = document.getElementById('progressFill');
  fill.style.width = `${(n / trophies.length) * 100}%`;
  bar.setAttribute('aria-valuenow', String(n));
  document.getElementById('progressGrades').textContent =
    `Platinum ${earnedGradeCount('platinum')}/${gradeCount('platinum')} · Gold ${earnedGradeCount('gold')}/${gradeCount('gold')} · Silver ${earnedGradeCount('silver')}/${gradeCount('silver')} · Bronze ${earnedGradeCount('bronze')}/${gradeCount('bronze')}`;
  document.getElementById('platinumNote').textContent = n >= trophies.length - 1
    ? 'One more trophy and the platinum is yours.'
    : 'The platinum, Vice Got a Price!, unlocks when the other 54 are earned.';
}

function renderFacts() {
  const factsEl = document.getElementById('facts');
  factsEl.replaceChildren();
  for (const f of roadmapDoc.facts) {
    const wrap = document.createElement('div');
    wrap.className = 'fact';
    const dt = document.createElement('dt');
    dt.textContent = f.label;
    const dd = document.createElement('dd');
    dd.textContent = f.value;
    wrap.append(dt, dd);
    factsEl.append(wrap);
  }
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const s of roadmapDoc.stages) {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    h3.textContent = s.title;
    const time = document.createElement('span');
    time.className = 'stage-time';
    time.textContent = s.time;
    const p = document.createElement('p');
    p.textContent = s.detail;
    const count = document.createElement('p');
    count.className = 'stage-count';
    const done = s.ids.filter((id) => earned.has(id)).length;
    count.textContent = `${done} of ${s.ids.length} trophies in this stage earned`;
    li.append(h3, time, p, count);
    stagesEl.append(li);
  }
  const missable = trophies.filter((t) => t.missable);
  const alert = document.getElementById('missableAlert');
  alert.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = `Only one missable trophy: ${missable.map((t) => t.name).join(', ')}. `;
  const rest = document.createElement('span');
  rest.textContent = missable[0]?.missableReason ?? '';
  alert.append(strong, rest);
}

function sourceLinks(t) {
  const p = document.createElement('p');
  p.className = 'sources';
  p.textContent = 'Sources: ';
  (t.sources ?? ['keengamer']).forEach((key, i) => {
    const s = sources[key];
    if (!s) return;
    if (i > 0) p.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    p.append(a);
  });
  return p;
}

let kind = 'all';
function matchesKind(t) {
  if (kind === 'all') return true;
  if (kind === 'missable') return t.missable;
  if (kind === 'online') return false;
  if (kind === 'collectibles') return t.kind === 'collectible';
  return t.kind === kind;
}

function renderCards() {
  const q = searchEl.value.trim().toLowerCase();
  const grade = gradeEl.value;
  const spoiler = spoilerEl.checked;
  const hideEarned = hideEarnedEl.checked;
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!matchesKind(t)) continue;
    if (grade !== 'all' && t.grade !== grade) continue;
    if (hideEarned && earned.has(t.id)) continue;
    if (q && ![t.name, t.description, t.guide, t.kind].join(' ').toLowerCase().includes(q)) continue;
    shown += 1;
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable' : '');
    card.id = `trophy-${t.id}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderProgress();
      renderRoadmap();
      renderCards();
    });
    const body = document.createElement('div');
    const hidden = spoiler && t.kind === 'story' && !earned.has(t.id);
    const h3 = document.createElement('h3');
    h3.textContent = hidden ? 'Hidden story trophy' : t.name;
    body.append(h3);
    if (hidden) {
      const p = document.createElement('p');
      p.className = 'spoiler-hidden';
      p.textContent = 'Spoiler-free mode hides this story trophy’s name, description and guide until you tick it earned.';
      body.append(p);
    } else {
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = t.description;
      const guide = document.createElement('p');
      guide.className = 'guide';
      guide.textContent = t.guide;
      body.append(desc, guide);
      if (t.missable && t.missableReason) {
        const warn = document.createElement('p');
        warn.className = 'guide';
        warn.textContent = `Missable — ${t.missableReason}`;
        body.append(warn);
      }
      body.append(sourceLinks(t));
    }
    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge ${t.grade}`;
    gradeBadge.textContent = t.grade;
    badges.append(gradeBadge);
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge kind';
    kindBadge.textContent = t.kind;
    badges.append(kindBadge);
    if (t.target) {
      const targetBadge = document.createElement('span');
      targetBadge.className = 'badge';
      targetBadge.textContent = `target: ${t.target.toLocaleString('en-US')}`;
      badges.append(targetBadge);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge missable';
      m.textContent = 'Missable — do it first';
      badges.append(m);
    }
    const stage = document.createElement('span');
    stage.className = 'badge';
    stage.textContent = `roadmap stage ${t.stage}`;
    badges.append(stage);
    body.append(badges);
    card.append(box, body);
    cardsEl.append(card);
  }
  countLine.textContent = kind === 'online'
    ? 'No online trophies: all 55 are single-player. Showing 0 of 55.'
    : `Showing ${shown} of ${trophies.length} trophies — ${earned.size} earned.`;
  emptyEl.hidden = shown > 0;
}

function renderChips() {
  kindChipsEl.replaceChildren();
  for (const k of KIND_ORDER) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = KIND_LABELS[k];
    b.setAttribute('aria-pressed', String(kind === k));
    b.addEventListener('click', () => { kind = k; renderChips(); renderCards(); });
    kindChipsEl.append(b);
  }
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned].sort((x, y) => x - y))], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const ids = JSON.parse(await file.text());
    earned = new Set(ids.filter((id) => byId.has(id)));
    save();
    renderProgress();
    renderRoadmap();
    renderCards();
  } catch { /* ignore a bad import file */ }
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  renderProgress();
  renderRoadmap();
  renderCards();
});
searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
spoilerEl.addEventListener('change', renderCards);
hideEarnedEl.addEventListener('change', renderCards);

const sourcesLine = document.getElementById('sourcesLine');
sourcesLine.replaceChildren();
sourcesLine.append(document.createTextNode('Guide sources: '));
Object.values(sources).forEach((s, i) => {
  if (i > 0) sourcesLine.append(document.createTextNode(' · '));
  const a = document.createElement('a');
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = s.label;
  sourcesLine.append(a);
});

renderFacts();
renderRoadmap();
renderChips();
renderProgress();
renderCards();

// Screenshot scenes (?shot=...): settle the view, then signal readiness.
if (shot === 'guide') {
  document.getElementById('trophy-28')?.scrollIntoView({ block: 'center' });
} else if (shot === 'roadmap') {
  document.getElementById('roadmap')?.scrollIntoView();
} else if (shot === 'spoiler') {
  document.getElementById('trophy-7')?.scrollIntoView({ block: 'center' });
}
setTimeout(() => { window.__shotReady = true; }, 150);
