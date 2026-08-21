'use client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function BarraBusca({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-md border-border/80 bg-card pr-4 pl-10 text-sm shadow-none focus-visible:border-green-mid"
      />
    </div>
  );
}
