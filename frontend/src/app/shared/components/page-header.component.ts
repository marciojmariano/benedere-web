import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="min-w-0">
        <h1 class="text-xl md:text-2xl font-bold text-zinc-800 truncate">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-sm text-zinc-400 mt-0.5">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input('');
}
