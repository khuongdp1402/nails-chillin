export interface CompressOptions {
  maxSize?: number;
  quality?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = src;
  });
}

/**
 * Thu nhỏ ảnh (cạnh dài nhất <= maxSize) và nén thành JPEG data URL (~<150KB).
 */
export async function compressImage(
  file: File,
  { maxSize = 1000, quality = 0.8 }: CompressOptions = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tệp này không phải là ảnh');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const limit = 150 * 1024 * 1.37; // base64 overhead
    let q = quality;
    let out = canvas.toDataURL('image/jpeg', q);
    while (out.length > limit && q > 0.4) {
      q -= 0.1;
      out = canvas.toDataURL('image/jpeg', q);
    }
    return out;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
