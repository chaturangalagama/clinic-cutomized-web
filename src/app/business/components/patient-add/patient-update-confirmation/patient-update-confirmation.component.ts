import { ApiPatientInfoService } from '../../../services/api-patient-info.service';
import { StoreService } from '../../../services/store.service';

import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-patient-update-confirmation',
    templateUrl: './patient-update-confirmation.component.html'
})
export class PatientUpdateConfirmationComponent implements OnInit {
    @Input() confirmationFormGroup: FormGroup;

    bsModalRef: BsModalRef;
    public event: EventEmitter<any> = new EventEmitter();

    title: string;

    constructor(
        private modalService: BsModalService,
        private fb: FormBuilder,
        private store: StoreService,
        private apiPatientInfoService: ApiPatientInfoService
    ) { }

    ngOnInit() {
    }
}
