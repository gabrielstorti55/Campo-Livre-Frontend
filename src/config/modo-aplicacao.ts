export type ModoAplicacao = 'hibrido' | 'integrado' | 'prototipo';

type AmbienteModoAplicacao = {
  nodeEnv: string | undefined;
  modoSolicitado: string | undefined;
};

export function resolverModoAplicacao({
  nodeEnv,
  modoSolicitado,
}: AmbienteModoAplicacao): ModoAplicacao {
  if (modoSolicitado === 'hibrido') return 'hibrido';
  if (nodeEnv === 'production') return 'integrado';
  if (modoSolicitado === 'prototipo') return 'prototipo';
  if (modoSolicitado === 'integrado') return 'integrado';
  if (modoSolicitado !== undefined) return 'integrado';
  return 'hibrido';
}

export function obterModoAplicacao(): ModoAplicacao {
  return resolverModoAplicacao({
    nodeEnv: process.env.NODE_ENV,
    modoSolicitado: process.env['NEXT_PUBLIC_APP_MODE'],
  });
}
