import { obterModoAplicacao } from '@/config/modo-aplicacao';
import { TelaPerfilAtleta } from '@/screens/publico/perfil-atleta';

export default function Page() {
  return <TelaPerfilAtleta prototipo={obterModoAplicacao() === 'prototipo'} />;
}
