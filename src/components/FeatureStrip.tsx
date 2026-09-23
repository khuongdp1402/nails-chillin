import React from 'react';
import { Sparkles, Gem, TrendingUp, Heart } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'Thiết Kế Hoàn Mỹ', desc: 'Mẫu nail được thiết kế riêng cho bạn.' },
  { icon: Gem, title: 'Chất Lượng Cao Cấp', desc: 'Sản phẩm tốt nhất cho móng khỏe đẹp.' },
  { icon: TrendingUp, title: 'Xu Hướng Mới Nhất', desc: 'Luôn cập nhật phong cách thịnh hành.' },
  { icon: Heart, title: 'Yêu Thương Bản Thân', desc: 'Vì bạn xứng đáng được chăm sóc.' },
];

export const FeatureStrip: React.FC = () => {
  return (
    <section className="feature-strip">
      <div className="container feature-strip-grid">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="feature-item">
            <div className="feature-icon-badge">
              <Icon size={22} />
            </div>
            <div>
              <h4 className="feature-title">{title}</h4>
              <p className="feature-desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
