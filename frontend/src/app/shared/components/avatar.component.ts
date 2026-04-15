import { Component, input, computed } from '@angular/core';

const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
];

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div
      class="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      [class]="colorClass() + ' ' + sizeClass()"
    >
      {{ initials() }}
    </div>
  `,
})
export class AvatarComponent {
  name = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');

  initials = computed(() => {
    const parts = (this.name() || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  });

  colorClass = computed(() => {
    const hash = (this.name() || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  });

  sizeClass = computed(() => {
    const map = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return map[this.size()];
  });
}
