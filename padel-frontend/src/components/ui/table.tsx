import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-[900px] w-full text-left">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-white/5">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return (
    <motion.tbody
      className="divide-y divide-white/10"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return (
    <motion.tr variants={fadeUp} className={`transition-colors hover:bg-white/5 ${className}`}>
      {children}
    </motion.tr>
  );
}




interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm text-foreground ${className}`} {...props}>
      {children}
    </td>
  );
}