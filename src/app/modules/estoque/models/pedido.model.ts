/**
 * objeto de lista de pedidos exibida no html
 */
export interface Pedido {
  listaProdutos: ListaProdutosPedido[];
  observacao: string;
}

/**
 * objeto de lista de produtos adicionada ao pedido
 */
export interface ListaProdutosPedido {
  idProduto: number;
  produtoCodigoInterno: string;
  quantidade: number;
}
