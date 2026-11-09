/**
 * Shared builder for bundled app HTML packages.
 * Every app is a fully self-contained HTML document (inline CSS + JS),
 * stored on-device at install time and launched inside a sandboxed iframe.
 *
 * Note: intentionally avoids template literals inside app code so the
 * packages survive being embedded as plain strings.
 */

export const APP_RESET = [
  '*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;',
  'user-select:none;-webkit-user-select:none;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
  'html,body{height:100%}',
  'button{cursor:pointer;border:0;background:none;color:inherit;font:inherit}',
  'input,textarea,select{font:inherit;color:inherit}',
].join('');

export function page(title: string, css: string, body: string, script: string): string {
  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + title + '</title>' +
    '<style>' + APP_RESET + css + '</style>' +
    '</head><body>' + body +
    '<script>' + script + '</scr' + 'ipt></body></html>'
  );
}
