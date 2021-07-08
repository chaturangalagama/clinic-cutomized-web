import { AlertService } from '../../../services/alert.service';
import { ConsultationFormService } from '../../../services/consultation-form.service';
import { StoreService } from '../../../services/store.service';
import { Input, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ApiCmsManagementService } from '../../../services/api-cms-management.service';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-diagnosis',
  templateUrl: './consultation-diagnosis.component.html',
  styleUrls: ['./consultation-diagnosis.component.scss']
})
export class ConsultationDiagnosisComponent implements OnInit, OnDestroy {
  @Input() diagnosisIds: FormArray;

  private componentDestroyed: Subject<void> = new Subject();

  constructor(private consultationFormService: ConsultationFormService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  onBtnAddClicked() {
    console.log('ADD Item');
    this.consultationFormService.initDiagnosis();
  }

  onBtnDeleteClicked(index) {
    this.consultationFormService.removeDiagnosis(index);
  }
}
