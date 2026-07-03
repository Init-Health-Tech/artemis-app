interface AnimalPhotoProps {
  fotoUrl?: string | null;
  numeroInterno: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-40 w-full max-w-full sm:max-w-xs',
};

const AnimalPhoto = ({ fotoUrl, numeroInterno, size = 'md', className = '' }: AnimalPhotoProps) => {
  if (fotoUrl) {
    return (
      <img
        alt={numeroInterno}
        className={`rounded-lg object-cover ${sizes[size]} ${className}`}
        src={fotoUrl}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant ${sizes[size]} ${className}`}
    >
      <span className={`material-symbols-outlined ${size === 'sm' ? 'text-[18px]' : 'text-3xl'}`}>
        pets
      </span>
    </div>
  );
};

export default AnimalPhoto;
