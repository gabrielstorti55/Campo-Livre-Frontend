'use client';

import { useMemo, type ReactNode } from 'react';

import type { ModoAplicacao } from '@/config/modo-aplicacao';
import { ProvedorAdministracaoGlobalApi } from '@/contexts/administracao-global-api';
import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { ProvedorCamposApi } from '@/contexts/campos-api';
import { ProvedorConsentimentosApi } from '@/contexts/consentimentos-api';
import { ProvedorGestaoCamposApi } from '@/contexts/gestao-campos-api';
import { ProvedorCampeonatosApi } from '@/contexts/campeonatos-api';
import { ProvedorGestaoPrefeiturasApi } from '@/contexts/gestao-prefeituras-api';
import { ProvedorMunicipiosApi } from '@/contexts/municipios-api';
import { ProvedorPartidasApi } from '@/contexts/partidas-api';
import { ProvedorPrefeiturasApi } from '@/contexts/prefeituras-api';
import { ProvedorTimesApi } from '@/contexts/times-api';
import { ClienteApi, obterUrlApi } from '@/services/api/cliente-api';
import type { AdministracaoGlobalApi } from '@/services/administracao-global/administracao-global-api';
import { AdministracaoGlobalHttp } from '@/services/administracao-global/administracao-global-http';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';
import { AutenticacaoPrototipo } from '@/services/autenticacao/autenticacao-prototipo';
import type { CamposApi } from '@/services/campos/campos-api';
import { CamposHttp } from '@/services/campos/campos-http';
import { CamposPrototipo } from '@/services/campos/campos-prototipo';
import type { GestaoCamposApi } from '@/services/campos/gestao-campos-api';
import type { ConsentimentosApi } from '@/services/consentimentos/consentimentos-api';
import { ConsentimentosHttp } from '@/services/consentimentos/consentimentos-http';
import type { CampeonatosApi } from '@/services/campeonatos/campeonatos-api';
import { CampeonatosHttp } from '@/services/campeonatos/campeonatos-http';
import { CampeonatosPrototipo } from '@/services/campeonatos/campeonatos-prototipo';
import type { MunicipiosApi } from '@/services/municipios/municipios-api';
import { MunicipiosHttp } from '@/services/municipios/municipios-http';
import { MunicipiosPrototipo } from '@/services/municipios/municipios-prototipo';
import type { PartidasApi } from '@/services/partidas/partidas-api';
import { PartidasHttp } from '@/services/partidas/partidas-http';
import { PartidasPrototipo } from '@/services/partidas/partidas-prototipo';
import { PartidasChaveamentoPrototipo } from '@/services/prototipo/partidas-chaveamento-prototipo';
import type { GestaoPrefeiturasApi } from '@/services/prefeituras/gestao-prefeituras-api';
import type { PrefeiturasApi } from '@/services/prefeituras/prefeituras-api';
import { PrefeiturasHttp } from '@/services/prefeituras/prefeituras-http';
import { PrefeiturasPrototipo } from '@/services/prefeituras/prefeituras-prototipo';
import type { TimesApi } from '@/services/times/times-api';
import { TimesHttp } from '@/services/times/times-http';
import { TimesPrototipo } from '@/services/times/times-prototipo';
import { ProvedorSessao } from '@/stores/sessao';

type ApisAplicacao = {
  autenticacao: AutenticacaoApi;
  times: TimesApi;
  campos: CamposApi;
  gestaoCampos: GestaoCamposApi | null;
  administracaoGlobal: AdministracaoGlobalApi | null;
  consentimentos: ConsentimentosApi | null;
  municipios: MunicipiosApi;
  prefeituras: PrefeiturasApi;
  gestaoPrefeituras: GestaoPrefeiturasApi | null;
  campeonatos: CampeonatosApi;
  partidas: PartidasApi;
};

export function criarApisAplicacao(modo: ModoAplicacao): ApisAplicacao {
  if (modo === 'prototipo') {
    const autenticacao = new AutenticacaoPrototipo();
    const partidasChaveamento = new PartidasChaveamentoPrototipo();
    return {
      autenticacao,
      times: new TimesPrototipo((accessToken) =>
        autenticacao.obterContaAtivaId(accessToken),
      ),
      campos: new CamposPrototipo(),
      gestaoCampos: null,
      administracaoGlobal: null,
      consentimentos: null,
      municipios: new MunicipiosPrototipo(),
      prefeituras: new PrefeiturasPrototipo((accessToken) =>
        autenticacao.obterContaAtivaId(accessToken),
      ),
      gestaoPrefeituras: null,
      campeonatos: new CampeonatosPrototipo(
        (accessToken) => autenticacao.obterContaAtivaId(accessToken),
        partidasChaveamento,
      ),
      partidas: new PartidasPrototipo(
        (accessToken) => autenticacao.obterContaAtivaId(accessToken),
        partidasChaveamento,
      ),
    };
  }

  const cliente = new ClienteApi(obterUrlApi());
  const prefeituras = new PrefeiturasHttp(cliente);
  const campos = new CamposHttp(cliente);
  return {
    autenticacao: new AutenticacaoHttp(cliente),
    times: new TimesHttp(cliente),
    campos,
    gestaoCampos: campos,
    administracaoGlobal: new AdministracaoGlobalHttp(cliente),
    consentimentos: new ConsentimentosHttp(cliente),
    municipios: new MunicipiosHttp(cliente),
    prefeituras,
    gestaoPrefeituras: prefeituras,
    campeonatos: new CampeonatosHttp(cliente),
    partidas: new PartidasHttp(cliente),
  };
}

export function ProvedoresAplicacao({
  children,
  modo,
}: {
  children: ReactNode;
  modo: ModoAplicacao;
}) {
  const apis = useMemo(() => criarApisAplicacao(modo), [modo]);

  return (
    <ProvedorAutenticacaoApi api={apis.autenticacao}>
      <ProvedorAdministracaoGlobalApi api={apis.administracaoGlobal}>
        <ProvedorConsentimentosApi api={apis.consentimentos}>
          <ProvedorTimesApi api={apis.times}>
            <ProvedorMunicipiosApi api={apis.municipios}>
              <ProvedorPrefeiturasApi api={apis.prefeituras}>
                <ProvedorGestaoPrefeiturasApi api={apis.gestaoPrefeituras}>
                  <ProvedorCampeonatosApi api={apis.campeonatos}>
                    <ProvedorPartidasApi api={apis.partidas}>
                      <ProvedorCamposApi api={apis.campos}>
                        <ProvedorGestaoCamposApi api={apis.gestaoCampos}>
                          <ProvedorSessao api={apis.autenticacao} modo={modo}>
                            {children}
                          </ProvedorSessao>
                        </ProvedorGestaoCamposApi>
                      </ProvedorCamposApi>
                    </ProvedorPartidasApi>
                  </ProvedorCampeonatosApi>
                </ProvedorGestaoPrefeiturasApi>
              </ProvedorPrefeiturasApi>
            </ProvedorMunicipiosApi>
          </ProvedorTimesApi>
        </ProvedorConsentimentosApi>
      </ProvedorAdministracaoGlobalApi>
    </ProvedorAutenticacaoApi>
  );
}
