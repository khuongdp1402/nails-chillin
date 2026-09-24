import '../styles/hero.css';
import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Palette, Leaf, Hand, Moon, Droplets } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import type { ServiceMode } from '../context/ModeContext';
import { useReveal } from '../hooks/useReveal';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

// Title: one line (about 20 characters). Description: two lines (about 55 characters).
const FEATURES: Record<ServiceMode, Feature[]> = {
  nail: [
    { icon: ShieldCheck, title: 'Dụng cụ tiệt trùng', desc: 'Mỗi bạn một bộ dụng cụ đã tiệt trùng kỹ trước khi làm.' },
    { icon: Sparkles, title: 'Gel lành tính', desc: 'Bền màu 3–4 tuần, bóng mượt mà vẫn nhẹ cho móng.' },
    { icon: Palette, title: 'Nhiều mẫu tùy chọn', desc: 'Chọn theo sở thích, tiệm vẽ đúng ý của bạn.' },
    { icon: HeartHandshake, title: 'Tư vấn hợp da', desc: 'Gợi ý phom móng và tone màu hợp da tay bạn.' },
  ],
  headspa: [
    { icon: Leaf, title: 'Thảo mộc lành tính', desc: 'Bồ kết, sả, gừng dịu nhẹ cho da đầu nhạy cảm.' },
    { icon: Hand, title: 'Massage cổ vai gáy', desc: 'Bấm huyệt nhẹ nhàng, tan mỏi sau một ngày dài.' },
    { icon: Moon, title: 'Không gian yên tĩnh', desc: 'Nhạc êm, ánh sáng dịu để bạn thả lỏng trọn vẹn.' },
    { icon: Droplets, title: 'Nước ấm vừa đủ', desc: 'Luôn giữ nhiệt độ dễ chịu cho từng bạn.' },
  ],
  both: [
    { icon: ShieldCheck, title: 'Dụng cụ tiệt trùng', desc: 'Mỗi bạn một bộ dụng cụ đã tiệt trùng kỹ trước khi làm.' },
    { icon: Sparkles, title: 'Gel bền màu', desc: 'Gel lành tính, bóng mượt suốt 3–4 tuần.' },
    { icon: Leaf, title: 'Thảo mộc lành tính', desc: 'Bồ kết, sả, gừng dịu nhẹ cho da đầu nhạy cảm.' },
    { icon: Hand, title: 'Massage cổ vai gáy', desc: 'Bấm huyệt nhẹ nhàng, tan mỏi sau một ngày dài.' },
  ],
};

const FeatureItem: React.FC<{ index: number } & Feature> = ({
  index,
  icon: Icon,
  title,
  desc,
}) => {
  const ref = useReveal<HTMLDivElement>(index * 80);
  return (
    <div ref={ref} className="hx-feature">
      <div className="hx-feature-icon">
        <Icon size={22} />
      </div>
      <div className="hx-feature-text">
        <h4 className="hx-feature-title">{title}</h4>
        <p className="hx-feature-desc">{desc}</p>
      </div>
    </div>
  );
};

export const FeatureStrip: React.FC = () => {
  const { mode } = useMode();
  const key = mode ?? 'both';
  return (
    <section className="hx-features">
      <div key={key} className="container hx-container hx-features-grid is-swap">
        {FEATURES[key].map((f, i) => (
          <FeatureItem key={f.title} index={i} {...f} />
        ))}
      </div>
    </section>
  );
};
