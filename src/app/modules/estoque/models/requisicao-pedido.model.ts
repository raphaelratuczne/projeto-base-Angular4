/**
 * objeto de criacao de pedido para enviar para o back-end
 */
export interface RequisicaoPedido {
 idEmpresa : number;
 idUsuario: number;
 observacao: string;
 pedidoItens: ListaProdutosRequisicaoPedido[];
}

/**
 * listagem dos produtos do pedido para enviar para o back-end
 */
export interface ListaProdutosRequisicaoPedido {
  codigoInternoProduto: string;
  quantidadeSolicitada: number;
}
