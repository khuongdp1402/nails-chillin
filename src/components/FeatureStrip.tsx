import '../styles/hero.css';
import React from 'react';
import { Sparkles, ShieldCheck, Timer, Heart } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const FEATURES = [
  { icon: ShieldCheck, title: 'Tiệt trùng mỗi khách', desc: 'Dụng cụ được tiệt trùng trước khi dùng cho bạn.' },
  { icon: Sparkles, title: 'Sơn bền 3–4 tuần', desc: 'Gel chuẩn, ít bong tróc, giữ màu đẹp lâu.' },
  { icon: Timer, title: 'Đúng giờ hẹn', desc: 'Bạn đặt khung giờ nào, tiệm giữ chỗ đúng khung giờ đó.' },
  { icon: Heart, title: 'Nhẹ nhàng, không ép mua', desc: 'Tư vấn thật lòng, chọn mẫu hợp với tay bạn.' },
];

const FeatureItem: React.FC<{ index: number } & (typeof FEATURES)[number]> = ({
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
      <div>
        <h4 className="hx-feature-title">{title}</h4>
        <p className="hx-feature-desc">{desc}</p>
      </div>
    </div>
  );
};

export const FeatureStrip: React.FC = () => {
  return (
    <section className="hx-features">
      <div className="container hx-container hx-features-grid">
        {FEATURES.map((f, i) => (
          <FeatureItem key={f.title} index={i} {...f} />
        ))}
      </div>
    </section>
  );
};
