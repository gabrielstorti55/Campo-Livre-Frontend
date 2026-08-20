'use client';

import { Search } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card as UICard } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import {
  Tabs as UITabs,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

export function Initials({
  name,
  className,
  tone = 'green',
}: {
  name: string;
  className?: string;
  tone?: 'green' | 'navy' | 'light';
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const tones = {
    green: 'bg-green-mid',
    navy: 'bg-navy-mid',
    light: 'bg-green-light',
  };
  return (
    <Avatar className={cn('shrink-0', className ?? 'h-10 w-10 text-sm')}>
      <AvatarFallback
        className={cn('font-display font-semibold text-white', tones[tone])}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <UICard
      className={cn(
        'rounded-md border-border/80 bg-white p-4 shadow-none',
        className,
      )}
    >
      {children}
    </UICard>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'green',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'green' | 'navy';
}) {
  return (
    <div
      className={cn(
        'border-t-2 bg-transparent pt-4',
        tone === 'navy' ? 'border-navy-mid/35' : 'border-green-mid/35',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-bold',
          tone === 'navy' ? 'text-navy-dark' : 'text-green-dark',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="pb-2">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <Separator className="mt-5" />
    </header>
  );
}

export function SearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border-border/80 bg-white pr-4 pl-10 text-sm shadow-none focus-visible:border-green-mid"
      />
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="block space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="font-display text-sm font-medium text-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
  panelId,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
  panelId?: string;
}) {
  return (
    <UITabs value={active} onValueChange={onChange}>
      <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            id={panelId ? `${panelId}-tab-${t}` : undefined}
            aria-controls={panelId}
            className="shrink-0 rounded-none border-b-2 border-transparent px-2.5 py-2.5 text-xs font-semibold text-muted-foreground shadow-none data-[state=active]:border-green-mid data-[state=active]:bg-transparent data-[state=active]:text-green-dark data-[state=active]:shadow-none sm:px-4 sm:text-sm"
          >
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
    </UITabs>
  );
}

export function FilterPills({
  options,
  value,
  onChange,
  variant = 'outline',
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'outline' | 'solid';
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => nextValue && onChange(nextValue)}
      aria-label="Filtros"
      variant="outline"
      className="flex-wrap justify-start gap-2"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className={cn(
            'h-auto rounded-md px-3 py-1.5 text-xs font-semibold shadow-none',
            value === option
              ? variant === 'solid'
                ? 'border-green-dark bg-green-dark text-white hover:bg-green-dark hover:text-white'
                : 'border-green-mid bg-green-pale text-green-dark hover:bg-green-pale hover:text-green-dark'
              : 'border-border bg-white text-muted-foreground hover:bg-muted',
          )}
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function Section({
  title,
  children,
  className,
  id,
  role,
  labelledBy,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
  role?: 'tabpanel';
  labelledBy?: string;
}) {
  const titleId = useId();

  return (
    <section
      id={id}
      role={role}
      aria-labelledby={labelledBy ?? titleId}
      className={cn('space-y-4', className)}
    >
      <h2
        id={titleId}
        className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StatGrid({
  items,
  tone = 'green',
  columns = 4,
  className,
}: {
  items: { label: string; value: ReactNode; hint?: string }[];
  tone?: 'green' | 'navy';
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={tone}
          {...(item.hint ? { hint: item.hint } : {})}
        />
      ))}
    </div>
  );
}

export function GroupLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-display text-xs font-bold tracking-wide text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function FormCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('max-w-2xl space-y-4', className)}>{children}</Card>
  );
}

export function Pill({
  children,
  shape = 'rounded',
  className,
}: {
  children: ReactNode;
  shape?: 'rounded' | 'full';
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        'shrink-0 border-0 bg-green-pale px-3 py-1 font-display font-semibold text-green-dark hover:bg-green-pale',
        shape === 'full'
          ? 'rounded-full text-xs'
          : 'rounded-lg text-sm font-bold',
        className,
      )}
    >
      {children}
    </Badge>
  );
}
