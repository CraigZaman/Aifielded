const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dependencies = createRequire(path.join(root, 'package.json'));
const ts = dependencies('typescript');
const React = dependencies('react');
const { renderToStaticMarkup } = dependencies('react-dom/server');
const output = '/private/tmp/fielded-role-screens';
let viewer;
let completed = false;
const task = { id: 'task-1', organisation_id: 'org-1', title: 'Acknowledge the health and safety update', description: 'Read the revised safety procedure and confirm the reporting route.', assignee_id: 'employee', assigned_by: 'hr', status: 'assigned', due_at: '2026-09-08', follow_up_clarifications: [{ id: 'comment-1', author_id: 'hr', content: 'Please raise any blockers before the briefing.', created_at: '2026-09-05T09:00:00Z' }] };
const mission = { id: 'mission-1', title: 'Updated health and safety policy', objective: 'Review the reporting route and raise practical questions.', context: 'The latest procedure requires incidents to be recorded with the safety lead before the end of your shift.', desired_outcome: 'Confirm understanding and flag any blockers.', status: 'active' };
function query(table) {
  let filters = [];
  const chain = {
    select: () => chain, eq: (key,value) => { filters.push([key,value]); return chain; },
    in: () => chain, order: () => chain, maybeSingle: () => chain,
    then(resolve) {
      const values = {
        follow_up_tasks: [task],
        organisation_memberships: [{ user_id: 'employee', role: 'participant' }, { user_id: 'hr', role: 'hr' }],
        profiles: [{ id: 'employee', full_name: 'Priya Shah' }, { id: 'hr', full_name: 'Harriet Wells' }],
        missions: [mission],
        mission_assignments: { id: 'assignment-1', status: completed ? 'completed' : 'invited', missions: mission },
        conversations: completed ? { id: 'conversation-1', messages: [], conversation_summaries: { status: 'approved', summary: 'I have reviewed the procedure and understand the reporting route.' } } : null,
      };
      let data = values[table];
      if (table === 'follow_up_tasks') data = data.filter(row => filters.every(([key,value]) => row[key] === value));
      return Promise.resolve(resolve({ data, error: null }));
    },
  };
  return chain;
}
const mocks = {
  '@/components/refresh-workspace': { RefreshWorkspace: () => React.createElement('button', { title: 'Refresh workspace' }, 'Refresh') },
  'next/link': { default: ({ href, children, ...props }) => React.createElement('a', { ...props, href }, children) },
  'next/image': { default: ({ priority, ...props }) => React.createElement('img', { ...props, src: `.${props.src}` }) },
  'next/navigation': { usePathname: () => '/app/follow-ups', notFound: () => { throw Error('not found'); } },
  '@/app/(auth)/actions': { signOut: '/sign-in' },
  '@/app/app/actions': { createFollowUp: '/test/create-task', updateFollowUp: '/test/update-task', sendClarification: '/test/comment', submitWrittenResponse: '/test/submit' },
  '@/components/fielded-chat': { FieldedChat: () => React.createElement('div', {}, 'AI conversation') },
  '@/lib/auth': { requireViewer: async () => viewer, canManage: role => role !== 'participant', canManagePeople: role => ['owner','manager','hr'].includes(role), canManageIntegrations: role => ['owner','manager'].includes(role) },
  '@/lib/supabase/server': { createClient: async () => ({ from: query }) },
};
const cache = {};
function load(relative) {
  if (cache[relative]) return cache[relative];
  const exports = {}; cache[relative] = exports;
  const code = ts.transpileModule(fs.readFileSync(path.join(root,relative),'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, console, Date, URLSearchParams, require: name => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith('@/')) { const f=`src/${name.slice(2)}`; return load(fs.existsSync(path.join(root,`${f}.tsx`)) ? `${f}.tsx` : `${f}.ts`); }
    return dependencies(name);
  } }, { filename: relative });
  return exports;
}
async function main() {
  const AppShell = load('src/components/app-shell.tsx').AppShell;
  const FollowUps = load('src/app/app/follow-ups/page.tsx').default;
  const Response = load('src/app/app/conversations/[assignmentId]/page.tsx').default;
  const css = ['globals.css','role-workspaces.css'].map(f => fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
  fs.mkdirSync(output,{ recursive:true });
  for (const state of ['employee-tasks','hr-tasks','written-response','chat-response','completed-response']) {
    viewer = { id: state === 'hr-tasks' ? 'hr' : 'employee', name: state === 'hr-tasks' ? 'Harriet Wells' : 'Priya Shah', email: 'test@example.invalid', organisationId: 'org-1', organisationName: 'Example Engineering', role: state === 'hr-tasks' ? 'hr' : 'participant' };
    completed = state === 'completed-response';
    const body = state.endsWith('tasks') ? await FollowUps({ searchParams: Promise.resolve({}) }) : await Response({ params: Promise.resolve({ assignmentId: 'assignment-1' }), searchParams: Promise.resolve(state === 'written-response' ? { mode: 'written' } : {}) });
    const html = renderToStaticMarkup(React.createElement(AppShell,{ viewer },body));
    if(state === 'employee-tasks') { assert.ok(html.includes('Update status')); assert.ok(!html.includes('Assign follow-up')); assert.ok(html.includes('Harriet Wells')); }
    if(state === 'hr-tasks') { assert.ok(html.includes('Assign follow-up')); assert.ok(!html.includes('Update status')); }
    if(state === 'written-response') { assert.ok(html.includes('Confirm and submit response')); assert.ok(html.includes(mission.context)); assert.ok(html.includes('name="confirmed"')); }
    if(state === 'completed-response') { assert.ok(html.includes('Response submitted')); assert.ok(!html.includes('Confirm and submit response')); }
    if(state === 'chat-response') assert.ok(html.includes('AI conversation'));
    fs.writeFileSync(path.join(output,`${state}.html`), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${state}</title><style>:root{--font-sans:Inter,Arial,sans-serif;--font-mono:monospace}${css}</style><body>${html}</body></html>`);
  }
  viewer = { ...viewer, id: 'employee', role: 'manager' };
  assert.ok(renderToStaticMarkup(await FollowUps({ searchParams: Promise.resolve({}) })).includes('Update status'), 'Managers can update their own assigned work');
  console.log('PASS: employee/HR task controls, manager-as-assignee, written response and completed state rendering. Fixtures are not live authentication tests.');
}
main().catch(error => { console.error(error); process.exit(1); });
