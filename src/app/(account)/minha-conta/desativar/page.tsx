import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { TelaDesativarConta } from '@/screens/conta/desativar-conta';

export default function Page() {
  return (
    <GuardaSessao mensagem="Validando sua conta...">
      <TelaDesativarConta />
    </GuardaSessao>
  );
}
