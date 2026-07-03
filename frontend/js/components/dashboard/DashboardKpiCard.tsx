import { Link } from 'react-router';

export interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  to?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  trend?: string;
}

const variantStyles = {
  default: {
    card: 'from-surface-container-high to-surface-container border-outline-variant/60',
    icon: 'bg-primary/15 text-primary',
    value: 'text-on-surface',
  },
  success: {
    card: 'from-primary/10 to-surface-container border-primary/20',
    icon: 'bg-primary/20 text-primary',
    value: 'text-primary',
  },
  warning: {
    card: 'from-tertiary/10 to-surface-container border-tertiary/20',
    icon: 'bg-tertiary/20 text-tertiary',
    value: 'text-tertiary',
  },
  danger: {
    card: 'from-error/10 to-surface-container border-error/20',
    icon: 'bg-error/20 text-error',
    value: 'text-error',
  },
};

const DashboardKpiCard = ({
  label,
  value,
  subtitle,
  icon,
  to,
  variant = 'default',
  trend,
}: KpiCardProps) => {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition hover:shadow-lg hover:shadow-primary/5 ${styles.card} ${to ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${styles.value}`}>{value}</p>
          {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
          {trend && <p className="mt-2 text-xs text-primary">{trend}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export default DashboardKpiCard;
