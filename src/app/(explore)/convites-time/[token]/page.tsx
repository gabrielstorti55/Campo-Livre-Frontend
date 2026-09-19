import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { TelaResponderConviteTime } from '@/screens/atleta/responder-convite-time';

export default function Page() {
  return (
    <GuardaSessao mensagem="Validando a conta destinatária do convite...">
      <TelaResponderConviteTime />
    </GuardaSessao>
  );
}
