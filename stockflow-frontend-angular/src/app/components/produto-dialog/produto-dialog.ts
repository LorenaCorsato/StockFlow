import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Produto } from '../../models/produto';

/**
 * Diálogo lateral (drawer) para adicionar e editar produtos.
 *
 * - Abre do lado direito com overlay (clique no overlay ou ESC fecha).
 * - Todos os campos obrigatórios (nome, categoria, quantidade, estoqueMinimo)
 *   precisam estar válidos para liberar o botão Adicionar/Salvar.
 * - Quando `apiIndisponivel` é true (banco/conexão fora), o botão de
 *   confirmação fica bloqueado mesmo com o formulário válido.
 */
@Component({
  selector: 'app-produto-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produto-dialog.html',
  styleUrl: './produto-dialog.css',
})
export class ProdutoDialog implements OnChanges {
  /** Controla a visibilidade do drawer. */
  @Input() aberto = false;
  /** Produto em edição; null/undefined = modo adição. */
  @Input() produto: Produto | null = null;
  /** True enquanto o App salva (POST/PUT em voo). Bloqueia o botão. */
  @Input() salvando = false;
  /** True quando banco/conexão falhou. Bloqueia o botão de confirmar. */
  @Input() apiIndisponivel = false;
  /** Erro vindo do App (ex.: 400/500 do backend) exibido no drawer. */
  @Input() erroServidor: string | null = null;

  @Output() fechar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<Produto>();

  form: FormGroup;
  tentativaEnvio = signal(false);

  titulo = computed(() => (this.produto?.id != null ? 'Editar produto' : 'Novo produto'));
  rotuloBotao = computed(() => (this.produto?.id != null ? 'Salvar alterações' : 'Adicionar'));

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      descricao: ['', [Validators.maxLength(500)]],
      categoria: ['', [Validators.required, Validators.maxLength(80)]],
      quantidade: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      estoqueMinimo: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    });
  }

  private preencherFormulario(): void {
    this.tentativaEnvio.set(false);
    this.form.reset({
      nome: this.produto?.nome ?? '',
      descricao: this.produto?.descricao ?? '',
      categoria: this.produto?.categoria ?? '',
      quantidade: this.produto?.quantidade ?? null,
      estoqueMinimo: this.produto?.estoqueMinimo ?? null,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aberto'] && this.aberto) this.preencherFormulario();
    if (changes['produto'] && this.aberto) this.preencherFormulario();
  }

  /** Botão liberado só com formulário válido + API ok + sem salvamento em voo. */
  podeConfirmar(): boolean {
    return this.form.valid && !this.salvando && !this.apiIndisponivel;
  }

  aoConfirmar(): void {
    this.tentativaEnvio.set(true);
    if (!this.podeConfirmar()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const descricao = String(v.descricao ?? '').trim();
    const payload: Produto = {
      ...(this.produto?.id != null ? { id: this.produto.id } : {}),
      nome: String(v.nome).trim(),
      descricao: descricao ? descricao : null,
      categoria: String(v.categoria).trim(),
      quantidade: Number(v.quantidade),
      estoqueMinimo: Number(v.estoqueMinimo),
    };
    this.salvar.emit(payload);
  }

  aoFechar(): void {
    if (this.salvando) return;
    this.fechar.emit();
  }

  aoTeclar(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.aoFechar();
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty || this.tentativaEnvio());
  }
}
