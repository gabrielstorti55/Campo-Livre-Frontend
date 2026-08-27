import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { TelaAlterarSenha } from '@/screens/conta/alterar-senha';

export default function Page() {
  return (
    <GuardaSessao mensagem="Carregando a segurança da conta...">
      <TelaAlterarSenha />
    </GuardaSessao>
  );
}
