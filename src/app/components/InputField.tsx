import React from "react";

const THEME = {
  textPrimary: "text-[#30364F]",
  border: "border-[#cbd5e1]",
};

type InputFieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className={`text-sm font-bold ${THEME.textPrimary}`}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border ${THEME.border} px-4 py-2.5 text-sm rounded-md focus:border-[#30364F] focus:outline-none focus:ring-1 focus:ring-[#30364F] bg-white transition-all placeholder:text-slate-400`}
      />
    </div>
  );
}