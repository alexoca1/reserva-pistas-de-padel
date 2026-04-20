export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={() => onOpenChange(false)}
        aria-label="Cerrar"
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children, className = "" }) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h2>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`mt-6 flex flex-wrap justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
