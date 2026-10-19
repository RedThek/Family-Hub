#!/usr/bin/env node
// pilotage.mjs — outil de pilotage Family-Hub (sans dépendance, Node >= 22)
// Lit/écrit les fichiers markdown de pilotage/. Voir pilotage/00-protocole-agent.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  jalons: path.join(ROOT, 'jalons'),
  claims: path.join(ROOT, 'claims'),
  journal: path.join(ROOT, 'journal'),
  validations: path.join(ROOT, 'validations'),
  handoffs: path.join(ROOT, 'handoffs'),
  etat: path.join(ROOT, '01-etat-des-lieux.md'),
};
const STATUTS = ['TODO', 'DOING', 'BLOCKED', 'REVIEW', 'DONE', 'SKIPPED'];
const TRANSITIONS = {
  TODO: ['DOING', 'BLOCKED', 'SKIPPED'],
  DOING: ['REVIEW', 'BLOCKED', 'TODO'],
  REVIEW: ['DONE', 'DOING', 'BLOCKED'],
  BLOCKED: ['TODO', 'DOING'],
  DONE: ['REVIEW'],
  SKIPPED: ['TODO'],
};
const BAIL_H = 4; // un claim sans heartbeat depuis plus de BAIL_H heures est périmé
const ORDRE = ['M0', 'SP1', 'SP2', 'SP3', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const ID_RE = '(?:M\\d+|SP\\d+)\\.S\\d+\\.[A-Z]\\d+';
const TASK_RE = new RegExp(`^#### (${ID_RE}) — (.+)$`);
const ID_ONLY = new RegExp(`^${ID_RE}$`);

// ---------- utilitaires ----------
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const stamp = () => now().replace(/[-:]/g, '').replace('T', '-').slice(0, 13);
const readLines = (f) => fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
const ageH = (iso) => (Date.now() - Date.parse(iso)) / 36e5;
const kv = (line) => {
  const m = line.match(/^- ([^:]+):\s*(.*)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
};
const list = (dir, re) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).sort() : []);
function idKey(id) {
  const m = id.match(/^(\w+)\.S(\d+)\.([A-Z])(\d+)$/);
  return m ? [ORDRE.indexOf(m[1]), +m[2], m[3].charCodeAt(0), +m[4]] : [99, 0, 0, 0];
}
const cmpId = (a, b) => {
  const x = idKey(a), y = idKey(b);
  for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};
function die(msg) { console.error(`ERREUR: ${msg}`); process.exit(1); }

