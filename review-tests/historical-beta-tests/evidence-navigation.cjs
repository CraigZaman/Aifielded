const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const deps = createRequire(path.join(root, 'package.json'));
const ts = deps('typescript'), React = deps('react');
const { renderToStaticMarkup: markup } = deps('react-dom/server');
const id = number => `10000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const missionId = id(100), organisationId = id(101), employeeId = id(102);
let viewer = { id: id(103), role: 'hr', organisationId, organisationName: 'Example Engineering', name: 'Harriet Wells', email: 'harriet@example.invalid' };
let calls = [], fail = '';
const observations = Array.from({ length: 26 }, (_, i) => ({ id: id(i + 1), mission_id: missionId, organisation_id: organisationId, category: 'process', summary: `Evidence ${i + 1}: reporting ownership`, detail: 'The safety procedure is clear during office hours. Out-of-hours employees need an escalation contact.\nA shared reporting route would reduce uncertainty.', confidentiality: i === 25 ? 'CONTRIBUTE' : 'SHARE', user_id: i === 25 ? null : employeeId, participant_approved: true, confidence: 0.8, created_at: '2026-09-05T00:00:00Z' }));
const oldEvidence = observations[25];
const records = {
  management_observations: [...observations, { ...oldEvidence, id: id(27), confidentiality: 'PRIVATE' }, { ...oldEvidence, id: id(28), participant_approved: false }, { ...oldEvidence, id: id(29), organisation_id: id(999) }, { ...oldEvidence, id: id(30), mission_id: id(999) }],
  missions: [{ id: missionId, organisation_id: organisationId, title: 'Health and safety reporting', objective: 'Understand how the updated policy works across employee shifts.', status: 'active' }],
  profiles: [{ id: employeeId, full_name: 'Priya Shah', department: 'Engineering' }],
  organisation_memberships: [{ user_id: employeeId, organisation_id: organisationId, role: 'participant', status: 'active' }],
  mission_assignments: [{ id: id(200), user_id: employeeId, mission_id: missionId, status: 'completed' }],
  themes: [{ id: id(201), mission_id: missionId, title: 'Out-of-hours clarity', description: 'Employees need a consistent reporting route across shifts.', evidence_count: 4, participant_count: 3, confidence: 0.75 }],
  hypotheses: [{ id: id(202), mission_id: missionId, title: 'Escalation ownership may be unclear', description: 'Investigate whether employees on late shifts know whom to contact about an incident.', evidence_for: [`[${oldEvidence.id}] ${oldEvidence.summary}`], evidence_against: [], status: 'open', confidence: 0.7 }],
  findings: [{ id: id(203), mission_id: missionId, title: 'Clarify the late-shift escalation route', summary: 'Approved evidence indicates a gap in the policy.', evidence_summary: `[${oldEvidence.id}] ${oldEvidence.summary}`, recommended_action: 'Assign an owner to confirm the escalation contact for every shift.', confidence: 0.8, impact: 'medium' }],
};
function query(table) {
  const call = { table, filters: [], orders: [], range: null }; calls.push(call);
  let single = false;
  const chain = {
    select: () => chain,
    or: value => { const clauses=value.split(',').map(part=>part.split('.eq.')); call.filters.push(row=>clauses.some(([key,v])=>row[key]===v)); return chain; },
    eq: (key, value) => { call.filters.push(row => row[key] === value); return chain; },
    neq: (key, value) => { call.filters.push(row => row[key] !== value); return chain; },
    in: (key, values) => { call.filters.push(row => values.includes(row[key])); return chain; },
    order: (key, options) => { call.orders.push([key, options?.ascending !== false]); return chain; },
    range: (from, to) => { call.range = [from, to]; return chain; },
    maybeSingle: () => { single = true; return chain; },
    then(resolve) {
      const data = (records[table] || []).filter(row => call.filters.every(filter => filter(row)));
      data.sort((a,b) => { for (const [key, ascending] of call.orders) { const result = String(a[key]).localeCompare(String(b[key])); if (result) return ascending ? result : -result; } return 0; });
      const page = call.range ? data.slice(call.range[0], call.range[1] + 1) : data;
      return Promise.resolve(resolve({ data: single ? page[0] || null : page, count: data.length, error: fail === table ? { code: 'test-failure' } : null }));
    },
  }; return chain;
}
const mocks = {
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  'next/navigation': { notFound: () => { throw Error('NOT_FOUND'); }, redirect: href => { throw Error(`REDIRECT:${href}`); } },
  '@/lib/auth': { requireViewer: async () => viewer, canManage: role => ['owner','manager','hr','consultant'].includes(role) },
  '@/lib/supabase/server': { createClient: async () => ({ from: query, rpc:async()=>({data:{intelligence:true,governed:false},error:null}) }) },
  '@/lib/publishing': {getPublishingRule:async()=>({allowed:true}),getPublishingDirectory:async()=>({members:[],departments:[]})},
  '@/components/publishing-controls': {MissionVisibilityControl:()=>null},
  '@/lib/workspace-directory': {getWorkspaceDirectory:async()=>({members:[{id:employeeId,name:'Priya Shah',role:'participant',department:'engineering'}],departments:[{id:'department',key:'engineering',name:'Engineering',headUserId:null}]})},
  '@/components/assignment-audience-form': {AssignmentAudienceForm:()=>React.createElement('span',{},'Audience selection')},
  '@/app/app/actions': { assignMissionParticipant: '/test/assign', createMissionInvite: '/test/invite' },
  '@/app/app/investigations/actions': { investigateHypothesis: '/test/investigate' },
  '@/components/copy-link': { CopyLink: () => React.createElement('button', {}, 'Copy link') },
  '@/components/ask-fielded': { AskFielded: ({ missionId }) => React.createElement('section', { 'data-ask-mission': missionId }, 'Ask Fielded') },
  '@/components/mission-launch-form': { MissionLaunchForm: props => React.createElement('input', { name: 'prefill', value: JSON.stringify(props.initialBrief), readOnly: true }) },
};
const cache = {};
function load(file) {
  if (cache[file]) return cache[file];
  const exports = {}; cache[file] = exports;
  const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports, URLSearchParams, Date, console, require: name => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith('@/')) { const stem = `src/${name.slice(2)}`; return load(fs.existsSync(path.join(root, `${stem}.tsx`)) ? `${stem}.tsx` : `${stem}.ts`); }
    return deps(name);
  } }, { filename: file }); return exports;
}
async function main() {
  const { evidenceHref, evidencePage, parseEvidenceReference } = load('src/lib/evidence-links.ts');
  for (const bad of ['-1','0','NaN','Infinity','100001','2.5',undefined]) assert.equal(evidencePage(bad),1);
  assert.equal(evidencePage('2'),2);
  assert.equal(parseEvidenceReference('[javascript:alert(1)] Click'),null);
  assert.equal(parseEvidenceReference(`[${oldEvidence.id}] Evidence`).id,oldEvidence.id);
  let hookIndex = 0;
  const askState = ['Where is the reporting gap?', 'The approved evidence suggests an out-of-hours gap.', false, [{ id: oldEvidence.id, missionId, summary: oldEvidence.summary }]];
  const askExports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/components/ask-fielded.tsx'),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { exports: askExports, require: name => name === 'react' ? { ...React, useState: () => [askState[hookIndex++], () => {}] } : name === '@/lib/evidence-links' ? load('src/lib/evidence-links.ts') : mocks[name] || deps(name) });
  const askHtml = markup(askExports.AskFielded({ missionId }));
  assert.ok(askHtml.includes(`href="${evidenceHref(missionId,oldEvidence.id)}"`),'Actual Ask Fielded source links use the direct evidence route');
  const Evidence = load('src/app/app/missions/[id]/evidence/[evidenceId]/page.tsx').default;
  const Mission = load('src/app/app/missions/[id]/page.tsx').default;
  const NewMission = load('src/app/app/missions/new/page.tsx').default;
  const params = evidenceId => ({ params: Promise.resolve({ id: missionId, evidenceId }) });
  calls = [];
  const evidenceHtml = markup(await Evidence(params(oldEvidence.id)));
  assert.ok(evidenceHtml.includes(oldEvidence.summary), 'An older citation resolves independently of list pagination');
  assert.ok(evidenceHtml.includes('Account attribution is withheld'));
  assert.ok(!evidenceHtml.includes('Priya Shah'));
  assert.ok(!calls.some(call => call.table === 'profiles'), 'CONTRIBUTE does not trigger an identity lookup');
  assert.ok(evidenceHtml.includes('/app/follow-ups?title='));
  const sharedHtml = markup(await Evidence(params(observations[0].id)));
  assert.ok(sharedHtml.includes('Priya Shah'));
  for (const missing of [id(27),id(28),id(29),id(30),id(999),'bad-id']) await assert.rejects(() => Evidence(params(missing)), /NOT_FOUND/);
  viewer.role = 'participant'; calls = [];
  await assert.rejects(() => Evidence(params(oldEvidence.id)), /REDIRECT:\/app\/conversations/);
  assert.equal(calls.length,0,'Participant rejected before management data access');
  viewer.role = 'hr'; fail = 'management_observations';
  await assert.rejects(() => Evidence(params(oldEvidence.id)), /could not be loaded/);
  fail = '';
  const missionHtml = markup(await Mission({ params: Promise.resolve({ id: missionId }), searchParams: Promise.resolve({ evidencePage: '3' }) }));
  assert.ok(missionHtml.includes('26 observations / Page 3 of 3'));
  assert.ok(missionHtml.includes(`href="${evidenceHref(missionId,oldEvidence.id)}"`));
  assert.ok(missionHtml.includes('Themes') && missionHtml.includes('Hypotheses') && missionHtml.includes('Contrary evidence'));
  assert.ok(missionHtml.includes('action="/test/investigate"'));
  assert.ok(missionHtml.includes('name="hypothesisId"'));
  assert.ok(missionHtml.includes(`data-ask-mission="${missionId}"`));
  const observationCalls = calls.filter(call => call.table === 'management_observations');
  assert.deepEqual(observationCalls.at(-1).range,[24,35]);
  records.investigation_links=[{root_mission_id:missionId,child_mission_id:id(999),organisation_id:organisationId}];
  assert.ok(markup(await Evidence(params(id(30)))).includes(oldEvidence.summary),'Root citations can resolve approved linked follow-up evidence');
  records.investigation_links=[];
  const newPage = await NewMission({ searchParams: Promise.resolve({ title: 'x'.repeat(200), objective: 'y'.repeat(2400) }) });
  const newHtml = markup(newPage);
  assert.ok(newHtml.includes('x'.repeat(120)) && !newHtml.includes('x'.repeat(121)));
  assert.ok(newHtml.includes('y'.repeat(2000)) && !newHtml.includes('y'.repeat(2001)));
  const css = ['globals.css','role-workspaces.css'].map(file => fs.readFileSync(path.join(root,'src/app',file),'utf8')).join('\n');
  const output = '/private/tmp/fielded-role-screens'; fs.mkdirSync(output,{ recursive: true });
  for (const [name,body] of [['evidence-detail',evidenceHtml],['mission-evidence',missionHtml]]) fs.writeFileSync(path.join(output,`${name}.html`),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fielded evidence</title><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}${css}</style><body>${body}</body></html>`);
  console.log('PASS: older evidence deep links, privacy/tenant/mission filters, role and error gates, stable pagination, hypothesis source links, mission-scoped Ask and investigation prefill. Page queries use an in-memory fixture, not live Supabase.');
}
main().catch(error => { console.error(error); process.exit(1); });
