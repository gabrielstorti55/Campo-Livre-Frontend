import Link from 'next/link';

export function AcoesSegurancaConta() {
  return (
    <section className="mt-7 border-t border-border pt-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        Segurança e acesso
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/minha-conta/alterar-email"
          className="inline-flex border border-border px-4 py-2 text-sm font-semibold text-green-dark hover:border-green-dark"
        >
          Alterar e-mail
        </Link>
        <Link
          href="/minha-conta/seguranca"
          className="inline-flex border border-border px-4 py-2 text-sm font-semibold text-green-dark hover:border-green-dark"
        >
          Alterar senha
        </Link>
        <Link
          href="/minha-conta/desativar"
          className="inline-flex border border-danger/60 px-4 py-2 text-sm font-semibold text-danger hover:border-danger"
        >
          Desativar conta
        </Link>
      </div>
    </section>
  );
}
