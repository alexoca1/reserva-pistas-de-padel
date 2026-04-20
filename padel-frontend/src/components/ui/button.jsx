export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}