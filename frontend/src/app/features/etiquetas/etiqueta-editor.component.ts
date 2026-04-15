import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import Quill from 'quill';

import { EtiquetaService } from '../../core/services/etiqueta.service';
import { EtiquetaRenderService } from './services/etiqueta-render.service';
import { registerBlots } from './blots/register-blots';
import {
  PLACEHOLDER_CATEGORIES,
  PLACEHOLDERS,
  SAMPLE_INGREDIENTES,
  type PlaceholderDef,
} from './constants/placeholders';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { EtiquetaData } from '../../core/models';

registerBlots();

@Component({
  selector: 'app-etiqueta-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, InputNumberModule, ToastModule, DividerModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './etiqueta-editor.component.html',
  styleUrl: './etiqueta-editor.component.scss',
})
export class EtiquetaEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private etiquetaService = inject(EtiquetaService);
  private renderService = inject(EtiquetaRenderService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  private quill: Quill | null = null;

  carregando = false;
  salvando = false;
  safePreviewHtml: SafeHtml | null = null;

  readonly placeholders = PLACEHOLDERS;
  readonly categories = PLACEHOLDER_CATEGORIES;

  dimensionForm = this.fb.group({
    largura_mm: [130, [Validators.required, Validators.min(20), Validators.max(300)]],
    altura_mm: [90, [Validators.required, Validators.min(20), Validators.max(300)]],
    offset_x_mm: [0, [Validators.required, Validators.min(-20), Validators.max(20)]],
    offset_y_mm: [0, [Validators.required, Validators.min(-20), Validators.max(20)]],
  });

  ngOnInit(): void {
    this.carregarSettings();
  }

  ngAfterViewInit(): void {
    this.initQuill();
  }

  ngOnDestroy(): void {
    this.quill = null;
  }

  private initQuill(): void {
    const container = document.getElementById('quill-editor-container');
    if (!container) return;

    this.quill = new Quill(container, {
      theme: 'snow',
      modules: {
        toolbar: '#etiqueta-toolbar',
      },
      placeholder: 'Escreva o conteúdo da etiqueta aqui...',
    });
  }

  private carregarSettings(): void {
    this.carregando = true;
    this.etiquetaService.obterSettings().subscribe({
      next: (tenant) => {
        if (tenant.etiqueta_largura_mm) {
          this.dimensionForm.patchValue({ largura_mm: tenant.etiqueta_largura_mm });
        }
        if (tenant.etiqueta_altura_mm) {
          this.dimensionForm.patchValue({ altura_mm: tenant.etiqueta_altura_mm });
        }
        if (tenant.etiqueta_offset_x_mm !== undefined) {
          this.dimensionForm.patchValue({ offset_x_mm: tenant.etiqueta_offset_x_mm });
        }
        if (tenant.etiqueta_offset_y_mm !== undefined) {
          this.dimensionForm.patchValue({ offset_y_mm: tenant.etiqueta_offset_y_mm });
        }
        if (tenant.etiqueta_template_delta && this.quill) {
          this.quill.setContents(tenant.etiqueta_template_delta);
        }
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  inserirPlaceholder(key: string): void {
    if (!this.quill) return;
    const range = this.quill.getSelection(true);
    this.quill.insertEmbed(range.index, 'placeholder', key, 'user');
    this.quill.setSelection(range.index + 1, 0);
    this.quill.focus();
  }

  inserirIngredientesTabela(): void {
    if (!this.quill) return;
    const range = this.quill.getSelection(true);
    this.quill.insertEmbed(range.index, 'ingredientes-tabela', true, 'user');
    this.quill.insertText(range.index + 1, '\n', 'user');
    this.quill.setSelection(range.index + 2, 0);
    this.quill.focus();
  }

  gerarPreview(): void {
    if (!this.quill) return;
    const html = this.quill.root.innerHTML;
    const sampleData: EtiquetaData = {
      cliente_nome: 'Maria Silva',
      tipo_refeicao: 'Almoço',
      data_fabricacao: new Date().toLocaleDateString('pt-BR'),
      data_validade: new Date(Date.now() + 3 * 86400000).toLocaleDateString('pt-BR'),
      empresa_nome: 'Benedere Fit',
      empresa_cnpj: '12.345.678/0001-90',
      ingredientes: SAMPLE_INGREDIENTES,
    };
    const rendered = this.renderService.render(html, sampleData);
    this.safePreviewHtml = this.sanitizer.bypassSecurityTrustHtml(rendered);

    // Scroll suave até o preview
    setTimeout(() => {
      document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  salvar(): void {
    if (!this.quill || this.dimensionForm.invalid) {
      this.dimensionForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', detail: 'Informe dimensões válidas (20–300mm)' });
      return;
    }

    this.salvando = true;
    const { largura_mm, altura_mm, offset_x_mm, offset_y_mm } = this.dimensionForm.value;

    this.etiquetaService.salvarSettings({
      template_delta: this.quill.getContents(),
      html_output: this.quill.root.innerHTML,
      dimensions: { w: largura_mm!, h: altura_mm! },
      offset: { x: offset_x_mm!, y: offset_y_mm! },
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', detail: 'Template de etiqueta salvo com sucesso' });
        this.salvando = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', detail: 'Erro ao salvar template' });
        this.salvando = false;
      },
    });
  }

  placeholdersByCategory(category: string): PlaceholderDef[] {
    return this.placeholders.filter(p => p.category === category);
  }

  get previewStyle(): Record<string, string> {
    const w = this.dimensionForm.value.largura_mm ?? 130;
    const h = this.dimensionForm.value.altura_mm ?? 90;
    return {
      width: `${w}mm`,
      height: `${h}mm`,
      maxHeight: `${h}mm`,
      overflow: 'hidden',
    };
  }
}
