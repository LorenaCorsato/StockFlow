import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Produto } from '../../models/produto';

/** Aceita vazio (opcional) ou valor monetário pt-BR ≥ 0 (ex.: "1.234,56"). */
function validadorPrecoBr(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = conversorPrecoBr(String(v));
  return n === null || n < 0 ? { precoInvalido: true } : null;
}

/** Converte "1.234,56" / "1234,56" / "12.5" em number; null se inválido. */
function conversorPrecoBr(texto: string): number | null {
  const t = texto.trim();
  if (!t) return null;
  const limpo = t.replace(/[^\d.,-]/g, '');
  if (!limpo || /-/.test(limpo)) return null;
  const semMilhar = limpo.replace(/\./g, '');
  const normalizado = semMilhar.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  const n = Number(normalizado);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

/** Formata number para "1.234,56". */
function formatarPrecoBr(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
      categoria: ['', [Validators.required, Validators.maxLength(80)]],
      quantidade: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      estoqueMinimo: [null as number | null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      preco: [null as string | null, [validadorPrecoBr]],
    });
  }

  private preencherFormulario(): void {
    this.tentativaEnvio.set(false);
    this.form.reset({
      nome: this.produto?.nome ?? '',
      categoria: this.produto?.categoria ?? '',
      quantidade: this.produto?.quantidade ?? null,
      estoqueMinimo: this.produto?.estoqueMinimo ?? null,
      preco: this.produto?.preco != null ? formatarPrecoBr(this.produto.preco) : null,
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
    const precoConvertido =
      v.preco === null || v.preco === undefined || String(v.preco).trim() === ''
        ? null
        : conversorPrecoBr(String(v.preco));
    const payload: Produto = {
      ...(this.produto?.id != null ? { id: this.produto.id } : {}),
      nome: String(v.nome).trim(),
      categoria: String(v.categoria).trim(),
      quantidade: Number(v.quantidade),
      estoqueMinimo: Number(v.estoqueMinimo),
      ...(precoConvertido !== null ? { preco: precoConvertido } : {}),
    };
    this.salvar.emit(payload);
  }

  /**
   * Máscara de moeda pt-BR aplicada a cada tecla: só dígitos entram,
   * os centavos avançam (ex.: digita "1234" → "12,34") com milhar e "R$".
   */
  aoDigitarPreco(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 12);
    if (!digitos) {
      this.form.get('preco')?.setValue(null, { emitEvent: false });
      input.value = '';
      return;
    }
    const numero = parseInt(digitos, 10) / 100;
    const mascara = formatarPrecoBr(numero);
    this.form.get('preco')?.setValue(mascara, { emitEvent: false });
    this.form.get('preco')?.markAsDirty();
    input.value = mascara;
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
