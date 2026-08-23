import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { TelaMinhaArea } from '@/screens/conta/minha-area';

export default function Page() {
  return (
    <GuardaSessao mensagem="Carregando sua conta...">
      <TelaMinhaArea />
    </GuardaSessao>
  );
}
