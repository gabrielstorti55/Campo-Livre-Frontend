import { obterModoAplicacao } from '@/config/modo-aplicacao';
import { TelaAtletas } from '@/screens/publico/atletas';

export default function Page() {
  return <TelaAtletas prototipo={obterModoAplicacao() === 'prototipo'} />;
}
