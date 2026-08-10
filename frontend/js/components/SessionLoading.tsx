const SessionLoading = ({ message = 'Comprobando sesión…' }: { message?: string }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-8 text-on-surface-variant">
    <div
      aria-hidden
      className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
    />
    <p className="text-sm">{message}</p>
  </div>
);

export default SessionLoading;
