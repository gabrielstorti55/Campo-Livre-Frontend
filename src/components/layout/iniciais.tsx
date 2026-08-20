import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/utils/classes';

export function Iniciais({
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
    .map((word) => word[0])
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
