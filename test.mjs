import { test } from 'node:test';
import assert from 'assert';

import { vscode } from './vscode.mjs'
import { Project } from 'fixturify-project';

test('goToImplementation: foo.mjs[bar reference] -> bar.mjs[bar definition] ', async () => {
  // setup project
  const project = new Project('my-project', project => {

    project.files['foo.mjs'] = `
import { bar } from './bar.mjs'

export function foo() { bar(); }
`;

    project.files['bar.mjs'] = `
import { foo } from './foo.mjs'

export function bar() { foo(); }
`;
  });

  await project.write();
  debugger;

  await vscode(project.baseDir, async ({ driver, workbench }) => {
    await workbench.quickaccess.openFile(`${project.baseDir}/foo.mjs`);
    await workbench.editors.selectTab("foo.mjs");
    await workbench.editor.clickOnTerm("foo.mjs", "bar", 2);
    // TODO: deterministic for click to settle
    await driver.wait(1000);
    await workbench.quickaccess.runCommand("go to implementation");

    // TODO: rather then waiting, let's check to see what tab is current active
    await workbench.editors.waitForActiveEditor('bar.mjs');

    assert.ok("Go to implementation worked")
  });

  // jump to implementation for dependency

  // something that needs jump to definition
  // something that needs to run a test
  // something that needs to debug
});
