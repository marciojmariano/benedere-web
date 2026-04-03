// src/app/shared/components/icon.component.ts
import { Component, Input, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SVG_ICONS } from '../constants/icons.constant';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg 
      [style.width.px]="size" 
      [style.height.px]="size" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      [class]="className"
      [innerHTML]="safeSvg">
    </svg>
  `
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  @Input() name: string = '';
  @Input() size: number = 18;
  @Input() className: string = '';

  get safeSvg() {
    const iconPath = SVG_ICONS[this.name] || '';
    return this.sanitizer.bypassSecurityTrustHtml(iconPath);
  }
}