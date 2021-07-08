import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisitManagementService {
  private queueRefresh = new BehaviorSubject<any>([]);

  constructor() { }

  getQueueRefresh(): Observable<any>{
    return this.queueRefresh;
  }

  setQueueRefresh(){
    this.queueRefresh.next(true);
  }

  // Item

  
}
