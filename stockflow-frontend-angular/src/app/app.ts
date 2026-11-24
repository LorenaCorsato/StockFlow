import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto } from './models/produto';
import { ProdutoService } from './services/produto.service';
import { ProdutoDialog } from './components/produto-dialog/produto-dialog';

@Component({
  imports: [CommonModule, FormsModule, ProdutoDialog],
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
          'Não foi possível carregar os produtos. Verifique se o json-server está rodando (npm run server).',
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
      next: () => {
        this.salvandoDialogo.set(false);
        this.dialogoAberto.set(false);
        this.produtoEmEdicao.set(null);
        this.carregar();
      },
      error: () => {
        this.salvandoDialogo.set(false);
        this.erroDialogo.set(
          'Não foi possível salvar. Verifique a conexão com o banco de dados e tente de novo.',
        );
      },
    });
  }

  excluir(p: Produto): void {
    if (p.id == null) return;
    if (!window.confirm(`Excluir "${p.nome}" do estoque?`)) return;
    this.produtoService.excluir(p.id).subscribe({
      next: () => this.carregar(),
      error: () =>
        this.erro.set('Não foi possível excluir o produto. Tente novamente.'),
    });
  }
}
