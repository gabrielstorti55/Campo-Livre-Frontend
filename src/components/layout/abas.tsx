'use client';
import { Tabs as UITabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Abas({
  tabs,
  active,
  onChange,
  panelId,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  panelId?: string;
}) {
  return (
    <UITabs value={active} onValueChange={onChange}>
      <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            id={panelId ? `${panelId}-tab-${tab}` : undefined}
            aria-controls={panelId}
            className="shrink-0 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-xs font-semibold text-muted-foreground shadow-none data-[state=active]:border-green-mid data-[state=active]:bg-transparent data-[state=active]:text-green-dark data-[state=active]:shadow-none sm:px-4 sm:text-sm"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </UITabs>
  );
}
