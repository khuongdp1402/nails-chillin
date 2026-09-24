import '../styles/chrome.css';
import { zaloLink } from '../data/site';

export function ZaloFab() {
  return (
    <a
      className="ch-zalo"
      href={zaloLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nhắn Zalo cho tiệm"
    >
      <span className="ch-zalo-tip" role="tooltip">Nhắn Zalo cho tiệm</span>
      <span className="ch-zalo-btn" aria-hidden="true">Zalo</span>
    </a>
  );
}
