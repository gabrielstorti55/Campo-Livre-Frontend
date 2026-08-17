import { createBrowserRouter, redirect } from 'react-router-dom';

import { ExploreLayout } from '@/app/explore-layout';
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
import { CampeonatoDetailPage } from '@/features/campeonatos/pages/campeonato-detail-page';
import { CampeonatosPage } from '@/features/campeonatos/pages/campeonatos-page';
import { AgendarPartidas } from '@/features/partidas/pages/agendar-partidas-page';
import { Chaveamento } from '@/features/campeonatos/pages/chaveamento-page';
import { GerenciarTimes } from '@/features/times/pages/gerenciar-times-page';
import { NovoCampeonato } from '@/features/campeonatos/pages/novo-campeonato-page';
import { OrganizadorCampeonatos } from '@/features/campeonatos/pages/organizador-campeonatos-page';
import { Sumula } from '@/features/partidas/pages/sumula-page';
import { VisaoGeral } from '@/features/campeonatos/pages/visao-geral-page';
import { AtletaInicio } from '@/features/dashboard/pages/atleta-inicio-page';
import { OrganizadorInicio } from '@/features/dashboard/pages/organizador-inicio-page';
import { AtletaPerfil } from '@/features/perfis/pages/atleta-perfil-page';
import { OrganizadorPerfil } from '@/features/perfis/pages/organizador-perfil-page';
import { Aprovacoes } from '@/features/prefeitura/pages/aprovacoes-page';
import { Calendario } from '@/features/prefeitura/pages/calendario-page';
import { Campos } from '@/features/prefeitura/pages/campos-page';
import { NovoCampo } from '@/features/prefeitura/pages/novo-campo-page';
import { Organizadores } from '@/features/prefeitura/pages/organizadores-page';
import { Painel } from '@/features/prefeitura/pages/painel-page';
import { HomePage } from '@/features/home/pages/home-page';
import { PartidaDetailPage } from '@/features/partidas/pages/partida-detail-page';
import { PartidasPage } from '@/features/partidas/pages/partidas-page';
import { BuscarTimes } from '@/features/times/pages/buscar-times-page';
import { CriarTime } from '@/features/times/pages/criar-time-page';
import { GerenciarTime } from '@/features/times/pages/gerenciar-time-page';
import { TimeDetailPage } from '@/features/times/pages/time-detail-page';
import { TimesPage } from '@/features/times/pages/times-page';
import { MeusEventos } from '@/features/campeonatos/pages/meus-eventos-page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        Component: ExploreLayout,
        children: [
          { index: true, Component: HomePage },
          { path: 'campeonatos', Component: CampeonatosPage },
          {
            path: 'campeonatos/:id',
            Component: CampeonatoDetailPage,
          },
          { path: 'times', Component: TimesPage },
          { path: 'times/:id', Component: TimeDetailPage },
          { path: 'partidas', Component: PartidasPage },
          { path: 'partidas/:id', Component: PartidaDetailPage },
        ],
      },
      { path: 'login', Component: LoginPage },
      { path: 'cadastro', Component: CadastroPage },
      { path: 'recuperar-senha', Component: RecuperarSenhaPage },
      {
        path: 'atleta',
        Component: AtletaLayout,
        children: [
          { path: 'inicio', Component: AtletaInicio },
          { path: 'campeonatos', Component: AtletaCampeonatos },
          {
            path: 'campeonato/:id',
            loader: ({ params }) =>
              redirect(`/campeonatos/${params['id'] ?? ''}`),
          },
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
