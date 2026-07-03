interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState = ({ icon = 'inbox', title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="material-symbols-outlined mb-3 text-5xl text-outline">{icon}</span>
    <p className="font-medium text-on-surface">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>}
  </div>
);

export default EmptyState;
