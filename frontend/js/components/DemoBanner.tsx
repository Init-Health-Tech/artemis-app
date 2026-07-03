import { useState } from 'react';

import logoSrc from '@/assets/images/brand/artemis-logo.png';

const DemoBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <img alt="" className="mt-0.5 h-8 w-8 shrink-0 object-contain" src={logoSrc} />
        <div className="min-w-0">
          <p className="font-semibold text-primary">Modo Demo — ArtemisApp</p>
          <p className="mt-1 text-on-surface-variant">
          Prueba el flujo RFID con tag <code className="text-primary">RFID-1001</code> o un tag nuevo como{' '}
          <code className="text-primary">RFID-DEMO-NEW</code>. Los datos se pueden resetear con{' '}
          <code className="text-xs">seed_ganado --force</code>.
          </p>
        </div>
      </div>
      <button
        className="shrink-0 text-on-surface-variant hover:text-on-surface"
        type="button"
        onClick={() => setVisible(false)}
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
};

export default DemoBanner;
