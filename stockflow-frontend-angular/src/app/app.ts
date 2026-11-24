import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto } from './models/produto';
import { ProdutoService } from './services/produto.service';

@Component({
  imports: [CommonModule, FormsModule],
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

  produtosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const lista = this.produtos();
    if (!termo) return lista;
    return lista.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo),
    );
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
}
