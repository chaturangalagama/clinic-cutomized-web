import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-patient-add-confirmation',
  templateUrl: './patient-add-confirmation.component.html',
  styleUrls: ['./patient-add-confirmation.component.scss']
})
export class PatientAddConfirmationComponent implements OnInit {
  @Input() confirmationFormGroup: FormGroup;
  @Output() updateChange = new EventEmitter();
  consultationFormGroup: FormGroup;
  public event: EventEmitter<any> = new EventEmitter();

  title: string;

  // DATA BINDING
  consultationInfo = [
    {
      preferredDoctor: '',
      remarks: '',
      purposeOfVisit: '',
      visitDate: '',
      time: ''
    }
  ];
  visitDate: Date;
  time: string;
  preferredDoctor: string;
  remarks: string;
  purposeOfVisit: string;

  //HAN
  constructor(
    private fb: FormBuilder
  ) {
  }

  onBtnSaveClicked($event) {
    this.event.emit(this.consultationInfo);
  }

  ngOnInit() {
    this.consultationFormGroup = this.createConsultationPage();
    this.confirmationFormGroup = this.createConfirmationFormGroup();
    this.subscribeToValueChanges();
  }


  createConfirmationFormGroup(): FormGroup {
    return this.fb.group({
      selectedItems: ''
    });
  }

  subscribeToValueChanges() {
    this.consultationFormGroup.valueChanges
      .pipe(debounceTime(50), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(values => {
        this.remarks = values.remarks;
        this.visitDate = values.visitDate;
        this.purposeOfVisit = values.purposeOfVisit;
        this.preferredDoctor = values.preferredDoctor;
        this.time = moment(values.time).format('MM-DD-YYYY');

        this.consultationInfo[0].remarks = values.remarks;
        this.consultationInfo[0].purposeOfVisit = values.purposeOfVisit;
        this.consultationInfo[0].preferredDoctor = values.preferredDoctor;

        console.log("Tthis.consultationInfo[0]: ", this.consultationInfo[0]);
      });

  }

  createConsultationPage(): FormGroup {
    console.log('returning Consultation Page Form');
    return this.fb.group({
      visitDate: new FormControl(),
      time: '', // '930',
      preferredDoctor: '', // ,
      purposeOfVisit: '', // ,
      remarks: '' // ,
    });
  }
}
