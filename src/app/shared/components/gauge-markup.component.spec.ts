import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { GaugeMarkupComponent } from './gauge-markup.component';

@Component({
  standalone: true,
  imports: [GaugeMarkupComponent],
  template: `<app-gauge-markup [percentage]="percentage" [size]="size" [label]="label" />`,
})
class TestHostComponent {
  percentage = 45.67;
  size: 'sm' | 'md' | 'lg' = 'md';
  label = 'Markup';
}

describe('GaugeMarkupComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should render an SVG', () => {
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should display rounded percentage', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('45.7%');
  });

  it('should display label', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Markup');
  });

  it('should use md SVG size (120px) by default', () => {
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('120');
    expect(svg.getAttribute('height')).toBe('120');
  });

  it('should use sm SVG size (80px)', () => {
    host.size = 'sm';
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('80');
  });

  it('should use lg SVG size (160px)', () => {
    host.size = 'lg';
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('160');
  });

  it('should use green stroke for low percentage', () => {
    host.percentage = 20;
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('circle');
    const valueCircle = circles[1];
    expect(valueCircle.getAttribute('stroke')).toBe('#10b981');
  });

  it('should use amber stroke for medium percentage', () => {
    host.percentage = 45;
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('circle');
    const valueCircle = circles[1];
    expect(valueCircle.getAttribute('stroke')).toBe('#f59e0b');
  });

  it('should use orange stroke for high percentage', () => {
    host.percentage = 70;
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('circle');
    const valueCircle = circles[1];
    expect(valueCircle.getAttribute('stroke')).toBe('#f97316');
  });

  it('should use red stroke for very high percentage', () => {
    host.percentage = 85;
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('circle');
    const valueCircle = circles[1];
    expect(valueCircle.getAttribute('stroke')).toBe('#ef4444');
  });

  it('should clamp percentage to 0-100 for dash offset', () => {
    host.percentage = 150;
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('circle');
    const valueCircle = circles[1];
    expect(parseFloat(valueCircle.getAttribute('stroke-dashoffset')!)).toBe(0);
  });
});
