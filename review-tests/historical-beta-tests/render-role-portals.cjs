const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dependencies = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dependencies('typescript');
const React = dependencies('react');
const { renderToStaticMarkup } = dependencies('react-dom/server');
const output = path.resolve(process.argv[4] || '/private/tmp/fielded-role-screens');
const Link = ({ href, children, ...props }) => React.createElement('a', { ...props, href }, children);
const mocks = {
  '@/components/refresh-workspace': { RefreshWorkspace: () => React.createElement('button', { title: 'Refresh workspace' }, 'Refresh') },
  'next/link': { default: Link },
  'next/image': { default: ({ priority, ...props }) => React.createElement('img', { ...props, src: `.${props.src}` }) },
  'next/navigation': { usePathname: () => '/app' },
  '@/app/(auth)/actions': { signOut: '/sign-in' },
  '@/lib/auth': {
    canManage: role => ['owner', 'manager', 'hr', 'consultant'].includes(role),
    canManagePeople: role => ['owner', 'manager', 'hr'].includes(role),
    canManageIntegrations: role => ['owner', 'manager'].includes(role),
  },
};
const cache = {};
function load(relative) {
  if (cache[relative]) return cache[relative];
  const exports = {};
  cache[relative] = exports;
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, console, Date, require: name => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith('@/')) {
      const file = `src/${name.slice(2)}`;
      return load(fs.existsSync(path.join(root, `${file}.tsx`)) ? `${file}.tsx` : `${file}.ts`);
    }
    return dependencies(name);
  } }, { filename: relative });
  return exports;
}
const { AppShell } = load('src/components/app-shell.tsx');
const { ManagerDashboard, ParticipantDashboard } = load('src/components/dashboard.tsx');
const { HRDashboard, TeamDashboard } = load('src/components/role-dashboards.tsx');
const base = { id: 'test-user', email: 'test@example.invalid', name: 'Alex Morgan', organisationId: 'test-org', organisationName: 'Example Engineering' };
const missions = [{ id: 'm1', title: 'Speaking up and whistleblowing policy', objective: 'Clarify reporting routes and collect questions about the updated policy.', status: 'active', created_at: '2026-09-01', mission_assignments: [{ id: 'a1', user_id: 'u1', status: 'completed' }, { id: 'a2', user_id: 'u2', status: 'in_progress' }] }, { id: 'm2', title: 'Project handover and approval delays', objective: 'Understand where approvals slow down and agree practical follow-up actions.', status: 'active', created_at: '2026-09-02', mission_assignments: [] }];
const tasks = [{ id: 't1', title: 'Confirm the escalation owner', description: 'Review the handover and identify the person responsible for a final approval.', status: 'blocked', due_at: '2026-09-06' }, { id: 't2', title: 'Review the health and safety briefing', description: 'Confirm the updated reporting route and raise any questions.', status: 'assigned', due_at: '2026-09-08' }];
const signals = [{ id: 's1', category: 'policy', summary: 'Employees want a clearer reporting route for concerns outside their line-management chain.', confidentiality: 'CONTRIBUTE', created_at: '2026-09-05' }];
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(root, 'public/fielded-logo.png'), path.join(output, 'fielded-logo.png'));
const css = ['globals.css', 'role-workspaces.css'].map(file => fs.readFileSync(path.join(root, 'src/app', file), 'utf8')).join('\n');
for (const role of ['owner', 'hr', 'manager', 'participant']) {
  const viewer = { ...base, role };
  const props = { viewer, missions, tasks, signals, people: 8, asOf: Date.parse('2026-09-05T12:00:00Z') };
  const body = role === 'hr' ? React.createElement(HRDashboard, props) : role === 'manager' ? React.createElement(TeamDashboard, props) : role === 'participant' ? React.createElement(ParticipantDashboard, { viewer, tasks, assignments: [{ id: 'a2', status: 'in_progress', missions: missions[0] }, { id: 'a3', status: 'declined', missions: missions[1] }] }) : React.createElement(ManagerDashboard, { ...props, observations: 12, findings: 2, sourceCount: 3, leadingFindings: [{ id: 'f1', title: 'Approval ownership needs clarification', summary: 'Approved evidence points to an unclear handover between teams.', confidence: 0.8, recommended_action: 'Confirm an escalation owner.' }] });
  const html = renderToStaticMarkup(React.createElement(AppShell, { viewer }, body));
  assert.ok(html.includes(`role-${role}`));
  assert.ok(html.includes('aria-current="page"'));
  if (role === 'owner') assert.ok(html.includes('1 of 2 complete'));
  if (role === 'hr') assert.ok(html.includes('People Overview') && html.includes('Communicate a policy') && html.includes('/app/communications/new'));
  if (role === 'manager') assert.ok(html.includes('Work in focus.') && html.includes('Action Register'));
  if (role === 'participant') assert.ok(!html.includes('href="/app/missions/new"') && !html.includes('/app/conversations/a3'));
  fs.writeFileSync(path.join(output, `${role}.html`), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fielded role layout test: ${role}</title><style>:root{--font-sans:Inter,Arial,sans-serif;--font-mono:monospace}${css}</style><body>${html}</body></html>`);
}
console.log(`PASS: role-specific navigation and dashboard rendering; screenshots available from ${output}`);
