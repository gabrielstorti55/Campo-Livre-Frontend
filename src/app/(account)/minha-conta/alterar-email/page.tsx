import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { TelaAlterarEmail } from '@/screens/conta/alterar-email';

export default function Page() {
  return (
    <GuardaSessao mensagem="Carregando os dados da conta...">
      <TelaAlterarEmail />
    </GuardaSessao>
  );
}
