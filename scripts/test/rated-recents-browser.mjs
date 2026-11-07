import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { EventEmitter, once } from 'node:events';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

mkdirSync('/tmp/opencode', { recursive: true });
const profile = mkdtempSync('/tmp/opencode/bred-rated-browser-');
const server = spawn(process.execPath, ['scripts/serve.mjs', 'public', '8796'], { stdio: ['ignore', 'pipe', 'inherit'] });
await once(server.stdout, 'data');
const browser = spawn('chromium', ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-pipe', `--user-data-dir=${profile}`], {
  stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
});
let sequence = 0;
let buffer = '';
const pending = new Map();
const events = new EventEmitter();
browser.stdio[4].on('data', data => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\0')) !== -1) {
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    if (message.method) events.emit(message.method, message.params);
    const waiter = pending.get(message.id);
    if (waiter) {
      pending.delete(message.id);
      clearTimeout(waiter.timer);
      if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
      else waiter.resolve(message.result);
    }
  }
});
function call(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 15000);
    pending.set(id, { resolve, reject, timer });
    browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}

try {
  const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
  const command = (method, params) => call(method, params, sessionId);
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  async function navigate(path) {
    await command('Page.navigate', { url: `http://localhost:8796${path}` });
    await evaluate(`new Promise(resolve => {
      const check = () => document.querySelector('.rated-min:not([disabled])') ? resolve(true) : setTimeout(check, 20);
      check();
    })`);
  }
  await command('Page.enable');
  await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await navigate('/');
  assert.equal(await evaluate(`document.querySelectorAll('.rated-item').length`), 5);
  assert.ok(await evaluate(`(() => { const links = Array.from(document.querySelectorAll('.recent-footer a'), el => getComputedStyle(el)); return ['fontSize', 'color', 'padding', 'textDecoration'].every(key => links[0][key] === links[1][key]); })()`), 'footer actions share the original link styling');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.rated-empty')).display`), 'none', 'empty-state message is not rendered when there are matching posts');
  assert.ok(await evaluate(`(() => { const labels = getComputedStyle(document.querySelector('.rated-endpoints')); const meta = getComputedStyle(document.querySelector('.rated-meta')); return ['fontSize', 'color', 'opacity'].every(key => labels[key] === meta[key]); })()`), 'endpoint labels reuse article metadata typography and contrast');
  assert.equal(await evaluate(`JSON.parse(document.querySelector('.rated-data').textContent).length`), 16);
  assert.ok(await evaluate(`document.querySelector('.rated-meta').textContent.startsWith('Jul 26, 2026')`), 'client preserves publication date instead of shifting it by timezone');
  const dragThumb = async (selector, fraction) => {
    const box = await evaluate(`(() => { const r = document.querySelector('${selector}').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, value: +document.querySelector('${selector}').value }; })()`);
    const from = box.x + 8 + (box.width - 16) * box.value / 9;
    const to = box.x + 8 + (box.width - 16) * fraction;
    const y = box.y + box.height / 2;
    await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from, y });
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: from, y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: to, y, button: 'left', buttons: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to, y, button: 'left', clickCount: 1 });
  };
  await dragThumb('.rated-min', 2 / 9);
  assert.equal(await evaluate(`document.querySelector('.rated-min').value`), '2', 'lower thumb can be dragged');
  await dragThumb('.rated-max', 7 / 9);
  assert.equal(await evaluate(`document.querySelector('.rated-max').value`), '7', 'upper thumb can be dragged');
  await evaluate(`document.querySelector('.rated-min').value = '0'; document.querySelector('.rated-max').value = '9'; document.querySelector('.rated-min').dispatchEvent(new Event('input'))`);
  const requestsBeforeFiltering = await evaluate(`performance.getEntriesByType('resource').length`);
  await evaluate(`document.querySelector('.rated-min').focus()`);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  assert.equal(await evaluate(`document.querySelector('.rated-min').value`), '1', 'native keyboard thumb works');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.rated-min')).outlineStyle`), 'none', 'slider field has no focus outline');
  await evaluate(`document.querySelector('.rated-min').value = '9'; document.querySelector('.rated-min').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelector('.rated-interval').value`), '9–9');
  assert.equal(await evaluate(`document.querySelectorAll('.rated-item').length`), 2, 'equal bounds include both older 9-rated posts');
  assert.ok(await evaluate(`Array.from(document.querySelectorAll('.rated-meta')).every(el => !/\\d\\/9/.test(el.textContent) && el.textContent.split(' | ').length === 3)`), 'filtered rows show only date, reading time and words');
  await evaluate(`document.querySelector('.rated-max').value = '0'; document.querySelector('.rated-max').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelector('.rated-max').value`), '9', 'thumbs do not cross');
  assert.equal(await evaluate(`performance.getEntriesByType('resource').length`), requestsBeforeFiltering, 'filtering makes no additional requests');
  const randomNavigation = once(events, 'Page.frameNavigated', { signal: AbortSignal.timeout(15000) });
  await evaluate(`document.querySelector('.rated-random').click()`);
  await randomNavigation;
  assert.match(await evaluate('location.pathname'), /^\/posts\/(games\/shaking|peripheral\/how-to-make-a-good-mousepad-review)\/$/, 'random action respects matching posts');
  await navigate('/');
  await evaluate(`(() => {
    const original = document.querySelector('.rated-recents');
    const copy = original.cloneNode(true);
    const data = copy.querySelector('.rated-data');
    data.textContent = JSON.stringify(JSON.parse(data.textContent).filter(p => p[5] !== 0));
    original.replaceWith(copy);
  })()`);
  await evaluate(readFileSync('modules/rated_recents/client.js', 'utf8'));
  await evaluate(`document.querySelector('.rated-max').value = '0'; document.querySelector('.rated-max').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelectorAll('.rated-item').length`), 0);
  assert.equal(await evaluate(`document.querySelector('.rated-empty').hidden`), false);
  assert.equal(await evaluate(`document.querySelector('.rated-random').hidden`), true);
  await navigate('/');
  await evaluate(`document.querySelector('.rated-min').value = '9'; document.querySelector('.rated-min').dispatchEvent(new Event('input'))`);
  await command('Emulation.setTouchEmulationEnabled', { enabled: true });
  const touchBox = await evaluate(`(() => { const r = document.querySelector('.rated-slider').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
  await command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchBox.x + touchBox.width - 8, y: touchBox.y + touchBox.height / 2 }] });
  await command('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchBox.x + touchBox.width * 0.65, y: touchBox.y + touchBox.height / 2 }] });
  await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.ok(await evaluate(`+document.querySelector('.rated-min').value < 9 && document.querySelector('.rated-max').value === '9'`), 'touch users can separate coincident thumbs at 9–9');
  await command('Emulation.setTouchEmulationEnabled', { enabled: false });
  await navigate('/ru/');
  assert.ok(await evaluate(`JSON.parse(document.querySelector('.rated-data').textContent).every(p => p[0].startsWith('/ru/posts/'))`));
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await evaluate(`document.querySelector('.rated-recents').scrollIntoView()`);
  assert.ok(await evaluate(`document.querySelector('.rated-controls').getBoundingClientRect().width > 0`));
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), 'mobile has no horizontal overflow');
  const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync('/tmp/opencode/bred-rated-mobile.png', Buffer.from(screenshot.data, 'base64'));
  await command('Emulation.setScriptExecutionDisabled', { value: true });
  await command('Page.navigate', { url: 'http://localhost:8796/' });
  let ready = false;
  for (let attempt = 0; attempt < 100 && !ready; attempt++) {
    ready = await evaluate(`document.readyState === 'complete' && !!document.querySelector('.rated-min[disabled]')`);
    if (!ready) await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.ok(ready, 'no-JS page loaded');
  assert.equal(await evaluate(`document.querySelectorAll('.rated-item a[href]').length`), 5);
  assert.ok(await evaluate(`document.querySelector('.rated-controls').hidden`));
  console.log('Chromium: mouse/touch dragging, keyboard, inclusive bounds, no crossing, older matches, empty interval, filtered random, ru locale, mobile and no-JS fallback passed');
} finally {
  browser.kill();
  server.kill();
  await once(browser, 'exit');
  rmSync(profile, { recursive: true, force: true });
}
