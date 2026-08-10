import ArtemisLogo from '@/js/components/ArtemisLogo';

type AuthCardProps = {
  children: React.ReactNode;
  showBrand?: boolean;
};

const AuthCard = ({ children, showBrand = true }: AuthCardProps) => (
  <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container px-6 py-8 shadow-xl shadow-black/20 sm:px-8">
    <div className="flex flex-col gap-6">
      {showBrand ? (
        <div className="flex justify-center">
          <ArtemisLogo showText={false} size="xl" />
        </div>
      ) : null}
      {children}
    </div>
  </div>
);

export default AuthCard;
