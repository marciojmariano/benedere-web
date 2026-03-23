import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ClienteDetailDrawerComponent } from './cliente-detail-drawer.component';
import { Cliente } from '../../core/models/index';

const clienteBase: Cliente = {
  id: '1',
  nome: 'Ana Souza',
  email: 'ana@email.com',
  telefone: '11999999999',
  endereco: 'Rua das Flores, 10',
  observacoes: 'Cliente VIP',
  ativo: true,
  nutricionista_id: 'nut-1',
  markup_id_padrao: 'mkp-1',
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

@Component({
  standalone: true,
  imports: [ClienteDetailDrawerComponent],
  template: `
    <app-cliente-detail-drawer
      [visible]="visible()"
      [cliente]="cliente()"
      (visibleChange)="onVisibleChange($event)"
      (editar)="onEditar($event)"
    />
  `,
})
class TestHostComponent {
  visible = signal(false);
  cliente = signal<Cliente | null>(null);
  lastVisibleChange: boolean | null = null;
  lastEditar: Cliente | null = null;

  onVisibleChange(v: boolean) { this.lastVisibleChange = v; }
  onEditar(c: Cliente) { this.lastEditar = c; }
}

describe('ClienteDetailDrawerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(host).toBeTruthy();
  });

  it('should not render cliente content when cliente is null', () => {
    host.visible.set(true);
    host.cliente.set(null);
    fixture.detectChanges();
    const nome = fixture.nativeElement.querySelector('h3');
    expect(nome).toBeNull();
  });

  it('should render nome do cliente no header', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const h3 = fixture.nativeElement.querySelector('h3');
    expect(h3?.textContent).toContain('Ana Souza');
  });

  it('should render email do cliente', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const spans = fixture.nativeElement.querySelectorAll('span');
    const textos = Array.from(spans).map((s: any) => s.textContent);
    expect(textos.some(t => t.includes('ana@email.com'))).toBe(true);
  });

  it('should render telefone do cliente', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const spans = fixture.nativeElement.querySelectorAll('span');
    const textos = Array.from(spans).map((s: any) => s.textContent);
    expect(textos.some(t => t.includes('11999999999'))).toBe(true);
  });

  it('should render endereco quando preenchido', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const spans = fixture.nativeElement.querySelectorAll('span');
    const textos = Array.from(spans).map((s: any) => s.textContent);
    expect(textos.some(t => t.includes('Rua das Flores, 10'))).toBe(true);
  });

  it('should render observacoes quando preenchidas', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const ps = fixture.nativeElement.querySelectorAll('p');
    const textos = Array.from(ps).map((p: any) => p.textContent);
    expect(textos.some(t => t.includes('Cliente VIP'))).toBe(true);
  });

  it('should show vinculos section quando nutricionista_id e markup_id_padrao presentes', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    const ps = fixture.nativeElement.querySelectorAll('p');
    const textos = Array.from(ps).map((p: any) => p.textContent?.trim());
    expect(textos.some(t => t === 'Vínculos')).toBe(true);
  });

  it('should not show vinculos section quando sem nutricionista e sem markup', () => {
    host.visible.set(true);
    host.cliente.set({ ...clienteBase, nutricionista_id: null, markup_id_padrao: null });
    fixture.detectChanges();
    const ps = fixture.nativeElement.querySelectorAll('p');
    const textos = Array.from(ps).map((p: any) => p.textContent?.trim());
    expect(textos.some(t => t === 'Vínculos')).toBe(false);
  });

  it('should not show observacoes section quando vazio', () => {
    host.visible.set(true);
    host.cliente.set({ ...clienteBase, observacoes: null });
    fixture.detectChanges();
    const ps = fixture.nativeElement.querySelectorAll('p');
    const textos = Array.from(ps).map((p: any) => p.textContent?.trim());
    expect(textos.some(t => t === 'Observações')).toBe(false);
  });

  it('should show "—" quando email null', () => {
    host.visible.set(true);
    host.cliente.set({ ...clienteBase, email: null });
    fixture.detectChanges();
    const spans = fixture.nativeElement.querySelectorAll('span');
    const textos = Array.from(spans).map((s: any) => s.textContent);
    expect(textos.some(t => t.includes('—'))).toBe(true);
  });

  it('should inicializar com lastEditar null (output editar existe)', () => {
    host.visible.set(true);
    host.cliente.set(clienteBase);
    fixture.detectChanges();
    expect(host.lastEditar).toBeNull();
  });
});
