import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';

// Listagem via json-server (npm run server -> db.json na porta 3000).
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly baseUrl = 'http://localhost:3000/produtos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }
}
