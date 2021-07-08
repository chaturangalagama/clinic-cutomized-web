import { Injectable, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject, throwError } from 'rxjs';
import { tap, switchMap, take, filter, catchError } from 'rxjs/operators';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { AlertService } from '../../business/services/alert.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AutoLogoutPopupComponent } from '../pages/login/auto-logout-popup.component';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {

  public isTokenRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  bsModalRef: BsModalRef;

  constructor(public authService: AuthService, private alertService : AlertService, private modalService: BsModalService,) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!request.url.includes("token") && localStorage.getItem('access_token')) {
      request = this.addToken(request, localStorage.getItem('access_token'));
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next, error);
      } else {
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, error) {
    if(request.url.includes("token")){
      this.showModal();
    }
    if (!this.isTokenRefreshing) {
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((resp: any) => {
          this.storeNewAuthenticationToken(resp);
          this.isTokenRefreshing = false;
          this.refreshTokenSubject.next(localStorage.getItem('access_token'));
          return next.handle(this.addToken(request, localStorage.getItem('access_token')));
        })
        );

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt))
        })
        );
    }
  }

  showModal() {
    this.bsModalRef = this.modalService.show(AutoLogoutPopupComponent, {
      class: 'modal-md',
      backdrop: 'static',
      keyboard: false
    });
    this.bsModalRef.content.logout.subscribe(logout => {
      this.authService.logout();
    })
  }

  storeNewAuthenticationToken(resp) {
    localStorage.setItem('access_token', null);
    localStorage.setItem('refresh_token', null);
    localStorage.setItem('user_details', null);
    localStorage.setItem('access_token', resp.body['access_token']);
    localStorage.setItem('refresh_token', resp.body['refresh_token']);
    localStorage.setItem('user_details', JSON.stringify(resp.body['user_details']));
  }

}
