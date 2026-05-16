import { Link } from 'react-router-dom';
import { HiOutlineChevronRight } from 'react-icons/hi';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <HiOutlineChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
            )}
            {isLast || !item.to ? (
              <span
                className={`text-[13px] ${
                  isLast
                    ? 'font-semibold text-heading'
                    : 'text-muted'
                }`}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="text-[13px] text-primary hover:underline no-underline transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
