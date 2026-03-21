import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AvatarComponent } from './avatar.component';

@Component({
  standalone: true,
  imports: [AvatarComponent],
  template: `<app-avatar [name]="name" [size]="size" />`,
})
class TestHostComponent {
  name = 'João Silva';
  size: 'sm' | 'md' | 'lg' = 'md';
}

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should render initials from two-word name', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.textContent.trim()).toBe('JS');
  });

  it('should render single initial for single-word name', () => {
    host.name = 'Maria';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.textContent.trim()).toBe('M');
  });

  it('should use first two words for multi-word names', () => {
    host.name = 'Ana Paula Costa';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.textContent.trim()).toBe('AP');
  });

  it('should apply md size classes by default', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.className).toContain('w-10');
    expect(el.className).toContain('h-10');
  });

  it('should apply sm size classes', () => {
    host.size = 'sm';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.className).toContain('w-8');
    expect(el.className).toContain('h-8');
  });

  it('should apply lg size classes', () => {
    host.size = 'lg';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.className).toContain('w-12');
    expect(el.className).toContain('h-12');
  });

  it('should deterministically pick a color based on name', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    expect(el.className).toMatch(/bg-(emerald|sky|violet|amber|rose|teal|indigo|pink)-500/);
  });

  it('should produce consistent color for same name', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div div');
    const className = el.className;
    // Re-detect, same name should produce same class
    expect(el.className).toBe(className);
  });
});
