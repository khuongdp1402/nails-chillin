import '../styles/chrome.css';
import { instagramLink } from '../data/site';
import { InstagramIcon } from './ui/InstagramIcon';

export function ZaloFab() {
  return (
    <a
      className="ch-zalo ch-instagram"
      href={instagramLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nhắn Instagram cho tiệm"
    >
      <span className="ch-zalo-tip" role="tooltip">Nhắn Instagram cho tiệm</span>
      <span className="ch-zalo-btn" aria-hidden="true">
        <InstagramIcon size={24} strokeWidth={1.8} />
      </span>
    </a>
  );
}
