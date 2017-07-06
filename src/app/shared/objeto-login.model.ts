
export class ObjetoLogin {
  dados: DadosLogin;
  autenticado: boolean;
  mensagem: string;
}

export class DadosLogin {
  idEmpresa: number;
  idUsuario: number;
  hashLogin: string;
}
