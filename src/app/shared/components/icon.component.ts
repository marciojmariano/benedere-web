import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SVG_ICONS } from '../constants/icons.constant';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span style="display: contents" [innerHTML]="safeSvg()"></span>`,
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  name = input.required<string>();
  size = input(18);
  className = input('');

  safeSvg = computed(() => {
    const iconPath = SVG_ICONS[this.name()] || '';
    const cls = this.className();
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size()}" height="${this.size()}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${cls ? ` class="${cls}"` : ''}>${iconPath}</svg>`
    );
  });
}