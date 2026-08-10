type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => (
  <div
    className="grid min-h-[100dvh] place-items-center bg-background px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    style={{
      backgroundImage:
        'radial-gradient(circle at 1px 1px, rgba(147,214,149,0.08) 1px, transparent 0)',
      backgroundSize: '20px 20px',
    }}
  >
    {children}
  </div>
);

export default AuthLayout;
