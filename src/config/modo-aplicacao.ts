export type ModoAplicacao = 'integrado' | 'prototipo';

type AmbienteModoAplicacao = {
  nodeEnv: string | undefined;
  modoSolicitado: string | undefined;
};

export function resolverModoAplicacao({
  nodeEnv,
  modoSolicitado,
}: AmbienteModoAplicacao): ModoAplicacao {
  if (nodeEnv === 'production') return 'integrado';
  return modoSolicitado === 'prototipo' ? 'prototipo' : 'integrado';
}

export function obterModoAplicacao(): ModoAplicacao {
  return resolverModoAplicacao({
    nodeEnv: process.env.NODE_ENV,
    modoSolicitado: process.env['NEXT_PUBLIC_APP_MODE'],
  });
}
