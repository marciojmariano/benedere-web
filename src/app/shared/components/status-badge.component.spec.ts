import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `<app-status-badge [status]="status" />`,
})
class TestHostComponent {
  status = 'ativo';
}

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should render the badge', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge).toBeTruthy();
  });

  it('should display "Ativo" label for ativo status', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('Ativo');
  });

  it('should apply emerald classes for ativo status', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('bg-emerald-50');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('should display "Cancelado" for cancelado status', () => {
    host.status = 'cancelado';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('Cancelado');
    expect(badge.className).toContain('bg-rose-50');
  });

  it('should display "Em Produção" for em_producao status', () => {
    host.status = 'em_producao';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('Em Produção');
    expect(badge.className).toContain('bg-violet-50');
  });

  it('should fallback to raw status for unknown status', () => {
    host.status = 'desconhecido';
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('desconhecido');
    expect(badge.className).toContain('bg-zinc-50');
  });

  it('should render a dot indicator', () => {
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('span span');
    expect(dot).toBeTruthy();
    expect(dot.className).toContain('rounded-full');
  });

  it.each([
    ['ativo', 'Ativo'],
    ['inativo', 'Inativo'],
    ['rascunho', 'Rascunho'],
    ['aprovado', 'Aprovado'],
    ['em_producao', 'Em Produção'],
    ['entregue', 'Entregue'],
    ['cancelado', 'Cancelado'],
    ['pendente', 'Pendente'],
    ['trial', 'Trial'],
    ['suspenso', 'Suspenso'],
  ])('should display correct label for status "%s"', (status, expectedLabel) => {
    host.status = status;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain(expectedLabel);
  });
});
