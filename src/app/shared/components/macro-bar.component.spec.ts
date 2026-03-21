import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MacroBarComponent } from './macro-bar.component';

@Component({
  standalone: true,
  imports: [MacroBarComponent],
  template: `<app-macro-bar [label]="label" [value]="value" [max]="max" [unit]="unit" [color]="color" />`,
})
class TestHostComponent {
  label = 'Proteína';
  value = 25;
  max = 100;
  unit = 'g';
  color: 'rose' | 'amber' | 'yellow' | 'emerald' | 'sky' | 'violet' = 'emerald';
}

describe('MacroBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should display the label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Proteína');
  });

  it('should display the value with unit', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('25g');
  });

  it('should calculate correct percentage width', () => {
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.h-full');
    expect(bar.style.width).toBe('25%');
  });

  it('should cap percentage at 100%', () => {
    host.value = 150;
    host.max = 100;
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.h-full');
    expect(bar.style.width).toBe('100%');
  });

  it('should apply color class', () => {
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.h-full');
    expect(bar.className).toContain('bg-emerald-400');
  });

  it('should apply rose color when specified', () => {
    host.color = 'rose';
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.h-full');
    expect(bar.className).toContain('bg-rose-400');
  });

  it('should handle zero value', () => {
    host.value = 0;
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector('.h-full');
    expect(bar.style.width).toBe('0%');
  });
});
