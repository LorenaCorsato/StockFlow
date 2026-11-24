import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Produto } from '../models/produto';

/** Formato exato devolvido pelo backend Java (GET /api/products). */
export interface ProdutoBackend {
  id: number;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  minStock: number;
}

// Integrado ao backend Java via proxy de dev (same-origin -> http://localhost:8080/api/products).
// O baseUrl relativo evita CORS no `ng serve`: o dev-server repassa /api ao backend.
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly baseUrl = '/api/products';

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http
      .get<ProdutoBackend[]>(this.baseUrl)
      .pipe(map((lista) => lista.map(paraProduto)));
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http
      .post<ProdutoBackend>(this.baseUrl, paraBackend(produto))
      .pipe(map(paraProduto));
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    return this.http
      .put<ProdutoBackend>(`${this.baseUrl}/${id}`, paraBackend(produto))
      .pipe(map(paraProduto));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

/** Backend (inglês) -> modelo do Angular (português). */
function paraProduto(b: ProdutoBackend): Produto {
  return {
    id: b.id,
    nome: b.name,
    descricao: b.description,
    categoria: b.category,
    quantidade: b.quantity,
    estoqueMinimo: b.minStock,
  };
}

/** Modelo do Angular (português) -> payload do backend (inglês). */
function paraBackend(p: Produto): Record<string, unknown> {
  return {
    name: p.nome,
    description: p.descricao ?? null,
    category: p.categoria,
    quantity: p.quantidade,
    minStock: p.estoqueMinimo,
  };
}
