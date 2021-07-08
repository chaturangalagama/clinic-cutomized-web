import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { AuthService } from '../../services/auth.service';
import { timer, Subject } from 'rxjs';

@Component({
  selector: 'app-auto-logout-popup',
  templateUrl: './auto-logout-popup.component.html'
})
export class AutoLogoutPopupComponent implements OnInit {

  private timer;
  private subscription;
  public logout: Subject<boolean>;

  ngOnInit(): void {
    this.logout = new Subject();
    this.timer = timer(30000);
    this.subscription = this.timer.subscribe(() => {
      this.bsModalRef.hide();
      this.authService.logout();
    });
  }

  constructor(private bsModalRef: BsModalRef, private authService: AuthService, private modalService: BsModalService) {}

  // stay() {
  //   this.isStay.next(true);
  //   this.bsModalRef.hide();
  //   this.subscription.unsubscribe();
  // }

  leave(){
    this.bsModalRef.hide();
    this.logout.next(true);
  }

}
