const { _electron } = require('playwright');
const { App } = require('vscode-automation');

module.exports = async function setup({ logger }) {
  // Launch Electron app.
  const electron = await _electron.launch({
    executablePath: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
    args: [
      `${__dirname}/workspace`,
      process.platform === 'linux' && '--disable-dev-shm-usage',
      process.platform === 'linux' && '--disable-gpu',
      process.platform === 'darwin' && '--disable-gpu',
      process.env['VERBOSE'] && '--verbose',
      '--skip-release-notes',
      '--skip-welcome',
      '--disable-telemetry',
      '--no-cached-data',
      '--disable-updates',
      '--use-inmemory-secretstorage',
      '--disable-workspace-trust',
      // TODO: tmpdir
      `--crash-reporter-directory=${__dirname} / crashes`,
      `--extensions-dir=${__dirname} / extensionsPath`,
      `--user-data-dir=${__dirname} / userDataDir`,
      `--logsPath=${__dirname} / logsPath`,
    ].filter(Boolean),
    timeout: 0,
  });

  const window = await electron.waitForEvent('window', {
    timeout: 0,
  }, 'playwright-electron#firstWindow');

  const context = window.context();

  electron.on('window', () => logger.log(`Playwright (Electron): electron.on('window')`));
  electron.on('close', () => logger.log(`Playwright (Electron): electron.on('close')`));

  context.on('page', () => logger.log(`Playwright (Electron): context.on('page')`));
  context.on('requestfailed', e => logger.log(`Playwright (Electron): context.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));

  window.on('dialog', () => logger.log(`Playwright (Electron): window.on('dialog')`));
  window.on('domcontentloaded', () => logger.log(`Playwright (Electron): window.on('domcontentloaded')`));
  window.on('load', () => logger.log(`Playwright (Electron): window.on('load')`));
  window.on('popup', () => logger.log(`Playwright (Electron): window.on('popup')`));
  window.on('framenavigated', () => logger.log(`Playwright (Electron): window.on('framenavigated')`));
  window.on('requestfailed', e => logger.log(`Playwright (Electron): window.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));

  window.on('console', e => logger.log(`Playwright (Electron): window.on('console') [${e.text()}]`));
  window.on('pageerror', async (error) => logger.log(`Playwright (Electron) ERROR: page error: ${error}`));
  window.on('crash', () => logger.log('Playwright (Electron) ERROR: page crash'));
  window.on('close', () => logger.log('Playwright (Electron): page close'));
  window.on('response', async (response) => {
    if (response.status() >= 400) {
      logger.log(`Playwright (Electron) ERROR: HTTP status ${response.status()} for ${response.url()}`);
    }
  });

  // Evaluation expression in the Electron context.
  const appPath = await electron.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.getAppPath();
  });

  return {
    window,
    context,
    electron,
    appPath
  };
}
