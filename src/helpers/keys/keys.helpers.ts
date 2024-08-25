export function isSpecialKey(key: string): boolean {
  const specialKeys = new Set([
    'Alt',
    'AltGraph',
    'Control',
    'Shift',
    'Meta',
    'CapsLock',
    'Escape',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'Tab',
    'End',
    'PageDown',
    'Insert',
    'Delete',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    'ContextMenu',
    'NumLock',
    'ScrollLock',
    'Pause',
    'PrintScreen',
  ]);

  return specialKeys.has(key);
}

export function isInputKey(key: string): boolean {
  // Regex para teclas imprimibles y caracteres de control de texto (excluyendo 'Tab')
  const inputKeyRegex = /^[ -~]$|^Backspace$|^Enter$/;

  return inputKeyRegex.test(key);
}
