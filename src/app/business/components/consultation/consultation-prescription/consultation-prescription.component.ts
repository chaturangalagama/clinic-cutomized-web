import { ApiCmsManagementService } from '../../../services/api-cms-management.service';
import { AlertService } from '../../../services/alert.service';
import { ChargeItemDescription } from '../../../../app/util/objects/ChargeItemDescription';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ConsultationSearchComponent } from './consultation-search/consultation-search.component';
import { BsModalService } from 'ngx-bootstrap';
import { DrugItem, DosageInstruction } from '../../../../app/util/objects/DrugItem';
import { Subject, timer } from 'rxjs';
import { FormArray, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TopDrugDescription } from '../../../../app/util/objects/DrugDescription';
import { StoreService } from '../../../services/store.service';
import { takeUntil, filter, distinctUntilChanged, tap, debounceTime, switchMap} from 'rxjs/operators';
@Component({
  selector: 'app-consultation-prescription',
  templateUrl: './consultation-prescription.component.html',
  styleUrls: ['./consultation-prescription.component.scss']
})
export class ConsultationPrescriptionComponent implements OnInit, OnDestroy {
  @Input() dispatchItemEntities: FormArray;
  @Input() index: number;
  @Output() onFirstChargeItemDetailsAdded = new EventEmitter<FormArray>();

  drugSelected: DrugItem;
  bsModalRef: BsModalRef;
  searchKey: FormControl;

  topDrugDescription: TopDrugDescription;
  chargeItemDescription: ChargeItemDescription;
  codesTypeahead = new Subject<string>();
  dosageInstructions: Array<DosageInstruction>;
  dosageInstruction: FormControl;
  totalPrice;
  loading = false;
  drugs = [];

  items = [];
  selected = [];

  private componentDestroyed: Subject<void> = new Subject();

  constructor(
    private store: StoreService,
    private modalService: BsModalService,
    private alertService: AlertService,
    private apiCmsManagementService: ApiCmsManagementService
  ) {}

  ngOnInit() {
    console.log('Pres_Array', this.dispatchItemEntities.controls);
    // this.resetChargeItemDescription();
    this.initialiseUI();
    this.initialiseStore();
    this.updateOverallPrice(true);
    this.onFilterInputChanged();
    this.store
      .getPatientVisitIdRefresh()
      .pipe(takeUntil(this.componentDestroyed),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(id => {
        if (id) {
            // this.dispatchItemEntities.controls = [];
            // this.totalPrice = 0;
          // const source = timer(500);
          // const subscribe = source.subscribe(res =>{
            this.initialiseUI();
            this.initialiseStore();
          // });

          // this.reset();
        }
      });


      this.dispatchItemEntities.valueChanges.subscribe( value =>{
        if(value.length === 0 ){
          this.resetChargeItemDescription();
          this.totalPrice = 0;
        }
      });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  initialiseStore() {
    this.items = this.store.activeChargeItemList;
  }

  initialiseUI() {
    this.searchKey = new FormControl();

    this.resetChargeItemDescription();

    if (!this.totalPrice) {
      this.totalPrice = 0;
    }
  }

  onTopChargeItemDescriptionChanged(event: ChargeItemDescription) {
    this.chargeItemDescription = event;
  }

  updateOverallPrice(event) {
    if (event) {
      this.totalPrice = 0;

      this.dispatchItemEntities.value.forEach(item => {
        console.log('dispatchItem: ', item);
        const price = parseFloat(item.adjustedTotalPrice);
        this.totalPrice += price;
      });

      // this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    }
  }

  onDelete(index) {
    this.dispatchItemEntities.removeAt(index);
    this.resetChargeItemDescription();
    this.updateOverallPrice(true);
  }

  resetChargeItemDescription() {
    console.log('RESET CON PRE:', this.chargeItemDescription);
    this.chargeItemDescription = new ChargeItemDescription();
  }

  onDrugSelect(option) {
    this.drugSelected = option;
    // this.dispatchItemEntities = this.caseChargeFormService.buildDrugDispatchDetails(option.item);
    this.searchKey.reset();
    this.searchKey.patchValue(null);
  }

  onSearchClicked() {
    const initialState = {
      title: 'Advanced Search',
      itemsFormArray: this.dispatchItemEntities
    };

    this.bsModalRef = this.modalService.show(ConsultationSearchComponent, {
      initialState,
      class: 'modal-lg',
      // backdrop: 'static',
      keyboard: false
    });

    this.bsModalRef.content.event.subscribe(data => {
      if (data !== 'close' && data.length > 0) {
        data.forEach(item => {
          this.onDrugSelect(item);
        });
      }
      this.bsModalRef.content.event.unsubscribe();
      this.bsModalRef.hide();
    });
  }

  onFilterInputChanged() {
    try {
      this.codesTypeahead
        .pipe(
          filter(input => {
            if (input.trim().length === 0) {
              this.items = this.store.activeChargeItemList;
              return false;
            } else {
              return true;
            }
          }),
          distinctUntilChanged((a, b) => {
            return a === b;
          }),
          tap(() => (this.loading = true)),
          debounceTime(200),
          switchMap((term: string) => {
            return this.apiCmsManagementService.searchListItemByKeyWord(term);
          })
        )
        // .takeUntil(this.componentDestroyed)
        .subscribe(
          data => {
            this.loading = false;
            if (data) {
              this.items = data.payload;
            }
          },
          err => {
            this.loading = false;
            this.alertService.error(JSON.stringify(err.error.message));
          }
        );
    } catch (err) {
      console.log('Search Diagnosis Error', err);
    }
  }
}
