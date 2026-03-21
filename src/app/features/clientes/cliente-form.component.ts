import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { MarkupService } from '../../core/services/markup.service';
import { Markup } from '../../core/models';
import { ClienteService } from '../../core/services/cliente.service';
import { NutricionistaService } from '../../core/services/nutricionista.service';
import { Nutricionista } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { AvatarComponent } from '../../shared/components/avatar.component';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, InputTextModule, SelectModule, TextareaModule, ToastModule, TabsModule,
    PageHeaderComponent, AvatarComponent,
  ],
  providers: [MessageService],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private nutricionistaService = inject(NutricionistaService);
  private markupService = inject(MarkupService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  nutricionistas: Nutricionista[] = [];
  markups: Markup[] = [];
  loading = false;
  salvando = false;
  clienteId: string | null = null;
  

  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    this.inicializarForm();
    this.carregarNutricionistas();
    this.markupService.listar().subscribe({ next: (data) => this.markups = data });
    if (this.clienteId) {
      this.carregarCliente();
    }
  }

  private inicializarForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telefone: [''],
      endereco: [''],
      observacoes: [''],
      nutricionista_id: [null],
      markup_id_padrao: [null],
    });
  }

  private carregarNutricionistas(): void {
    this.nutricionistaService.listar().subscribe({
      next: (data) => this.nutricionistas = data,
    });
  }

  private carregarCliente(): void {
    this.loading = true;
    this.clienteService.buscarPorId(this.clienteId!).subscribe({
      next: (cliente) => {
        this.form.patchValue(cliente);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Cliente não encontrado' });
        this.voltar();
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const dados = this.form.value;

    const request$ = this.clienteId
      ? this.clienteService.atualizar(this.clienteId, dados)
      : this.clienteService.criar(dados);

    request$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente salvo com sucesso' });
        setTimeout(() => this.voltar(), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar cliente' });
        this.salvando = false;
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/clientes']);
  }

  isInvalid(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control?.invalid && control?.touched);
  }
}