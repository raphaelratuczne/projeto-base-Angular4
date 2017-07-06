/**
 * objeto de resposta ao criar um pedido, tambem enviado na listaem
 */
export interface RespostaPedido {
  id: number;
  idEmpresa: number;
  idUsuario: number;
  codigoInterno: string;
  observacao: string;
  status: string;
  quantidadeTotalProdutos: number;
  dataPedido: string | any;
  dataFechamento: string | any;
  pedidoItens: PedidoItem[];
}

/**
 * lista de produtos do pedido
 */
export interface PedidoItem {
  codigoInternoProduto: string;
  descricao: string;
  quantidadeSolicitada: number;
  quantidadeExpedida: number;
  status: string;
  atendimentoParcial: boolean;
}
