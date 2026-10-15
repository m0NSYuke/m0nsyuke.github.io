import {useEffect, useState} from 'react';
import {t} from '../lib/i18n';

const listeners = new Set();
export function toast(message) {
  listeners.forEach(listener => listener(message));
}

export function Toaster() {
  const [message, setMessage] = useState(null);
  useEffect(() => {
    let timer;
    const show = text => {
      clearTimeout(timer);
      setMessage({text, key: Date.now()});
      timer = setTimeout(() => setMessage(null), 2000);
    };
    listeners.add(show);
    return () => { listeners.delete(show); clearTimeout(timer); };
  }, []);
  return <div className="toast-region" role="status" aria-live="polite">
    {message && <div className="toast" key={message.key}>{message.text}</div>}
  </div>;
}

export async function copyText(text, done = t('copied')) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  toast(done);
}
