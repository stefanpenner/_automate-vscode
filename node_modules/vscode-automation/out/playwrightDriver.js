"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightDriver = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const logger_1 = require("./logger");
const processes_1 = require("./processes");
class PlaywrightDriver {
  constructor(application, context, page, serverProcess, whenLoaded, options) {
    this.application = application;
    this.context = context;
    this.page = page;
    this.serverProcess = serverProcess;
    this.whenLoaded = whenLoaded;
    this.options = options;
  }
  async startTracing(name) {
    if (!this.options.tracing) {
      return; // tracing disabled
    }
    try {
      await (0, logger_1.measureAndLog)(() => this.context.tracing.startChunk({ title: name }), `startTracing for ${name}`, this.options.logger);
    }
    catch (error) {
      // Ignore
    }
  }
  async stopTracing(name, persist) {
    if (!this.options.tracing) {
      return; // tracing disabled
    }
    try {
      let persistPath = undefined;
      if (persist) {
        persistPath = (0, path_1.join)(this.options.logsPath, `playwright-trace-${PlaywrightDriver.traceCounter++}-${name.replace(/\s+/g, '-')}.zip`);
      }
      await (0, logger_1.measureAndLog)(() => this.context.tracing.stopChunk({ path: persistPath }), `stopTracing for ${name}`, this.options.logger);
      // To ensure we have a screenshot at the end where
      // it failed, also trigger one explicitly. Tracing
      // does not guarantee to give us a screenshot unless
      // some driver action ran before.
      if (persist) {
        await this.takeScreenshot(name);
      }
    }
    catch (error) {
      // Ignore
    }
  }
  async didFinishLoad() {
    await this.whenLoaded;
  }
  async takeScreenshot(name) {
    try {
      const persistPath = (0, path_1.join)(this.options.logsPath, `playwright-screenshot-${PlaywrightDriver.screenShotCounter++}-${name.replace(/\s+/g, '-')}.png`);
      await (0, logger_1.measureAndLog)(() => this.page.screenshot({ path: persistPath, type: 'png' }), 'takeScreenshot', this.options.logger);
    }
    catch (error) {
      // Ignore
    }
  }
  async reload() {
    await this.page.reload();
  }
  async exitApplication() {
    // Stop tracing
    try {
      if (this.options.tracing) {
        await (0, logger_1.measureAndLog)(() => this.context.tracing.stop(), 'stop tracing', this.options.logger);
      }
    }
    catch (error) {
      // Ignore
    }
    // Web: Extract client logs
    if (this.options.web) {
      try {
        await (0, logger_1.measureAndLog)(() => this.saveWebClientLogs(), 'saveWebClientLogs()', this.options.logger);
      }
      catch (error) {
        this.options.logger.log(`Error saving web client logs (${error})`);
      }
    }
    // Web: exit via `close` method
    if (this.options.web) {
      try {
        await (0, logger_1.measureAndLog)(() => this.application.close(), 'playwright.close()', this.options.logger);
      }
      catch (error) {
        this.options.logger.log(`Error closing appliction (${error})`);
      }
    }
    // Desktop: exit via `driver.exitApplication`
    else {
      try {
        await (0, logger_1.measureAndLog)(() => this.evaluateWithDriver(([driver]) => driver.exitApplication()), 'driver.exitApplication()', this.options.logger);
      }
      catch (error) {
        this.options.logger.log(`Error exiting appliction (${error})`);
      }
    }
    // Server: via `teardown`
    if (this.serverProcess) {
      await (0, logger_1.measureAndLog)(() => (0, processes_1.teardown)(this.serverProcess, this.options.logger), 'teardown server process', this.options.logger);
    }
  }
  async saveWebClientLogs() {
    const logs = await this.getLogs();
    for (const log of logs) {
      const absoluteLogsPath = (0, path_1.join)(this.options.logsPath, log.relativePath);
      await fs_1.promises.mkdir((0, path_1.dirname)(absoluteLogsPath), { recursive: true });
      await fs_1.promises.writeFile(absoluteLogsPath, log.contents);
    }
  }
  async dispatchKeybinding(keybinding) {
    const chords = keybinding.split(' ');
    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      if (i > 0) {
        await this.wait(100);
      }
      if (keybinding.startsWith('Alt') || keybinding.startsWith('Control') || keybinding.startsWith('Backspace')) {
        await this.page.keyboard.press(keybinding);
        return;
      }
      const keys = chord.split('+');
      const keysDown = [];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] in PlaywrightDriver.vscodeToPlaywrightKey) {
          keys[i] = PlaywrightDriver.vscodeToPlaywrightKey[keys[i]];
        }
        await this.page.keyboard.down(keys[i]);
        keysDown.push(keys[i]);
      }
      while (keysDown.length > 0) {
        await this.page.keyboard.up(keysDown.pop());
      }
    }
    await this.wait(100);
  }
  async click(selector, xoffset, yoffset) {
    const { x, y } = await this.getElementXY(selector, xoffset, yoffset);
    await this.page.mouse.click(x + (xoffset ? xoffset : 0), y + (yoffset ? yoffset : 0));
  }
  async setValue(selector, text) {
    return this.page.evaluate(([driver, selector, text]) => driver.setValue(selector, text), [await this.getDriverHandle(), selector, text]);
  }
  async getTitle() {
    return this.page.title();
  }
  async isActiveElement(selector) {
    return this.page.evaluate(([driver, selector]) => driver.isActiveElement(selector), [await this.getDriverHandle(), selector]);
  }
  async getElements(selector, recursive = false) {
    return this.page.evaluate(([driver, selector, recursive]) => {
      return driver.getElements(selector, recursive);
    }, [await this.getDriverHandle(), selector, recursive]);
  }
  async getElementXY(selector, xoffset, yoffset) {
    return this.page.evaluate(([driver, selector, xoffset, yoffset]) => driver.getElementXY(selector, xoffset, yoffset), [await this.getDriverHandle(), selector, xoffset, yoffset]);
  }
  async typeInEditor(selector, text) {
    return this.page.evaluate(([driver, selector, text]) => driver.typeInEditor(selector, text), [await this.getDriverHandle(), selector, text]);
  }
  async getTerminalBuffer(selector) {
    return this.page.evaluate(([driver, selector]) => driver.getTerminalBuffer(selector), [await this.getDriverHandle(), selector]);
  }
  async writeInTerminal(selector, text) {
    return this.page.evaluate(([driver, selector, text]) => driver.writeInTerminal(selector, text), [await this.getDriverHandle(), selector, text]);
  }
  async getLocaleInfo() {
    return this.evaluateWithDriver(([driver]) => driver.getLocaleInfo());
  }
  async getLocalizedStrings() {
    return this.evaluateWithDriver(([driver]) => driver.getLocalizedStrings());
  }
  async getLogs() {
    return this.page.evaluate(([driver]) => driver.getLogs(), [await this.getDriverHandle()]);
  }
  async evaluateWithDriver(pageFunction) {
    return this.page.evaluate(pageFunction, [await this.getDriverHandle()]);
  }
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async getDriverHandle() {
    return this.page.evaluateHandle('window.driver');
  }
}
exports.PlaywrightDriver = PlaywrightDriver;
PlaywrightDriver.traceCounter = 1;
PlaywrightDriver.screenShotCounter = 1;
PlaywrightDriver.vscodeToPlaywrightKey = {
  cmd: 'Meta',
  ctrl: 'Control',
  shift: 'Shift',
  enter: 'Enter',
  escape: 'Escape',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  home: 'Home',
  esc: 'Escape'
};
//# sourceMappingURL=playwrightDriver.js.map
