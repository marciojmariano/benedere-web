import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-zinc-50">

      <!-- Mobile backdrop -->
      @if (mobileOpen()) {
        <div
          class="fixed inset-0 bg-black/40 z-20 lg:hidden"
          (click)="mobileOpen.set(false)"
        ></div>
      }

      <!-- Sidebar: overlay no mobile, inline no desktop -->
      <div
        class="fixed lg:static top-0 left-0 h-full z-30 flex
               transition-transform duration-300 lg:translate-x-0"
        [class.translate-x-0]="mobileOpen()"
        [class.-translate-x-full]="!mobileOpen()"
      >
        <app-sidebar
          [collapsed]="desktopCollapsed()"
          (collapsedChange)="desktopCollapsed.set($event)"
        />
      </div>

      <!-- Main content -->
      <div class="flex flex-col flex-1 overflow-hidden min-w-0">
        <app-topbar (menuToggle)="mobileOpen.set(!mobileOpen())" />
        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <router-outlet />
        </main>
      </div>

    </div>
  `,
})
export class ShellComponent {
  private router = inject(Router);

  mobileOpen = signal(false);
  desktopCollapsed = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.mobileOpen.set(false));
  }
}
