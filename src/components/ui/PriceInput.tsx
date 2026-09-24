import '../../styles/services-manager.css';

interface PriceInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  describedBy?: string;
}

export function PriceInput({ id, value, onChange, invalid, describedBy }: PriceInputProps) {
  const display = value > 0 ? value.toLocaleString('vi-VN') : '';
  return (
    <div className={`ui-price${invalid ? ' is-invalid' : ''}`}>
      <input
        id={id}
        className="ui-price-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        value={display}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
          onChange(digits ? parseInt(digits, 10) : 0);
        }}
      />
      <span className="ui-price-suffix" aria-hidden="true">đ</span>
    </div>
  );
}

export default PriceInput;
