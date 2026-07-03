import { createBrowserRouter } from 'react-router';

import AppLayout from '@/js/components/AppLayout';
import AnimalDetail from '@/js/pages/AnimalDetail';
import AnimalForm from '@/js/pages/AnimalForm';
import Animales from '@/js/pages/Animales';
import Dashboard from '@/js/pages/Dashboard';
import Estados from '@/js/pages/Estados';
import Inventario from '@/js/pages/Inventario';
import Login from '@/js/pages/Login';
import LoteDetail from '@/js/pages/LoteDetail';
import LoteForm from '@/js/pages/LoteForm';
import Lotes from '@/js/pages/Lotes';
import RfidScan from '@/js/pages/RfidScan';
import Trazabilidad from '@/js/pages/Trazabilidad';

const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'animales', Component: Animales },
      { path: 'animales/nuevo', Component: AnimalForm },
      { path: 'animales/:id', Component: AnimalDetail },
      { path: 'animales/:id/trazabilidad', Component: Trazabilidad },
      { path: 'animales/:id/editar', Component: AnimalForm },
      { path: 'estados', Component: Estados },
      { path: 'rfid', Component: RfidScan },
      { path: 'lotes', Component: Lotes },
      { path: 'lotes/nuevo', Component: LoteForm },
      { path: 'lotes/:id', Component: LoteDetail },
      { path: 'lotes/:id/editar', Component: LoteForm },
      { path: 'inventario', Component: Inventario },
    ],
  },
]);

export default router;
