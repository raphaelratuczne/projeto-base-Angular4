/**
 * objeto para enviar para o back-end para cancelar o pedido
 */
export interface CancelarPedido {
  idEmpresa: number;
  idUsuario: number;
  codigoInterno: string;
  descricaoDoCancelamento: string;
}
