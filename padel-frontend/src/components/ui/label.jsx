export function Label({ htmlFor, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-slate-300 ${className}`}
    >
      {children}
    </label>
  );
}
