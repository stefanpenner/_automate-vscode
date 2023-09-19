import { test } from 'node:test';
import assert from 'assert';

import { vscode } from './vscode.mjs'
import { Project } from 'fixturify-project';
import { dirname, filename } from 'mjs-dirname';

const __dirname = dirname(import.meta.url);
// setup project
const SimpleNodeProject = Project.fromDir(`${__dirname}/fixtures/simple-node-project`);

test('goToImplementation: foo.mjs[bar reference] -> bar.mjs[bar definition] ', async () => {
  const project = SimpleNodeProject.clone()
  await project.write();

  await vscode(project.baseDir, async ({ driver, workbench }) => {
    await workbench.quickaccess.openFile(`${project.baseDir}/foo.mjs`);
    await workbench.editors.selectTab("foo.mjs");
    await workbench.editor.clickOnTerm("foo.mjs", "bar", 3);
    // TODO: deterministic for click to settle
    await driver.wait(1000);
    await workbench.quickaccess.runCommand("go to implementation");

    // TODO: rather then waiting, let's check to see what tab is current active
    await workbench.editors.waitForActiveEditor('bar.mjs');

    assert.ok('GoToImplementation succeeded')
  });
});

  // jump to implementation for dependency

  // something that needs jump to definition
  // something that needs to run a test
  // something that needs to debug
});
