import { test } from 'node:test';
import assert from 'assert';

import { vscode } from './vscode.mjs'
import { Project } from 'fixturify-project';
import { dirname } from 'mjs-dirname';

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

    await workbench.editors.waitForActiveEditor('bar.mjs');

    assert.ok('Workflow Succeeded')
  });
});

test('Debug: [Set|Break|Continue Breakpoint|Run] on main.mjs[foo]', async () => {
  const project = SimpleNodeProject.clone()
  await project.write();

  await vscode(project.baseDir, async ({ driver, workbench }) => {
    await workbench.quickaccess.openFile(`${project.baseDir}/main.mjs`);
    await workbench.editors.selectTab("main.mjs");
    await workbench.editor.clickOnTerm("main.mjs", "foo", 7);

    await workbench.quickaccess.runCommand("Debug: Toggle Breakpoint");

    await driver.dispatchKeybinding("F5"); // Continue debugger

    // wait for the debug console to open and the right callstack appear
    await driver.page.locator('[aria-label="Debug Call Stack"] > [role="presentation"]').waitFor();

    await driver.dispatchKeybinding("F5"); // Continue debugger

    await driver.page.click('.debug-toolbar [role=toolbar] [title^="Continue"]');

    await retryAssertion(async () => {
      const debugTerminalText = await driver.page.locator('.repl [aria-label="Debug Console"] > [role="presentation"]').textContent();
      assert.match(debugTerminalText, /Program Complete/);
    });

    assert.ok('Workflow Succeeded')
  });
});

import {
  setTimeout,
} from 'timers/promises';

async function retryAssertion(fn, COUNT = 10, ms = 100) {
  let count = 0;

  await (async function next() {
    try {
      await fn();
    } catch (e) {
      if (typeof e === 'object' && e !== null && e.name === 'AssertionError') {
        count++;
        if (COUNT < count) {
          throw e;
        } else {
          await setTimeout(next, ms)
        }
      } else {
        throw e;
      }
    }
  })();
}
