import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { compressImage } from '../../utils/image';
import '../../styles/services-manager.css';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [urlDraft, setUrlDraft] = useState(value.startsWith('data:') ? '' : value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Bạn chọn giúp một tệp ảnh (JPG, PNG, WebP…) nhé.');
      return;
    }
    setBusy(true);
    try {
      const data = await compressImage(file, { maxSize: 1000, quality: 0.8 });
      onChange(data);
      setUrlDraft('');
    } catch {
      setError('Không đọc được ảnh này, bạn thử ảnh khác nhé.');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError('Đường dẫn ảnh cần bắt đầu bằng http:// hoặc https://');
      return;
    }
    setError('');
    onChange(url);
  };

  return (
    <div className="ui-upload">
      {value ? (
        <div className="ui-upload-preview">
          <img src={value} alt="Ảnh dịch vụ" />
          <button
            type="button"
            className="ui-upload-remove"
            onClick={() => {
              onChange('');
              setUrlDraft('');
            }}
            aria-label="Xóa ảnh"
          >
            <Trash2 size={15} aria-hidden="true" /> Xóa ảnh
          </button>
        </div>
      ) : (
        <div
          className={`ui-upload-drop${dragging ? ' is-drag' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {busy ? (
            <Loader2 size={24} className="ui-spin" aria-hidden="true" />
          ) : (
            <ImagePlus size={24} aria-hidden="true" />
          )}
          <strong>{busy ? 'Đang xử lý ảnh…' : 'Bấm để chọn ảnh hoặc kéo thả vào đây'}</strong>
          <span>Ảnh sẽ được thu nhỏ tự động cho nhẹ máy.</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <div className="ui-upload-url">
        <input
          type="url"
          className="ui-input"
          placeholder="Hoặc dán đường dẫn ảnh (https://…)"
          aria-label="Đường dẫn ảnh"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyUrl();
            }
          }}
        />
        <button type="button" className="btn btn-secondary ui-upload-url-btn" onClick={applyUrl}>
          Dùng ảnh này
        </button>
      </div>
      {error && (
        <p className="ui-upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
