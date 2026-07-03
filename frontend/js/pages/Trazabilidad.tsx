import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { Animal, ganadoApi } from '@/js/api/ganado';
import TraceabilityTimeline, { TimelineItem } from '@/js/components/TraceabilityTimeline';

const Trazabilidad = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    if (id) {
      ganadoApi.trazabilidad(Number(id)).then((res) => {
        setAnimal(res.data.animal);
        setTimeline(res.data.timeline);
      });
    }
  }, [id]);

  if (!animal) return <p className="text-on-surface-variant">Cargando trazabilidad...</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-on-surface-variant hover:text-primary" to={`/animales/${id}`}>
          ← Ficha del animal
        </Link>
        <h2 className="mt-1 text-2xl font-semibold">Trazabilidad — {animal.numero_interno}</h2>
        <p className="font-mono text-sm text-on-surface-variant">{animal.rfid_tag}</p>
      </div>

      <section className="rounded-lg border border-outline-variant bg-surface-container p-6">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Historial completo ({timeline.length} eventos)
        </h3>
        <TraceabilityTimeline items={timeline} />
      </section>
    </div>
  );
};

export default Trazabilidad;
