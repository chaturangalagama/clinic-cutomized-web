import { AlertService } from '../../../services/alert.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiPatientVisitService } from '../../../services/api-patient-visit.service';
import { VitalFormService } from '../../../services/vital-form.service';
import { FormGroup, FormArray } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { VitalConfiguration } from '../../../../app/util/objects/response/VitalConfiguration';

@Component({
  selector: 'app-vital-add',
  templateUrl: './vital-add.component.html',
  styleUrls: ['./vital-add.component.scss']
})
export class VitalAddComponent implements OnInit {
  @Input() vitalFormGroup: FormGroup;

  vitalFromArray: FormArray;
  currentPatientId: string;
  isModal = false;
  public title: string;

  private vitals: Array<VitalConfiguration>;
  uom: string;

  constructor(
    private vitalFormService: VitalFormService,
    private apiPatientVisitService: ApiPatientVisitService,
    private store: StoreService,
    public bsModalRef: BsModalRef,
    private alert: AlertService
  ) {
    this.vitalFromArray = this.vitalFormService.vitalSignFormArray;
    if (!this.isModal) {
      this.currentPatientId = this.store.getPatientId();
    }
  }

  ngOnInit() {
    // this.vitals = this.store.vitalConfigurationsForAdd
    //   ? [...this.store.vitalConfigurationsForAdd]
    //   : new Array<VitalConfiguration>();

    this.vitals = this.vitalFormService.getVitals();

    this.storeReady();

    // Successfuly added new vitals
    this.vitalFormService.getaddVitalCompleted().subscribe(value => {
      if (value) {
        // Added successfully
        console.log('Vital Added Successfuly');
        this.alert.success('Data Added Successfully.');
      } else {
        // Added unsuccessfully
        console.log('Vital Added Unsuccessfuly');
        this.alert.error('Failed to Add Vital.');
      }
    });

    this.store.defaultVitals.forEach(item => {
      this.vitalFormService.addItem(null, this.currentPatientId, item.code);
      this.disabledItem(item.code);
    });

    // this.vitalFormService.addItem(null, this.currentPatientId, 'height');
    // this.disabledItem('height');
    // this.vitalFormService.addItem(null, this.currentPatientId, 'weight');
    // this.disabledItem('weight');
  }

  // public initVitals() {
  //   this.vitals = this.store.vitalConfigurationsForAdd
  //     ? JSON.parse(JSON.stringify(this.store.vitalConfigurationsForAdd))
  //     : new Array<VitalConfiguration>();
  // }

  storeReady() {
    this.store.getIsStoreReady().subscribe(val => {
      if (!this.isModal) {
        this.currentPatientId = this.store.getPatientId();
      }
      // this.vitals = [...this.store.vitalConfigurationsForAdd];
      this.vitalFormService.initVitals();
      this.vitals = this.vitalFormService.getVitals();
    });
  }

  disabledItem(key: string) {
    this.vitals.forEach(element => {
      if (element.code === key) {
        element.disabled = true;
      }
    });
  }

  addVital() {
    this.vitalFormService.addItem(null, this.currentPatientId);
  }

  saveVital() {
    this.vitalFormService.saveVital(this.currentPatientId);
  }
}
