import logoPrimary from '@/assets/images/brand/artemis-logo.png';
import logoDark from '@/assets/images/brand/artemis-logo-dark.png';

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const;

export interface ArtemisLogoProps {
  size?: keyof typeof SIZES;
  showText?: boolean;
  variant?: 'primary' | 'dark';
  subtitle?: string;
  className?: string;
  textClassName?: string;
}

const ArtemisLogo = ({
  size = 'md',
  showText = true,
  variant = 'primary',
  subtitle,
  className = '',
  textClassName = '',
}: ArtemisLogoProps) => {
  const px = SIZES[size];
  const src = variant === 'dark' ? logoDark : logoPrimary;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        alt="ArtemisApp"
        className="shrink-0 object-contain"
        height={px}
        src={src}
        style={{ width: px, height: px }}
        width={px}
      />
      {showText && (
        <div className="min-w-0">
          <p className={`font-semibold leading-tight tracking-tight text-on-surface ${textClassName}`}>
            ArtemisApp
          </p>
          {subtitle && (
            <p className="truncate text-xs text-on-surface-variant">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtemisLogo;
