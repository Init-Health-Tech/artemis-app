import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { ganadoApi, Lote } from '@/js/api/ganado';
import { useToast } from '@/js/components/Toast';

const LoteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [alimentos, setAlimentos] = useState<{ id: number; nombre: string }[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    capacidad: '',
    ubicacion: '',
    tipo_alimento_actual: '',
  });

  useEffect(() => {
    ganadoApi.alimentos().then((res) => {
      const list = res.data.results ?? (res.data as unknown as { id: number; nombre: string }[]);
      setAlimentos(list);
    });
    if (id) {
      ganadoApi.lote(Number(id)).then((res) => {
        const data = res.data;
        setForm({
          nombre: data.nombre,
          capacidad: String(data.capacidad),
          ubicacion: data.ubicacion,
          tipo_alimento_actual: data.tipo_alimento_actual ? String(data.tipo_alimento_actual) : '',
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      capacidad: Number(form.capacidad),
      ubicacion: form.ubicacion,
      tipo_alimento_actual: form.tipo_alimento_actual ? Number(form.tipo_alimento_actual) : null,
    };
    try {
      if (isEdit) {
        await ganadoApi.updateLote(Number(id), payload);
        toast('Lote actualizado');
        navigate(`/lotes/${id}`);
      } else {
        const res = await ganadoApi.createLote(payload);
        toast('Lote creado');
        navigate(`/lotes/${res.data.id}`);
      }
    } catch {
      toast('Error al guardar lote', 'error');
    }
  };

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">{isEdit ? 'Editar lote' : 'Nuevo lote / potrero'}</h2>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Nombre</span>
        <input
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Capacidad (animales)</span>
        <input
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          required
          type="number"
          value={form.capacidad}
          onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Ubicación</span>
        <input
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Alimento asignado</span>
        <select
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          value={form.tipo_alimento_actual}
          onChange={(e) => setForm({ ...form, tipo_alimento_actual: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {alimentos.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </label>
      <button className="rounded bg-primary-container px-6 py-2.5 font-semibold text-on-primary-container" type="submit">
        Guardar
      </button>
    </form>
  );
};

export default LoteForm;
