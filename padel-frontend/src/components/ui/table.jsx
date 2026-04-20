export function Table({ children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-[900px] w-full text-left">{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-slate-800/80">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-slate-800">{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`hover:bg-slate-900/70 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-100 ${className}`}>
      {children}
    </td>
  );
}
