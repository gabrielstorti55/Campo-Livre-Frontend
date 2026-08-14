import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4 w-full',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium capitalize',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-9 flex-1 font-normal text-[0.8rem] text-center',
        week: 'flex w-full mt-2',
        day: 'relative flex-1 h-9 p-0 text-center text-sm [&:has([aria-selected])]:bg-accent',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-full p-0 font-normal aria-selected:opacity-100',
        ),
        selected:
          'bg-green-mid text-white hover:bg-green-mid hover:text-white focus:bg-green-mid focus:text-white rounded-md',
        today: 'bg-accent text-accent-foreground rounded-md',
        outside:
          'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === 'left' ? (
            <ChevronLeft {...chevronProps} />
          ) : (
            <ChevronRight {...chevronProps} />
          ),
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
