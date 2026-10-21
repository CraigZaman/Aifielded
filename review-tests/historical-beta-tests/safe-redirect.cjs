const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || process.cwd());
const dependencies = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dependencies('typescript');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/safe-redirect.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject, URL });
const { safeRedirect } = exportsObject;
for (const input of [null, undefined, '', 'https://evil.test', '//evil.test', '/\\evil.test', '/\t/evil.test', '/\n/evil.test', 'javascript:alert(1)']) {
  assert.equal(safeRedirect(input), '/app', String(input));
}
for (const input of ['/app', '/join/abc?source=email', '/app/missions?id=123#details']) {
  assert.equal(safeRedirect(input), input);
}
console.log('PASS: sign-in redirects remain on Fielded; invitation paths preserved');
