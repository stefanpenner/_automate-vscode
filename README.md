# _automate-vscode

WIP tool to automate testing some VSCode workflows


```js
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
```

Test that the debugger works
```js
test('Debug: Set|Break|Continue Breakpoint on main.mjs[foo]', async () => {
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
```
