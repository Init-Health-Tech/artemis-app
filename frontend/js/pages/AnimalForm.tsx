import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { ganadoApi, Lote } from '@/js/api/ganado';
import AnimalPhoto from '@/js/components/AnimalPhoto';

const AnimalForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    rfid_tag: searchParams.get('rfid') ?? '',
    numero_interno: '',
    especie: 'bovino',
    raza: '',
    sexo: 'macho',
    fecha_nacimiento: '',
    peso_actual: '',
    lote: '',
    estado: 'activo',
    fecha_registro: new Date().toISOString().split('T')[0],
    proxima_revision: '',
  });

  useEffect(() => {
    ganadoApi.lotes().then((res) => setLotes(res.data.results ?? res.data as unknown as Lote[]));
    if (id) {
      ganadoApi.animal(Number(id)).then((res) => {
        const a = res.data;
        setForm({
          rfid_tag: a.rfid_tag,
          numero_interno: a.numero_interno,
          especie: a.especie,
          raza: a.raza,
          sexo: a.sexo,
          fecha_nacimiento: a.fecha_nacimiento ?? '',
          peso_actual: a.peso_actual ?? '',
          lote: a.lote ? String(a.lote) : '',
          estado: a.estado,
          fecha_registro: a.fecha_registro,
          proxima_revision: a.proxima_revision ?? '',
        });
        setExistingFotoUrl(a.foto_url ?? null);
      });
    }
  }, [id]);

  const handleFotoChange = (file: File | null) => {
    setFotoFile(file);
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    } else {
      setFotoPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'lote') return;
      if (value !== '') payload.append(key, value);
    });
    if (form.lote) payload.append('lote', form.lote);
    if (fotoFile) payload.append('foto', fotoFile);

    if (isEdit) {
      await ganadoApi.updateAnimal(Number(id), payload);
      navigate(`/animales/${id}`);
    } else {
      const res = await ganadoApi.createAnimal(payload);
      navigate(`/animales/${res.data.id}`);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <label className="block">
      <span className="mb-1 block text-sm text-on-surface-variant">{label}</span>
      <input
        className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">{isEdit ? 'Editar animal' : 'Nuevo animal'}</h2>

      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Foto</span>
        <div className="flex items-center gap-4">
          <AnimalPhoto
            fotoUrl={fotoPreview ?? existingFotoUrl}
            numeroInterno={form.numero_interno || 'Nuevo'}
            size="md"
          />
          <input
            accept="image/*"
            className="text-sm"
            type="file"
            onChange={(e) => handleFotoChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </label>

      {field('rfid_tag', 'Tag RFID')}
      {field('numero_interno', 'Número interno')}
      {field('raza', 'Raza')}
      {field('peso_actual', 'Peso actual (kg)', 'number')}
      {field('fecha_nacimiento', 'Fecha nacimiento', 'date')}
      {field('fecha_registro', 'Fecha registro', 'date')}
      {field('proxima_revision', 'Próxima revisión', 'date')}
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Sexo</span>
        <select
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          value={form.sexo}
          onChange={(e) => setForm({ ...form, sexo: e.target.value })}
        >
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Lote</span>
        <select
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          value={form.lote}
          onChange={(e) => setForm({ ...form, lote: e.target.value })}
        >
          <option value="">Sin lote</option>
          {lotes.map((l) => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-on-surface-variant">Estado</span>
        <select
          className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="cuarentena">Cuarentena</option>
          <option value="vendido">Vendido</option>
          <option value="muerto">Muerto</option>
        </select>
      </label>
      <button
        className="rounded bg-primary-container px-6 py-2.5 font-semibold text-on-primary-container"
        type="submit"
      >
        Guardar
      </button>
    </form>
  );
};

export default AnimalForm;
