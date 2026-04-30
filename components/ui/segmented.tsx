"use client";

type Option = { value: string; label: string };

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
};

export function Segmented({ name, value, onChange, options }: Props) {
  return (
    <div className="seg" role="radiogroup">
      <input type="hidden" name={name} value={value} />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className="seg-opt"
          data-active={value === opt.value ? 1 : 0}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
