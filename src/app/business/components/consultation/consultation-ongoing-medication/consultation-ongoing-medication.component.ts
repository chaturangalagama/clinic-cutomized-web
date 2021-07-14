import { AlertService } from '../../../services/alert.service';
import { ApiPatientInfoService } from '../../../services/api-patient-info.service';
import { INPUT_DELAY, DISPLAY_DATE_FORMAT } from '../../../../app/util/constants/app.constants';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { OngoingMedicationItemComponent } from './ongoing-medication-item/ongoing-medication-item.component';
import { Component, OnInit, Input} from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { debounceTime, distinctUntilChanged, debounce, takeUntil, take, switchMap } from 'rxjs/operators';
// import { moment } from 'ngx-bootstrap/chronos/test/chain';
import * as moment from 'moment';
import {Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-consultation-ongoing-medication',
  templateUrl: './consultation-ongoing-medication.component.html',
  styleUrls: ['./consultation-ongoing-medication.component.scss']
})
export class ConsultationOngoingMedicationComponent implements OnInit {

  @Input() needRefresh: Subject<boolean>;
  @Output() public getOngoingMedication = new EventEmitter<string>();
  patientInfoRefresh: BehaviorSubject<any>;
  itemFormGroup: FormGroup;
  patientInfo;
  constructor(private fb: FormBuilder,
              private store: StoreService,
              private apiPatientInfoService: ApiPatientInfoService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.itemFormGroup = this.fb.group({
      itemsFormArray : this.fb.array([])
    });

    this.apiPatientInfoService.searchBy('systemuserid', this.store.getPatientId())
      .pipe(
        distinctUntilChanged(),
        debounceTime(INPUT_DELAY)
      )
      .subscribe(
        info => {
            this.reset();
            this.patientInfo = info.payload;
            const onGoingMedications  = info.payload['onGoingMedications'] as Array<any>;
            this.populateData(onGoingMedications);
        },
        err => {
          this.alertService.error(JSON.stringify(err));
        }
      );
    //Previous Code
    this.patientInfoRefresh = this.store.getPatientInfoRefresh();
    this.patientInfoRefresh.subscribe( info =>{
      this.reset();
      this.patientInfo = info;
      const onGoingMedications  = info.onGoingMedications as Array<any>;
      if(onGoingMedications!=undefined){
        this.populateData(onGoingMedications);
      }
    });
  }


  populateData(onGoingMedications){
    const itemsFormArray = this.itemFormGroup.get('itemsFormArray') as FormArray;
    onGoingMedications.forEach( medication =>{
      const medFG = this.fb.group(medication);
      itemsFormArray.push(medFG);
    });
  }

  addItem(){
    const item = this.fb.group({
      itemCode: '',
      medicationName:'',
      type:'',
      startDate: moment().format(DISPLAY_DATE_FORMAT)
    });

    const formArray = <FormArray>this.itemFormGroup.get('itemsFormArray');
    formArray.push(item);
  }

  onBtnAddClicked(){
    this.addItem();
  }

  onBtnSaveClicked(){
    this.checkOngoingMedication();
    // this.apiPatientInfoService.update(this.store.getPatientId(), this.patientInfo)
    //   .pipe(debounceTime(INPUT_DELAY))
    //   .subscribe( res =>{
    //     const {payload} = res;
    //     delete payload['id'];
    //     delete payload['fileMetaData'];
    //     this.patientInfoRefresh.next(res.payload);
    //   },
    //   err => {
    //     this.alertService.error(JSON.stringify(err.error.message));
    //   });
  }

  checkOngoingMedication(){
    const itemsFormArray = this.itemFormGroup.get('itemsFormArray') as FormArray;
    let indexesToBeRemoved = [];
    itemsFormArray.controls.map((item,index) =>{
      if(item.get('itemCode').value ===''){
        indexesToBeRemoved.push(index);
      }
      // if(item.get('startDate').value){
      //   const startDate = item.get('startDate').value;
      //   console.log("#006 startDate:",startDate);
      //   console.log("moment(startDate, DISPLAY_DATE_FORMAT): ",moment(startDate, DISPLAY_DATE_FORMAT));
      //   if(!moment(startDate, DISPLAY_DATE_FORMAT)){

      //     item.get('startDate').patchValue(moment(startDate).format(DISPLAY_DATE_FORMAT));
      //   }
      // }
    });

    indexesToBeRemoved.sort(function(a, b) {
      return b - a;
    });

    indexesToBeRemoved.forEach( element =>{
      itemsFormArray.removeAt(element);
    })

    this.patientInfo.onGoingMedications = itemsFormArray.value;

    delete this.patientInfo['id'];
    delete this.patientInfo['fileMetaData'];

    this.apiPatientInfoService.update(this.store.getPatientId(), this.patientInfo)
    .pipe(debounceTime(INPUT_DELAY))
    .subscribe( res =>{
      const {payload} = res;
      delete payload['id'];
      delete payload['fileMetaData'];
      this.patientInfoRefresh.next(res.payload);
      this.getOngoingMedication.emit(res.payload.onGoingMedications);
      // this.refreshStore();
    },
    err => {
      this.alertService.error(JSON.stringify(err.error.message));
    });
  }
  // subscribeOnChange(){
  //   const itemsFormArray = this.itemFormGroup.get('itemsFormArray') as FormArray;
  //   itemsFormArray.valueChanges.pipe(distinctUntilChanged((a, b)=>{ return a === b})).subscribe( value =>{

  //   });
  // }


  reset(){
    const itemsFormArray = this.itemFormGroup.get('itemsFormArray') as FormArray;
    while(itemsFormArray.length > 0){
      itemsFormArray.removeAt(0);
    }
  }
}