// ---------- chargement ----------
function loadJalons() {
  const jalons = {};
  const tasks = [];
  for (const f of list(P.jalons, /^(M\d+|SP\d+)-.*\.md$/)) {
    const id = f.match(/^(M\d+|SP\d+)-/)[1];
    const j = { id, file: f, titre: '', deps: [], tasks: [] };
    let cur = null;
    readLines(path.join(P.jalons, f)).forEach((line, i) => {
      let m;
      if (!j.titre && (m = line.match(/^# (.+)$/))) j.titre = m[1];
      if ((m = line.match(/^- dépend_jalons:\s*(.*)$/))) j.deps = m[1].split(',').map((s) => s.trim()).filter((s) => s && s !== '—');
      if ((m = line.match(TASK_RE))) {
        cur = { id: m[1], titre: m[2], jalon: id, file: f, line: i, fields: {} };
        j.tasks.push(cur); tasks.push(cur);
        return;
      }
      if (/^#{1,4} /.test(line)) cur = null;
      if (cur && line.startsWith('- ')) {
        const body = line.slice(2);
        const parts = body.startsWith('statut:') || body.startsWith('règles:') ? body.split(' · ') : [body];
        for (const p of parts) {
          const km = p.match(/^([^:]+):\s*(.*)$/);
          if (km) cur.fields[km[1].trim()] = km[2].trim();
        }
      }
    });
    jalons[id] = j;
  }
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  return { jalons, tasks, byId };
}
const statut = (t) => t.fields.statut;
const isDone = (t) => ['DONE', 'SKIPPED'].includes(statut(t));
const missionLetter = (id) => id.split('.')[2][0];
function depsOf(t, ctx) {
  const raw = (t.fields['dépend'] || '').split(',').map((s) => s.trim()).filter((s) => s && s !== '—');
  const out = [];
  for (const d of raw) {
    if (d === '@jalon') ctx.jalons[t.jalon].tasks.filter((x) => missionLetter(x.id) !== 'Z').forEach((x) => out.push(x.id));
    else out.push(d);
  }
  return out;
}
const jalonComplete = (j) => j.tasks.length > 0 && j.tasks.every(isDone);

function loadClaims() {
  return list(P.claims, new RegExp(`^${ID_RE}\\.md$`)).map((f) => {
    const o = { id: f.slice(0, -3), file: f };
    for (const l of readLines(path.join(P.claims, f))) { const p = kv(l); if (p) o[p[0]] = p[1]; }
    return o;
  });
}
const claimStale = (c) => !c.heartbeat || ageH(c.heartbeat) > BAIL_H;

function loadJournals() {
  return list(P.journal, /^\d{8}-\d{4}-.*\.md$/).map((f) => {
    const text = fs.readFileSync(path.join(P.journal, f), 'utf8');
    const m = f.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})-/);
    const t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    const closed = /^- clôturée:\s*oui/im.test(text);
    return { file: f, text, t, closed };
  });
}
function loadHandoffs() {
  return list(P.handoffs, /^HO-.*\.md$/).map((f) => {
    const o = { file: f };
    for (const l of readLines(path.join(P.handoffs, f))) { const p = kv(l); if (p) o[p[0]] = p[1]; }
    return o;
  });
}

// ---------- écriture ----------
function updateTask(t, updates) {
  const file = path.join(P.jalons, t.file);
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  for (let i = t.line + 1; i < lines.length && !/^#{1,4} /.test(lines[i]); i++) {
    if (lines[i].startsWith('- statut:')) {
      const parts = lines[i].slice(2).split(' · ').map((p) => {
        const m = p.match(/^([^:]+):\s*(.*)$/);
        const k = m[1].trim();
        return k in updates ? `${k}: ${updates[k]}` : p;
      });
      lines[i] = '- ' + parts.join(' · ');
      break;
    }
  }
  fs.writeFileSync(file, lines.join(eol));
}
function writeClaim(id, o, flag = 'wx') {
  fs.mkdirSync(P.claims, { recursive: true });
  const body = [`# Claim ${id}`, '', ...Object.entries(o).map(([k, v]) => `- ${k}: ${v}`), ''].join('\n');
  fs.writeFileSync(path.join(P.claims, `${id}.md`), body, { flag });
}
const removeClaim = (id) => { const f = path.join(P.claims, `${id}.md`); if (fs.existsSync(f)) fs.unlinkSync(f); };
function fromTemplate(tpl, dest, vars) {
  let s = fs.readFileSync(tpl, 'utf8');
  for (const [k, v] of Object.entries(vars)) s = s.split(`{{${k}}}`).join(v);
  fs.writeFileSync(dest, s, { flag: 'wx' });
}

// ---------- règles ----------
function eligible(ctx, claims) {
  const claimed = new Set(claims.map((c) => c.id));
  return ctx.tasks
    .filter((t) => statut(t) === 'TODO' && !claimed.has(t.id))
    .filter((t) => depsOf(t, ctx).every((d) => ctx.byId[d] && isDone(ctx.byId[d])))
    .filter((t) => ctx.jalons[t.jalon].deps.every((d) => ctx.jalons[d] && jalonComplete(ctx.jalons[d])))
    .sort((a, b) => cmpId(a.id, b.id));
}
function validationOk(t) {
  const v = t.fields.validation;
  if (!v || v === '—') return false;
  const f = path.join(ROOT, v);
  if (!fs.existsSync(f)) return false;
  return /^- verdict:\s*validé/im.test(fs.readFileSync(f, 'utf8'));
}

function check(ctx = loadJalons()) {
  const errors = [], warnings = [];
  const claims = loadClaims();
  const journals = loadJournals();
  const seen = new Set();
  for (const t of ctx.tasks) {
    if (seen.has(t.id)) errors.push(`${t.id}: identifiant dupliqué`);
    seen.add(t.id);
    if (!STATUTS.includes(statut(t))) errors.push(`${t.id}: statut invalide « ${statut(t)} »`);
    for (const d of depsOf(t, ctx)) if (!ctx.byId[d]) errors.push(`${t.id}: dépendance inconnue ${d}`);
    if (['DOING', 'REVIEW', 'DONE'].includes(statut(t))) {
      const bad = depsOf(t, ctx).filter((d) => ctx.byId[d] && !isDone(ctx.byId[d]));
      if (bad.length) errors.push(`${t.id}: ${statut(t)} alors que dépendances non terminées (${bad.join(', ')})`);
    }
    if (statut(t) === 'DOING' && !claims.some((c) => c.id === t.id)) errors.push(`${t.id}: DOING sans claim`);
    if (statut(t) === 'DONE' && !validationOk(t)) errors.push(`${t.id}: DONE sans fichier de validation avec « - verdict: validé »`);
    if (['REVIEW', 'DONE'].includes(statut(t)) && !journals.some((j) => j.text.includes(t.id)))
      warnings.push(`${t.id}: ${statut(t)} sans aucune trace dans le journal`);
    if (statut(t) === 'BLOCKED' && !t.fields.notes) warnings.push(`${t.id}: BLOCKED sans ligne « - notes: » expliquant le blocage`);
  }
  for (const j of Object.values(ctx.jalons)) for (const d of j.deps) if (!ctx.jalons[d]) errors.push(`${j.id}: dépend_jalons inconnu ${d}`);
  for (const c of claims) {
    const t = ctx.byId[c.id];
    if (!t) errors.push(`claim ${c.id}: tâche inconnue`);
    else if (!['DOING', 'REVIEW'].includes(statut(t))) errors.push(`claim ${c.id}: orphelin (tâche ${statut(t)})`);
    if (claimStale(c)) warnings.push(`claim ${c.id}: PÉRIMÉ (agent ${c.agent}, dernier heartbeat ${c.heartbeat || '?'}) → reprise possible (--reprendre)`);
  }
  for (const j of journals) if (!j.closed && (Date.now() - j.t) / 36e5 > BAIL_H) warnings.push(`journal ${j.file}: session non clôturée depuis > ${BAIL_H} h → session interrompue, reprise à prévoir`);
  for (const h of loadHandoffs()) if ((h.statut || '').startsWith('ouvert')) warnings.push(`handoff ${h.file}: ouvert → à reprendre (tâche ${h.tâche || '?'})`);
  if (fs.existsSync(P.etat) && journals.length) {
    const m = fs.readFileSync(P.etat, 'utf8').match(/^- dernière mise à jour \(UTC\):\s*(\S+)/m);
    const last = journals[journals.length - 1];
    if (m && Date.parse(m[1]) + 6e4 < last.t) warnings.push(`01-etat-des-lieux.md plus ancien que le dernier journal (${last.file}) → lancer « sync »`);
  }
  return { errors, warnings };
}

// ---------- commandes ----------
function progress(ctx) {
  const rows = [];
  const tot = { n: 0, c: Object.fromEntries(STATUTS.map((s) => [s, 0])) };
  for (const id of ORDRE) {
    const j = ctx.jalons[id];
    if (!j) continue;
    const c = Object.fromEntries(STATUTS.map((s) => [s, j.tasks.filter((t) => statut(t) === s).length]));
    rows.push({ id, titre: j.titre, n: j.tasks.length, c });
    tot.n += j.tasks.length;
    for (const s of STATUTS) tot.c[s] += c[s];
  }
  return { rows, tot };
}
const pct = (c, n) => (n ? Math.round(((c.DONE + c.SKIPPED) / n) * 100) : 0);
function progressMd(ctx) {
  const { rows, tot } = progress(ctx);
  const head = '| Jalon | Tâches | DONE | REVIEW | DOING | BLOCKED | TODO | % |\n|---|--:|--:|--:|--:|--:|--:|--:|';
  const line = (id, n, c) => `| ${id} | ${n} | ${c.DONE + c.SKIPPED} | ${c.REVIEW} | ${c.DOING} | ${c.BLOCKED} | ${c.TODO} | ${pct(c, n)} % |`;
  return [head, ...rows.map((r) => line(`**${r.id}** ${r.titre.replace(/^\S+ — /, '')}`, r.n, r.c)), line('**Total**', tot.n, tot.c)].join('\n');
}
function taskBlock(ctx, t) {
  return `${t.id} — ${t.titre}  [${statut(t)} · taille ${t.fields.taille}]  (${t.file})\n   règles: ${t.fields['règles']} · dépend: ${depsOf(t, ctx).join(', ') || '—'}\n   livrables: ${t.fields.livrables}\n   acceptation: ${t.fields.acceptation}${t.fields.notes ? `\n   notes: ${t.fields.notes}` : ''}`;
}
function nextMd(ctx, n) {
  const el = eligible(ctx, loadClaims()).slice(0, n);
  return el.length ? el.map((t) => `- **${t.id}** — ${t.titre} (taille ${t.fields.taille})`).join('\n') : '- _aucune tâche éligible (voir tâches en cours, REVIEW à valider, BLOCKED)_';
}

function cmdStatus() {
  const ctx = loadJalons();
  console.log(progressMd(ctx));
}
function cmdNext(n = 5, agent = null) {
  const ctx = loadJalons();
  let el = eligible(ctx, loadClaims());
  const owner = (t) => t.fields['assigné'] || '—';
  if (agent) {
    el = el.filter((t) => owner(t) === '—' || owner(t) === agent);
    el.sort((a, b) => (owner(b) === agent) - (owner(a) === agent) || cmpId(a.id, b.id));
  }
  el = el.slice(0, +n);
  if (!el.length) return console.log('Aucune tâche éligible.');
  el.forEach((t) => console.log(taskBlock(ctx, t) + '\n'));
}
function cmdShow(id) {
  const ctx = loadJalons();
  const t = ctx.byId[id] || die(`tâche inconnue ${id}`);
  console.log(taskBlock(ctx, t));
}
function cmdClaim(id, agent, flags) {
  if (!id || !agent) die('usage: claim <ID> <agent> [--role validation] [--reprendre] [--force]');
  const ctx = loadJalons();
  const t = ctx.byId[id] || die(`tâche inconnue ${id}`);
  const role = flags.includes('--role=validation') || (flags.includes('--role') && flags.includes('validation')) ? 'validation' : 'réalisation';
  const claims = loadClaims();
  const existing = claims.find((c) => c.id === id);
  if (role === 'réalisation') {
    const res = t.fields['assigné'];
    if (statut(t) === 'TODO' && res && res !== '—' && res !== agent && !flags.includes('--force')) die(`${id} est réservée à ${res} (--force pour passer outre, ou « assign » pour la ré-assigner)`);
    if (!['TODO', 'DOING'].includes(statut(t))) die(`${id} est ${statut(t)} (claim de réalisation possible seulement sur TODO, ou DOING repris)`);
    const bad = depsOf(t, ctx).filter((d) => !ctx.byId[d] || !isDone(ctx.byId[d]));
    if (bad.length) die(`dépendances non terminées: ${bad.join(', ')}`);
    const jb = ctx.jalons[t.jalon].deps.filter((d) => !ctx.jalons[d] || !jalonComplete(ctx.jalons[d]));
    if (jb.length) die(`jalons prérequis non terminés: ${jb.join(', ')}`);
  } else if (statut(t) !== 'REVIEW') die(`${id} est ${statut(t)} (validation possible seulement sur REVIEW)`);
  const data = { agent, rôle: role, début: now(), heartbeat: now() };
  if (existing) {
    if (flags.includes('--reprendre') && claimStale(existing)) {
      data.repris_de = `${existing.agent} (heartbeat ${existing.heartbeat || '?'})`;
      writeClaim(id, data, 'w');
    } else die(`déjà réservé par ${existing.agent} (heartbeat ${existing.heartbeat}). ${claimStale(existing) ? 'Claim périmé: relancer avec --reprendre.' : 'Choisir une autre tâche.'}`);
  } else {
    try { writeClaim(id, data); } catch (e) { die(`claim impossible: ${e.message}`); }
  }
  if (role === 'réalisation') updateTask(t, { statut: 'DOING', assigné: agent });
  console.log(`OK claim ${id} (${role}) par ${agent}\n\n${taskBlock(ctx, t)}`);
  console.log('\nRappel: commit isolé du claim immédiatement (chore(pilotage): claim ' + id + ') et ouvrir/compléter le journal.');
}
function cmdAssign(id, agent) {
  if (!id || !agent) die('usage: assign <ID> <agent|—>');
  const ctx = loadJalons();
  const t = ctx.byId[id] || die(`tâche inconnue ${id}`);
  if (statut(t) !== 'TODO') die(`${id} est ${statut(t)} : assign seulement sur TODO`);
  updateTask(t, { assigné: agent });
  console.log(`OK ${id} réservée pour ${agent}`);
}
function cmdHeartbeat(id) {
  const f = path.join(P.claims, `${id}.md`);
  if (!fs.existsSync(f)) die(`pas de claim pour ${id}`);
  const lines = readLines(f).map((l) => (l.startsWith('- heartbeat:') ? `- heartbeat: ${now()}` : l));
  fs.writeFileSync(f, lines.join('\n'));
  console.log(`heartbeat ${id} ${now()}`);
}
function cmdSet(id, to, flags) {
  if (!id || !to) die('usage: set <ID> <STATUT> [--validation validations/<ID>.md] [--notes "texte"]');
  to = to.toUpperCase();
  if (!STATUTS.includes(to)) die(`statut inconnu ${to}`);
  const ctx = loadJalons();
  const t = ctx.byId[id] || die(`tâche inconnue ${id}`);
  const from = statut(t);
  if (!TRANSITIONS[from].includes(to)) die(`transition interdite ${from} → ${to} (autorisées: ${TRANSITIONS[from].join(', ')})`);
  const upd = { statut: to };
  const vi = flags.indexOf('--validation');
  if (vi >= 0) { upd.validation = flags[vi + 1]; t.fields.validation = flags[vi + 1]; }
  const ni = flags.indexOf('--notes');
  if (to === 'DOING' && !loadClaims().some((c) => c.id === id)) die('DOING exige un claim: utiliser « claim »');
  if (to === 'DONE' && !validationOk(t)) die(`DONE exige validation: fichier avec « - verdict: validé » (utiliser --validation validations/${id}.md)`);
  if (to === 'BLOCKED' && ni < 0 && !t.fields.notes) die('BLOCKED exige --notes "raison du blocage"');
  if (to === 'TODO') upd.assigné = '—';
  updateTask(t, upd);
  if (ni >= 0) addNotes(t, flags[ni + 1]);
  if (['REVIEW', 'DONE', 'TODO', 'BLOCKED', 'SKIPPED'].includes(to)) removeClaim(id);
  console.log(`OK ${id}: ${from} → ${to}`);
}
function addNotes(t, text) {
  const file = path.join(P.jalons, t.file);
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  let end = t.line + 1;
  while (end < lines.length && !/^#{1,4} /.test(lines[end])) end++;
  let idx = -1;
  for (let i = t.line + 1; i < end; i++) if (lines[i].startsWith('- notes:')) idx = i;
  if (idx >= 0) lines[idx] = `- notes: ${text}`;
  else { let last = end - 1; while (last > t.line && lines[last].trim() === '') last--; lines.splice(last + 1, 0, `- notes: ${text}`); }
  fs.writeFileSync(file, lines.join(eol));
}
function cmdJournal(agent, slug) {
  if (!agent || !slug) die('usage: journal <agent> <slug-court>');
  const dest = path.join(P.journal, `${stamp()}-${agent}-${slug}.md`);
  fromTemplate(path.join(P.journal, '_modele.md'), dest, { AGENT: agent, DATE: now(), SLUG: slug });
  console.log(path.relative(process.cwd(), dest));
}
function cmdValidation(id, agent) {
  if (!id || !agent) die('usage: validation <ID|JALON> <agent>');
  const dest = path.join(P.validations, `${id}.md`);
  if (fs.existsSync(dest)) die(`existe déjà: ${dest}`);
  fromTemplate(path.join(P.validations, '_modele.md'), dest, { ID: id, AGENT: agent, DATE: now() });
  console.log(path.relative(process.cwd(), dest));
}
function cmdCheck() {
  const { errors, warnings } = check();
  warnings.forEach((w) => console.log(`AVERTISSEMENT: ${w}`));
  errors.forEach((e) => console.log(`ERREUR: ${e}`));
  console.log(`\ncheck: ${errors.length} erreur(s), ${warnings.length} avertissement(s)`);
  process.exit(errors.length ? 1 : 0);
}
function autoBlocks(ctx) {
  const claims = loadClaims();
  const journals = loadJournals();
  const cl = claims.length
    ? claims.map((c) => `- \`${c.id}\` — ${c.agent} (${c.rôle}) depuis ${c.début}, heartbeat ${c.heartbeat}${claimStale(c) ? ' **PÉRIMÉ**' : ''}`).join('\n')
    : '- _aucun claim actif_';
  const ss = journals.slice(-5).reverse().map((j) => `- \`journal/${j.file}\`${j.closed ? '' : ' — **non clôturée**'}`).join('\n') || '- _aucun journal_';
  const ho = loadHandoffs().filter((h) => (h.statut || '').startsWith('ouvert'));
  return {
    AVANCEMENT: progressMd(ctx),
    CLAIMS: cl + (ho.length ? '\n\nHandoffs ouverts:\n' + ho.map((h) => `- \`handoffs/${h.file}\``).join('\n') : ''),
    SESSIONS: ss,
    PROCHAINES: nextMd(ctx, 8),
  };
}
function replaceBlock(text, name, content) {
  const re = new RegExp(`(<!-- AUTO:${name} -->)[\\s\\S]*?(<!-- /AUTO:${name} -->)`);
  return re.test(text) ? text.replace(re, `$1\n${content}\n$2`) : text;
}
function cmdSync() {
  const ctx = loadJalons();
  let raw = fs.readFileSync(P.etat, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let text = raw.replace(/\r\n/g, '\n');
  for (const [k, v] of Object.entries(autoBlocks(ctx))) text = replaceBlock(text, k, v);
  text = text.replace(/^(- dernière mise à jour \(UTC\):).*$/m, `$1 ${now()}`);
  fs.writeFileSync(P.etat, text.replace(/\n/g, eol));
  console.log('01-etat-des-lieux.md synchronisé (blocs AUTO + date).');
}
function cmdReprise() {
  const ctx = loadJalons();
  const claims = loadClaims();
  const journals = loadJournals();
  const { errors, warnings } = check(ctx);
  const doing = ctx.tasks.filter((t) => ['DOING', 'REVIEW', 'BLOCKED'].includes(statut(t)));
  console.log(`# Reprise — ${now()}\n`);
  console.log('## À lire dans cet ordre\n1. AGENTS.md\n2. pilotage/01-etat-des-lieux.md\n3. pilotage/00-protocole-agent.md (si première session)\n4. Dernier journal + handoffs ouverts (ci-dessous)\n5. Le fichier de jalon de la tâche choisie + les règles RG-… citées (docs/02-regles-metier-v5.md)\n');
  console.log('## Avancement\n' + progressMd(ctx) + '\n');
  console.log('## Claims actifs\n' + (claims.length ? claims.map((c) => `- ${c.id} — ${c.agent} (${c.rôle}) heartbeat ${c.heartbeat}${claimStale(c) ? ' → PÉRIMÉ: reprise possible avec « claim ${id} <agent> --reprendre »'.replace('${id}', c.id) : ''}`).join('\n') : '- aucun') + '\n');
  console.log('## Tâches DOING / REVIEW / BLOCKED\n' + (doing.length ? doing.map((t) => `- ${t.id} [${statut(t)}] ${t.titre}${t.fields.notes ? ' — ' + t.fields.notes : ''}`).join('\n') : '- aucune') + '\n');
  console.log('## Journaux récents\n' + (journals.slice(-3).reverse().map((j) => `- journal/${j.file}${j.closed ? '' : '  ← NON CLÔTURÉ'}`).join('\n') || '- aucun') + '\n');
  const ho = loadHandoffs().filter((h) => (h.statut || '').startsWith('ouvert'));
  console.log('## Handoffs ouverts\n' + (ho.length ? ho.map((h) => `- handoffs/${h.file} (tâche ${h.tâche})`).join('\n') : '- aucun') + '\n');
  console.log('## Prochaines tâches éligibles\n' + nextMd(ctx, 5) + '\n');
  console.log('## Contrôle de cohérence\n' + (errors.length + warnings.length ? [...errors.map((e) => `- ERREUR ${e}`), ...warnings.map((w) => `- ${w}`)].join('\n') : '- OK'));
}
function help() {
  console.log(`pilotage.mjs — commandes
  reprise                         contexte complet pour démarrer/reprendre (à lancer en premier)
  status                          avancement par jalon
  next [n] [--agent <nom>]        n prochaines tâches éligibles (défaut 5) ; ses tâches assignées d'abord
  assign <ID> <agent|—>           réserve une tâche TODO pour un agent
  show <ID>                       détail d'une tâche
  claim <ID> <agent> [--role validation] [--reprendre] [--force]
  heartbeat <ID>
  set <ID> <STATUT> [--validation validations/<ID>.md] [--notes "..."]
  journal <agent> <slug>          crée un fichier de session depuis le modèle
  validation <ID|JALON> <agent>   crée un rapport de validation depuis le modèle
  check                           contrôle de cohérence (code retour 1 si erreurs)
  sync                            régénère les blocs AUTO de 01-etat-des-lieux.md`);
}

const [cmd, ...args] = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--') || args[args.indexOf(a) - 1]?.startsWith('--'));
const pos = args.filter((a) => !flags.includes(a));
switch (cmd) {
  case 'reprise': cmdReprise(); break;
  case 'status': cmdStatus(); break;
  case 'next': cmdNext(pos[0] ?? 5, flags.includes('--agent') ? flags[flags.indexOf('--agent') + 1] : null); break;
  case 'show': cmdShow(pos[0]); break;
  case 'claim': cmdClaim(pos[0], pos[1], flags); break;
  case 'heartbeat': cmdHeartbeat(pos[0]); break;
  case 'assign': cmdAssign(pos[0], pos[1]); break;
  case 'set': cmdSet(pos[0], pos[1], args.slice(2)); break;
  case 'journal': cmdJournal(pos[0], pos[1]); break;
  case 'validation': cmdValidation(pos[0], pos[1]); break;
  case 'check': cmdCheck(); break;
  case 'sync': cmdSync(); break;
  default: help();
}
