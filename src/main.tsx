import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AudioProvider } from './audio/AudioProvider';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root');

try {
  if (!rootEl) throw new Error('#root missing');
  createRoot(rootEl).render(
    <StrictMode>
      <AudioProvider>
        <App />
      </AudioProvider>
    </StrictMode>,
  );
  try {
    sessionStorage.removeItem('izakaya-boot-reload');
  } catch {
    /* ignore */
  }
} catch (err) {
  if (rootEl) {
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    rootEl.innerHTML = `<pre style="white-space:pre-wrap;padding:1rem;color:#ff8aa0;font:12px/1.4 ui-monospace,monospace">${msg.replace(/</g, '&lt;')}</pre>`;
  }
  console.error(err);
}
