'use client';
import { Tabs as UITabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function obterIdAba(panelId: string, tab: string) {
  const segmento = tab
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-');
  return `${panelId}-tab-${segmento}`;
}

export function Abas({
  tabs,
  active,
  onChange,
  panelId,
  mobileHint = false,
}: {
  tabs: readonly string[];
  active: string;
  onChange: (tab: string) => void;
  panelId?: string;
  mobileHint?: boolean;
}) {
  return (
    <UITabs value={active} onValueChange={onChange}>
      <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            id={panelId ? obterIdAba(panelId, tab) : undefined}
            aria-controls={panelId}
            className="shrink-0 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-xs font-semibold text-muted-foreground shadow-none data-[state=active]:border-green-mid data-[state=active]:bg-transparent data-[state=active]:text-green-dark data-[state=active]:shadow-none sm:px-4 sm:text-sm"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {mobileHint ? (
        <p className="mt-2 text-right text-[0.65rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:hidden">
          Deslize para ver mais abas →
        </p>
      ) : null}
    </UITabs>
  );
}
