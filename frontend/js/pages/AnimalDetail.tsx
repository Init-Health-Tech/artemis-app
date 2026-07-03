import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Animal, EventoAnimal, ganadoApi } from '@/js/api/ganado';
import AnimalPhoto from '@/js/components/AnimalPhoto';
import { useToast } from '@/js/components/Toast';
import WeightSparkline from '@/js/components/WeightSparkline';
import { EVENTO_TIPOS } from '@/js/constants/labels';

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [pesajes, setPesajes] = useState<{ fecha: string; peso: number }[]>([]);
  const [evento, setEvento] = useState({
    tipo: 'revision',
    descripcion: '',
    valor_numerico: '',
    severidad: 'moderada',
  });

  const load = () => {
    if (!id) return;
    const animalId = Number(id);
    ganadoApi.animal(animalId).then((res) => setAnimal(res.data));
    ganadoApi.pesajes(animalId).then((res) => setPesajes(res.data));
  };

  useEffect(() => { load(); }, [id]);

  const handleEvento = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await ganadoApi.addEvento(Number(id), {
        tipo: evento.tipo,
        descripcion: evento.descripcion,
        valor_numerico: evento.valor_numerico || null,
        severidad: evento.tipo === 'enfermedad' ? evento.severidad : undefined,
        fecha: new Date().toISOString(),
      } as Partial<EventoAnimal>);
      const msg =
        evento.tipo === 'pesaje'
          ? `Pesaje registrado: ${evento.valor_numerico} kg`
          : evento.tipo === 'enfermedad' && evento.severidad === 'grave'
            ? 'Enfermedad grave registrada — animal en cuarentena'
            : 'Evento registrado correctamente';
      toast(msg);
      setEvento({ tipo: 'revision', descripcion: '', valor_numerico: '', severidad: 'moderada' });
      load();
    } catch {
      toast('Error al registrar evento', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('¿Eliminar este animal?')) return;
    try {
      await ganadoApi.deleteAnimal(Number(id));
      toast('Animal eliminado');
      navigate('/animales');
    } catch {
      toast('No se pudo eliminar', 'error');
    }
  };

  if (!animal) return <p className="text-on-surface-variant">Cargando ficha...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <AnimalPhoto fotoUrl={animal.foto_url} numeroInterno={animal.numero_interno} size="lg" />
          <div>
            <Link className="text-sm text-on-surface-variant hover:text-primary" to="/animales">← Animales</Link>
            <h2 className="mt-1 text-2xl font-semibold">{animal.numero_interno}</h2>
            <p className="font-mono text-sm text-on-surface-variant">{animal.rfid_tag}</p>
            {animal.proxima_revision && (
              <p className="mt-1 text-xs text-tertiary">
                Próxima revisión: {animal.proxima_revision}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2">
          <Link
            className="min-h-[44px] rounded border border-tertiary/40 px-3 py-2 text-sm text-tertiary hover:bg-tertiary/10"
            to={`/estados?animal_id=${id}`}
          >
            Cambiar estado
          </Link>
          <Link
            className="min-h-[44px] rounded border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10"
            to={`/animales/${id}/trazabilidad`}
          >
            Ver trazabilidad completa
          </Link>
          <Link
            className="min-h-[44px] rounded border border-outline-variant px-3 py-2 text-sm hover:bg-surface-container-high"
            to={`/animales/${id}/editar`}
          >
            Editar
          </Link>
          <button
            className="min-h-[44px] rounded border border-error-container px-3 py-2 text-sm text-error hover:bg-error-container/20"
            type="button"
            onClick={handleDelete}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ['Raza', animal.raza],
          ['Sexo', animal.sexo === 'macho' ? 'Macho' : 'Hembra'],
          ['Peso actual', animal.peso_actual ? `${animal.peso_actual} kg` : '—'],
          ['Lote', animal.lote_nombre ?? '—'],
          ['Estado', animal.estado_display ?? animal.estado],
          ['Especie', animal.especie === 'bovino' ? 'Bovino' : 'Otro'],
          ['Nacimiento', animal.fecha_nacimiento ?? '—'],
          ['Registro', animal.fecha_registro],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container p-4">
            <p className="text-xs uppercase text-on-surface-variant">{label}</p>
            <p className="mt-1 font-medium capitalize">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-outline-variant bg-surface-container p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Tendencia de peso
        </h3>
        <WeightSparkline data={pesajes} height={100} />
      </section>

      <form
        className="rounded-lg border border-outline-variant bg-surface-container p-5"
        onSubmit={handleEvento}
      >
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Registrar evento rápido
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
            value={evento.tipo}
            onChange={(e) => setEvento({ ...evento, tipo: e.target.value })}
          >
            {EVENTO_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {evento.tipo === 'enfermedad' && (
            <select
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              value={evento.severidad}
              onChange={(e) => setEvento({ ...evento, severidad: e.target.value })}
            >
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave (cuarentena)</option>
            </select>
          )}
          <input
            className="min-w-[200px] flex-1 rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
            placeholder="Descripción (ej. Vacuna clostridial)"
            value={evento.descripcion}
            onChange={(e) => setEvento({ ...evento, descripcion: e.target.value })}
          />
          <input
            className="w-28 rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
            placeholder="Peso (kg)"
            type="number"
            value={evento.valor_numerico}
            onChange={(e) => setEvento({ ...evento, valor_numerico: e.target.value })}
          />
          <button
            className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
            type="submit"
          >
            Guardar
          </button>
        </div>
        {evento.tipo === 'pesaje' && (
          <p className="mt-2 text-xs text-on-surface-variant">
            El peso actual del animal se actualizará automáticamente.
          </p>
        )}
      </form>
    </div>
  );
};

export default AnimalDetail;
