import test from 'node:test';
import assert from 'assert';
import { vscode } from './vscode.mjs'

import {
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'fs';

import { dirname } from 'mjs-dirname';
const __dirname = dirname(import.meta.url);

function ensureCleanDirSync(dir) {
  try {
    rmSync(root, { recursive: true })
  } catch (e) {
    if (typeof e === "object" && e !== null && e.code === "ENOENT") {
      // already doesn't exist
    }
  }

  try {
    mkdirSync(dir)
  } catch (e) {
    if (typeof e === "object" && e !== null && e.code === "EEXIST") {
      // already exists
    } else {
      throw e;
    }
  }
}

test('go to definition: foo.js bar -> bar.js ', async (t) => {
  const root = `${__dirname}/root`;
  // todo use node-fixturify
  ensureCleanDirSync(root)
  ensureCleanDirSync(`${root}/workspace`)

  writeFileSync(`${root}/workspace/foo.mjs`, `
import { bar } from './bar.mjs'

export function foo() { bar(); }
`)

  writeFileSync(`${root}/workspace/bar.mjs`, `
import { foo } from './foo.mjs'

export function bar() { foo(); }
`)

  await vscode(root, async ({ driver, workbench, root }) => {
    // test
    await workbench.quickaccess.openFile(`${root}/workspace/foo.mjs`);
    await workbench.editors.selectTab("foo.mjs");
    await workbench.editor.clickOnTerm("foo.mjs", "bar", 2);
    // TODO: deterministic wait
    await driver.wait(1000);
    await workbench.quickaccess.runCommand("go to implementation");

    // TODO: rather then waiting, let's check to see what tab is current active
    await workbench.editors.waitForActiveEditor('bar.mjs');

    assert.ok("Go to implementation worked")
  });

  // TODO: save, how to close native dialog?
  // something that needs jump to definition
  // something that needs to run a test
  // something that needs to debug
});
