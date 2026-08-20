'use client';

import type { LucideIcon } from 'lucide-react';

import { LinhaMetadados } from '@/components/layout/item-lista';

type MetaItem = { icon?: LucideIcon; label: string };

export function InformacoesCampeonato({
  cidade,
  times,
  modalidade,
  formato,
  icon,
}: {
  cidade?: string;
  times?: number;
  modalidade?: string;
  formato?: string;
  icon?: LucideIcon;
}) {
  const items: MetaItem[] = [];

  if (cidade) items.push({ ...(icon ? { icon } : {}), label: cidade });
  if (typeof times === 'number') items.push({ label: `${times} times` });
  if (modalidade) items.push({ label: modalidade });
  if (formato) items.push({ label: formato });

  return <LinhaMetadados items={items} />;
}
