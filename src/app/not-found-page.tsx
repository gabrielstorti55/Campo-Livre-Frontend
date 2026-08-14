import { StatusPage } from '@/shared/components/status-page';

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Página não encontrada"
      description="A página que você está procurando não existe ou foi movida."
    />
  );
}
