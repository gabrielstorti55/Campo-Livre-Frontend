import Link from 'next/link';

export function LinkReativarConta() {
  return (
    <Link
      href="/reativar-conta"
      className="mt-3 block text-sm font-medium text-muted-foreground underline-offset-4 hover:text-green-dark hover:underline"
    >
      Reativar minha conta
    </Link>
  );
}
