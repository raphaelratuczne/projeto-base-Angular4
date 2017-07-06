import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subscriber } from 'rxjs/Subscriber';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ObjetoLogin } from './objeto-login.model';

@Injectable()
export class AuthService implements CanActivate {

  // se pode ou nao salvar os dados
  private podeSalvar: boolean = true;
  // se esta ou nao autenticado
  private usuarioAutenticado: boolean = false;
  // objeto de login
  private objetoLogin: ObjetoLogin;

  constructor(private router: Router) {
    // verifica se pode salvar os dados
    this.podeSalvar = typeof(Storage) !== 'undefined';
  }

  /**
   * guarda dados de login
   * @param  {ObjetoLogin} objLogin dados do login
   * @param  {boolean} lembreMe se deve salvar os dados
   * @return {boolean} retorna verdadeiro se tudo ocorreu corretamente
   */
  public autenticar(objLogin: ObjetoLogin, lembreMe: boolean = false): Observable<boolean> {
    // console.log(objLogin);
    return new Observable((subscriber: Subscriber<boolean>) => {

      // se fez o login
      if ( objLogin.autenticado ) {
        // se pode salvar
        if ( this.podeSalvar ) {
          // se deve salvar
          if ( lembreMe ) {
            localStorage.setItem('autenticado', 'true');
            localStorage.setItem('objetoLogin', btoa(JSON.stringify(objLogin)));
          } else {
            sessionStorage.setItem('autenticado', 'true');
            sessionStorage.setItem('objetoLogin', btoa(JSON.stringify(objLogin)));
          }

          // se não pode salvar
        } else {
          this.usuarioAutenticado = true;
          this.objetoLogin = objLogin;
        }

      } else {
        // se tinha algo salvo, destroi
        this.limpar();
      }

      return subscriber.next(objLogin.autenticado);
    });

  }

  /**
   * retorna ObjetoLogin salvo
   * @return {IObjetoLogin}
   */
  public getObjetoLogin(): ObjetoLogin {
    if ( this.podeSalvar ) {
      let data = localStorage.getItem('objetoLogin') || sessionStorage.getItem('objetoLogin');
      return JSON.parse( atob(data) );
    } else {
      return this.objetoLogin;
    }
  }

  /**
   * destroi a sessao
   * @return {boolean} retorna true ao terminar
   */
  public limpar(): boolean {
    if ( this.podeSalvar ) {
      localStorage.removeItem('autenticado');
      localStorage.removeItem('objetoLogin');
      sessionStorage.removeItem('autenticado');
      sessionStorage.removeItem('objetoLogin');
    } else {
      this.usuarioAutenticado = false;
    }
    return true;
  }

  /**
   * retorna se esta autenticado
   * @return {boolean}
   */
  public estaAutenticado(): boolean {
    if ( this.podeSalvar ) {
      return localStorage.getItem('autenticado') === 'true' || sessionStorage.getItem('autenticado') === 'true' || false;
    } else {
      return this.usuarioAutenticado;
    }
  }

  /**
   * retorna se esta autenticado para as rotas
   * @param  {ActivatedRouteSnapshot} route
   * @param  {RouterStateSnapshot} state
   * @return {Observable<boolean>}
   */
  public canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | boolean {
    if ( !this.estaAutenticado() ) {
      this.router.navigate(['login']);
    }
    return new Observable((subscriber: Subscriber<boolean>) => subscriber.next(this.estaAutenticado()));
  }
}
