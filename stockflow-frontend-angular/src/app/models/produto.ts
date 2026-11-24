export interface Produto {
  id?: number;
  nome: string;
  descricao?: string | null;
  categoria: string;
  quantidade: number;
  estoqueMinimo: number;
}
