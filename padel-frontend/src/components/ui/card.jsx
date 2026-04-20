export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-900 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`border-b border-slate-700 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-2xl font-bold text-white ${className}`}>{children}</h2>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`border-t border-slate-700 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
