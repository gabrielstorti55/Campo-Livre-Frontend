import { createBrowserRouter, Navigate } from 'react-router-dom';

import { NotFoundPage } from '@/app/not-found-page';
import {
  AtletaLayout,
  OrganizadorLayout,
  PrefeituraLayout,
  RootLayout,
} from '@/app/layouts';
import { CadastroPage } from '@/features/auth/pages/cadastro-page';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RecuperarSenhaPage } from '@/features/auth/pages/recuperar-senha-page';
import { AtletaCampeonatos } from '@/features/campeonatos/pages/atleta-campeonatos-page';
import { AtletaInicio } from '@/features/dashboard/pages/atleta-inicio-page';
import { AtletaPerfil } from '@/features/perfis/pages/atleta-perfil-page';
import { BuscarTimes } from '@/features/times/pages/buscar-times-page';
import { CampeonatoAtleta } from '@/features/campeonatos/pages/campeonato-atleta-page';
import { CriarTime } from '@/features/times/pages/criar-time-page';
import { GerenciarTime } from '@/features/times/pages/gerenciar-time-page';
import { MeusEventos } from '@/features/campeonatos/pages/meus-eventos-page';
import { AgendarPartidas } from '@/features/partidas/pages/agendar-partidas-page';
import { Chaveamento } from '@/features/campeonatos/pages/chaveamento-page';
import { GerenciarTimes } from '@/features/times/pages/gerenciar-times-page';
import { NovoCampeonato } from '@/features/campeonatos/pages/novo-campeonato-page';
import { OrganizadorCampeonatos } from '@/features/campeonatos/pages/organizador-campeonatos-page';
import { OrganizadorInicio } from '@/features/dashboard/pages/organizador-inicio-page';
import { OrganizadorPerfil } from '@/features/perfis/pages/organizador-perfil-page';
import { Sumula } from '@/features/partidas/pages/sumula-page';
import { VisaoGeral } from '@/features/campeonatos/pages/visao-geral-page';
import { Aprovacoes } from '@/features/prefeitura/pages/aprovacoes-page';
import { Calendario } from '@/features/prefeitura/pages/calendario-page';
import { Campos } from '@/features/prefeitura/pages/campos-page';
import { NovoCampo } from '@/features/prefeitura/pages/novo-campo-page';
import { Organizadores } from '@/features/prefeitura/pages/organizadores-page';
import { Painel } from '@/features/prefeitura/pages/painel-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', Component: LoginPage },
      { path: 'cadastro', Component: CadastroPage },
      { path: 'recuperar-senha', Component: RecuperarSenhaPage },
      {
        path: 'atleta',
        Component: AtletaLayout,
        children: [
          { path: 'inicio', Component: AtletaInicio },
          { path: 'campeonatos', Component: AtletaCampeonatos },
          { path: 'campeonato/:id', Component: CampeonatoAtleta },
          { path: 'meus-eventos', Component: MeusEventos },
          { path: 'perfil', Component: AtletaPerfil },
          { path: 'time/buscar', Component: BuscarTimes },
          { path: 'time/criar', Component: CriarTime },
          { path: 'time/:id', Component: GerenciarTime },
        ],
      },
      {
        path: 'organizador',
        Component: OrganizadorLayout,
        children: [
          { path: 'inicio', Component: OrganizadorInicio },
          { path: 'campeonatos', Component: OrganizadorCampeonatos },
          { path: 'novo', Component: NovoCampeonato },
          { path: 'perfil', Component: OrganizadorPerfil },
          {
            path: 'campeonato/:id',
            children: [
              { index: true, Component: VisaoGeral },
              { path: 'chaveamento', Component: Chaveamento },
              { path: 'partidas', Component: AgendarPartidas },
              { path: 'sumula', Component: Sumula },
              { path: 'times', Component: GerenciarTimes },
            ],
          },
        ],
      },
      {
        path: 'prefeitura',
        Component: PrefeituraLayout,
        children: [
          { path: 'painel', Component: Painel },
          { path: 'organizadores', Component: Organizadores },
          { path: 'calendario', Component: Calendario },
          { path: 'aprovacoes', Component: Aprovacoes },
          { path: 'campos', Component: Campos },
          { path: 'campos/novo', Component: NovoCampo },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
