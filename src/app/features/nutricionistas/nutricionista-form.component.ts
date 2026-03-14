import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { NutricionistaService } from '../../core/services/nutricionista.service';

@Component({
  selector: 'app-nutricionista-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './nutricionista-form.component.html',
})
export class NutricionistaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(NutricionistaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  loading = false;
  salvando = false;
  nutricionistaId: string | null = null;

  ngOnInit(): void {
    this.nutricionistaId = this.route.snapshot.paramMap.get('id');
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      crn: ['', [Validators.required]],
      email: ['', [Validators.email]],
      telefone: [''],
    });
    if (this.nutricionistaId) {
      this.loading = true;
      this.service.buscarPorId(this.nutricionistaId).subscribe({
        next: (data) => { this.form.patchValue(data); this.loading = false; },
        error: () => this.voltar(),
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.salvando = true;
    const req$ = this.nutricionistaId
      ? this.service.atualizar(this.nutricionistaId, this.form.value)
      : this.service.criar(this.form.value);
    req$.subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Salvo com sucesso' }); setTimeout(() => this.voltar(), 1000); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar' }); this.salvando = false; },
    });
  }

  voltar(): void { this.router.navigate(['/nutricionistas']); }
  isInvalid(campo: string): boolean { const c = this.form.get(campo); return !!(c?.invalid && c?.touched); }
}