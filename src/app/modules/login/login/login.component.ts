import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { LoginService } from '../services/login.service';
import { Usuario } from '../models/usuario.model';
import { AuthService } from '../../../shared/auth.service';
import { ObjetoLogin, DadosLogin } from '../../../shared/objeto-login.model';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // objeto Usuario
  public usuario: Usuario = new Usuario();
  // objeto de formulario
  public formulario: FormGroup;
  // referencia para escutar as alterações no formulario
  private formularioChanges: Subscription;
  // se esta enviando os dados
  public enviando: boolean = false;
  // mensagem de erro de login
  public errorMsg: string;
  // se pode ou não salvar os dados
  public podeSalvar: boolean = true;

  constructor(private loginSrvc:LoginService,
              private authSrvc: AuthService,
              private router: Router,
              private formBuilder: FormBuilder
    ) {}

  ngOnInit(): void {
    // verifica se pode salvar os dados
    this.podeSalvar = typeof(Storage) !== 'undefined';

    // verifica se já esta logado
    if ( this.authSrvc.estaAutenticado() )
      this.router.navigate(['estoque']);

    // inicializa o form
    this.constroiForm();
  }

  ngOnDestroy(): void {
    // cancela o listener ao sair
    this.formularioChanges.unsubscribe();
  }

  /**
   * inicializa o formulario
   */
  constroiForm(): void {
    this.formulario = this.formBuilder.group({
      'nome': [{value: this.usuario.nome, disabled: false}, Validators.required],
      'senha': [{value: this.usuario.senha, disabled: false}, Validators.required],
      'lembreMe': [{value: false, disabled: false}]
    });

    // assiste as mudanças
    this.formularioChanges = this.formulario.valueChanges.subscribe(data => this.onValueChanged(data));
    // verifica mudancas
    this.onValueChanged();
  }

  /**
   * assiste mudancas no formulario
   * @param {any} data valores do formulario
   */
  onValueChanged(data?: any): void {
    if (!this.formulario) {
      return;
    }

    let form = this.formulario;

    for (let field in this.formErrors) {
      // limpa mensagens de erros anteriores
      this.formErrors[field] = '';
      let control = form.get(field);
      // verifica novos erros
      if (control && !control.valid && control.touched) {
        let messages = this.validationMessages[field];
        for (let key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  /**
   * objeto com a lista de erros
   */
  formErrors = {
    'nome': '',
    'senha': ''
  };

  /**
   * objeto com as mensagens de validacao de erros
   */
  validationMessages = {
    'nome': {
      'required': 'Digite um nome de usuário válido.'
    },
    'senha': {
      'required': 'Digite sua senha.'
    }
  };

  /**
   * envia o formulario
   */
  onSubmit(): void {
    this.onValueChanged();
    // console.log(this.formulario);

    if ( this.formulario.valid ) {
      // desabilita botoes e campos
      this.enviando = true;
      this.formulario.controls['nome'].disable();
      this.formulario.controls['senha'].disable();
      this.formulario.controls['lembreMe'].disable();

      this.usuario.nome = this.formulario.value.nome;
      this.usuario.senha = this.formulario.value.senha;

      this.loginSrvc.efetuarLogin(this.usuario)
                      .subscribe(
                         res => this.autenticar(res),
                         error => this.liberarForm(error));
    }
  }

  /**
   * valida o login
   * @param {any} respLogin resposta do login
   */
  autenticar(respLogin: any): void {
    // console.log('autenticar:', respLogin);
    this.errorMsg = null;
    if ( respLogin.Autenticado ) {
      // cria objeto de login com o resultado
      let obj: ObjetoLogin = {
        autenticado: respLogin.Autenticado,
        mensagem: respLogin.Mensagem,
        dados: {
          idEmpresa: respLogin.idEmpresa,
          idUsuario: respLogin.idUsuario,
          hashLogin: respLogin.hash
        }
      };
      // autentica valores
      this.authSrvc.autenticar(obj, this.formulario.value.lembreMe)
                    .subscribe(
                      res => {
                        if (res)
                          this.router.navigate(['estoque']);
                        else
                          this.liberarForm('Houve um erro interno, por favor tente novamente.');
                      },
                      error => this.liberarForm(error)
                    );

    } else {
      this.liberarForm(respLogin.Mensagem);
    }
  }

  /**
   * libera os campos bloqueados e exibe a mensagem de erros se houver
   * @param {string} msg mensagem
   */
  liberarForm(msg?: string): void {
    this.enviando = false;
    this.formulario.controls['nome'].enable();
    this.formulario.controls['senha'].enable();
    this.formulario.controls['lembreMe'].enable();

    this.errorMsg = msg;
  }
}
