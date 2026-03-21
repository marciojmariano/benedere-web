import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { KpiCardComponent } from './kpi-card.component';

@Component({
  standalone: true,
  imports: [KpiCardComponent],
  template: `<app-kpi-card [icon]="icon" [value]="value" [label]="label" [delta]="delta" [color]="color" />`,
})
class TestHostComponent {
  icon = 'pi pi-users';
  value: string | number = 42;
  label = 'Clientes';
  delta: number | null = null;
  color: 'emerald' | 'sky' | 'amber' | 'rose' | 'violet' = 'emerald';
}

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should display the value', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('42');
  });

  it('should display the label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Clientes');
  });

  it('should not show delta when null', () => {
    fixture.detectChanges();
    const deltaEl = fixture.nativeElement.querySelector('.ml-auto');
    expect(deltaEl).toBeNull();
  });

  it('should show positive delta with + prefix', () => {
    host.delta = 12;
    fixture.detectChanges();
    const deltaEl = fixture.nativeElement.querySelector('.ml-auto');
    expect(deltaEl).toBeTruthy();
    expect(deltaEl.textContent).toContain('+12%');
    expect(deltaEl.className).toContain('bg-emerald-50');
  });

  it('should show negative delta without + prefix', () => {
    host.delta = -5;
    fixture.detectChanges();
    const deltaEl = fixture.nativeElement.querySelector('.ml-auto');
    expect(deltaEl.textContent).toContain('-5%');
    expect(deltaEl.className).toContain('bg-rose-50');
  });

  it('should accept string value', () => {
    host.value = 'R$ 1.234';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('R$ 1.234');
  });
});
