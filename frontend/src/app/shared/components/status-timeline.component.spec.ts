import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StatusTimelineComponent } from './status-timeline.component';

@Component({
  standalone: true,
  imports: [StatusTimelineComponent],
  template: `<app-status-timeline [currentStatus]="status" />`,
})
class TestHostComponent {
  status = 'rascunho';
}

describe('StatusTimelineComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should render 4 step circles', () => {
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('.w-8.h-8');
    expect(circles.length).toBe(4);
  });

  it('should highlight rascunho as current step', () => {
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('.w-8.h-8');
    expect(circles[0].className).toContain('bg-emerald-500');
    expect(circles[0].className).toContain('text-white');
  });

  it('should mark previous steps as completed for aprovado', () => {
    host.status = 'aprovado';
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('.w-8.h-8');
    expect(circles[0].className).toContain('bg-emerald-100');
    expect(circles[1].className).toContain('bg-emerald-500');
    expect(circles[2].className).toContain('bg-zinc-100');
  });

  it('should show all completed for entregue', () => {
    host.status = 'entregue';
    fixture.detectChanges();
    const circles = fixture.nativeElement.querySelectorAll('.w-8.h-8');
    expect(circles[0].className).toContain('bg-emerald-100');
    expect(circles[1].className).toContain('bg-emerald-100');
    expect(circles[2].className).toContain('bg-emerald-100');
    expect(circles[3].className).toContain('bg-emerald-500');
  });

  it('should show cancelled badge for cancelado status', () => {
    host.status = 'cancelado';
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Cancelado');
    const cancelCircle = el.querySelector('.bg-rose-100');
    expect(cancelCircle).toBeTruthy();
  });

  it('should not show cancelled badge for non-cancelled status', () => {
    host.status = 'aprovado';
    fixture.detectChanges();
    const cancelCircle = fixture.nativeElement.querySelector('.bg-rose-100');
    expect(cancelCircle).toBeNull();
  });

  it('should render connectors between steps', () => {
    fixture.detectChanges();
    const connectors = fixture.nativeElement.querySelectorAll('.h-0\\.5');
    expect(connectors.length).toBe(3);
  });

  it('should color connectors green for completed steps', () => {
    host.status = 'em_producao';
    fixture.detectChanges();
    const connectors = fixture.nativeElement.querySelectorAll('.h-0\\.5');
    expect(connectors[0].className).toContain('bg-emerald-400');
    expect(connectors[1].className).toContain('bg-emerald-400');
    expect(connectors[2].className).toContain('bg-zinc-200');
  });
});
