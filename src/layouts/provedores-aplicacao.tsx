'use client';

import { useMemo, type ReactNode } from 'react';

import type { ModoAplicacao } from '@/config/modo-aplicacao';
import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { ProvedorCamposApi } from '@/contexts/campos-api';
import { ProvedorTimesApi } from '@/contexts/times-api';
import { ClienteApi, obterUrlApi } from '@/services/api/cliente-api';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';
import { AutenticacaoPrototipo } from '@/services/autenticacao/autenticacao-prototipo';
import type { CamposApi } from '@/services/campos/campos-api';
import { CamposHttp } from '@/services/campos/campos-http';
import { CamposPrototipo } from '@/services/campos/campos-prototipo';
import type { TimesApi } from '@/services/times/times-api';
import { TimesHttp } from '@/services/times/times-http';
import { TimesPrototipo } from '@/services/times/times-prototipo';
import { ProvedorSessao } from '@/stores/sessao';

type ApisAplicacao = {
  autenticacao: AutenticacaoApi;
  times: TimesApi;
  campos: CamposApi;
};

export function criarApisAplicacao(modo: ModoAplicacao): ApisAplicacao {
  if (modo === 'prototipo') {
    const autenticacao = new AutenticacaoPrototipo();
    return {
      autenticacao,
      times: new TimesPrototipo((accessToken) =>
        autenticacao.obterContaAtivaId(accessToken),
      ),
      campos: new CamposPrototipo(),
    };
  }

  const cliente = new ClienteApi(obterUrlApi());
  return {
    autenticacao: new AutenticacaoHttp(cliente),
    times: new TimesHttp(cliente),
    campos: new CamposHttp(cliente),
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
      <ProvedorTimesApi api={apis.times}>
        <ProvedorCamposApi api={apis.campos}>
          <ProvedorSessao api={apis.autenticacao} modo={modo}>
            {children}
          </ProvedorSessao>
        </ProvedorCamposApi>
      </ProvedorTimesApi>
    </ProvedorAutenticacaoApi>
  );
}
