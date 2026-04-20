export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
