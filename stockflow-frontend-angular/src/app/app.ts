import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Produto } from './models/produto';
import { ProdutoService } from './services/produto.service';
import { ProdutoDialog } from './components/produto-dialog/produto-dialog';
import { ConfirmarExclusao } from './components/confirmar-exclusao/confirmar-exclusao';
import { Toast, ToastTipo } from './components/toast/toast';

@Component({
  imports: [CommonModule, FormsModule, ProdutoDialog, ConfirmarExclusao, Toast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly titulo = 'StockFlow — Controle de Estoque';

  produtos = signal<Produto[]>([]);
  carregando = signal(false);
  erro = signal<string | null>(null);
  busca = signal('');
  filtroEstoque = signal<'todos' | 'normal' | 'baixo'>('todos');

  // Estado do diálogo lateral (adicionar / editar).
  dialogoAberto = signal(false);
  produtoEmEdicao = signal<Produto | null>(null);
  salvandoDialogo = signal(false);
  erroDialogo = signal<string | null>(null);

  // Estado do modal de exclusão + toast inferior central.
  modalExclusaoAberto = signal(false);
  produtoParaExcluir = signal<Produto | null>(null);
  excluindo = signal(false);
  toastVisivel = signal(false);
  toastMensagem = signal('');
  toastTipo = signal<ToastTipo>('sucesso');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  /** Sem conexão com o banco/API: bloqueia o botão Adicionar/Salvar. */
  apiIndisponivel = computed(() => this.erro() !== null);

  produtosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const filtro = this.filtroEstoque();
    return this.produtos().filter((p) => {
      const passaBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo);
      const baixo = this.estoqueBaixo(p);
      const passaFiltro =
        filtro === 'todos' ||
        (filtro === 'baixo' && baixo) ||
        (filtro === 'normal' && !baixo);
      return passaBusca && passaFiltro;
    });
  });

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.produtoService.listar().subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(
          'Não foi possível carregar os produtos. Verifique se o backend Java está rodando (http://localhost:8080) e reinicie o Angular com o proxy (`ng serve`).',
        );
        this.carregando.set(false);
      },
    });
  }

  limparBusca(): void {
    this.busca.set('');
  }

  estoqueBaixo(p: Produto): boolean {
    return p.quantidade <= p.estoqueMinimo;
  }

  abrirNovo(): void {
    this.produtoEmEdicao.set(null);
    this.erroDialogo.set(null);
    this.dialogoAberto.set(true);
  }

  abrirEdicao(p: Produto): void {
    this.produtoEmEdicao.set({ ...p });
    this.erroDialogo.set(null);
    this.dialogoAberto.set(true);
  }

  fecharDialogo(): void {
    if (this.salvandoDialogo()) return;
    this.dialogoAberto.set(false);
    this.produtoEmEdicao.set(null);
    this.erroDialogo.set(null);
  }

  salvarDialogo(payload: Produto): void {
    if (this.apiIndisponivel()) {
      this.erroDialogo.set('Sem conexão com o banco de dados. Não é possível salvar agora.');
      return;
    }
    this.salvandoDialogo.set(true);
    this.erroDialogo.set(null);

    const editando = this.produtoEmEdicao();
    const req$ =
      editando?.id != null
        ? this.produtoService.atualizar(editando.id, payload)
        : this.produtoService.criar(payload);

    req$.subscribe({
      next: (salvo) => {
        this.salvandoDialogo.set(false);
        this.dialogoAberto.set(false);
        this.produtoEmEdicao.set(null);
        this.mostrarToast(
          editando?.id != null
            ? `"${salvo.nome}" atualizado com sucesso.`
            : `"${salvo.nome}" cadastrado com sucesso.`,
          'sucesso',
        );
        this.carregar();
      },
      error: (err: HttpErrorResponse) => {
        this.salvandoDialogo.set(false);
        this.erroDialogo.set(this.mensagemErroCadastro(err));
      },
    });
  }

  excluir(p: Produto): void {
    this.produtoParaExcluir.set({ ...p });
    this.modalExclusaoAberto.set(true);
  }

  cancelarExclusao(): void {
    if (this.excluindo()) return;
    this.modalExclusaoAberto.set(false);
    this.produtoParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const alvo = this.produtoParaExcluir();
    if (alvo?.id == null || this.excluindo()) return;
    const id = alvo.id;
    const nome = alvo.nome;
    this.excluindo.set(true);
    this.produtoService.excluir(id).subscribe({
      next: () => {
        this.excluindo.set(false);
        this.modalExclusaoAberto.set(false);
        this.produtoParaExcluir.set(null);
        // Remove da lista imediatamente, sem re-fetch.
        this.produtos.update((lista) => lista.filter((item) => item.id !== id));
        this.mostrarToast(`"${nome}" removido do estoque.`, 'sucesso');
      },
      error: () => {
        this.excluindo.set(false);
        this.modalExclusaoAberto.set(false);
        this.mostrarToast('Não foi possível excluir o produto. Tente novamente.', 'erro');
      },
    });
  }

  fecharToast(): void {
    this.toastVisivel.set(false);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  /** Extrai mensagem de validação do backend (400) para exibir no diálogo. */
  private mensagemErroCadastro(err: HttpErrorResponse): string {
    if (err.status === 400) {
      const corpo = err.error as unknown;
      if (typeof corpo === 'string' && corpo.trim()) return corpo;
      if (corpo && typeof corpo === 'object') {
        const msg = (corpo as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim()) return msg;
        const errors = (corpo as { errors?: unknown }).errors;
        if (Array.isArray(errors)) {
          const textos = errors
            .map((e) =>
              typeof e === 'string'
                ? e
                : e && typeof e === 'object'
                  ? String(
                      (e as { defaultMessage?: unknown; message?: unknown }).defaultMessage ??
                        (e as { message?: unknown }).message ??
                        '',
                    )
                  : '',
            )
            .filter((t) => t.trim());
          if (textos.length) return textos.join(' ');
        }
      }
      return 'Dados inválidos. Confira nome, categoria e valores (quantidade/estoque ≥ 0).';
    }
    return 'Não foi possível salvar. Verifique a conexão com o banco de dados e tente de novo.';
  }

  private mostrarToast(mensagem: string, tipo: ToastTipo): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMensagem.set(mensagem);
    this.toastTipo.set(tipo);
    this.toastVisivel.set(true);
    this.toastTimer = setTimeout(() => this.toastVisivel.set(false), 3500);
  }
}
