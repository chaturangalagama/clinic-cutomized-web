
// General Libraries
import { Component, OnInit, Input, EventEmitter, Output, forwardRef } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { distinctUntilChanged, debounceTime, map, switchMap, tap, filter } from 'rxjs/operators';
import * as moment from 'moment';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { take } from 'rxjs/operators';
// Services
import { mulitplierValidator } from '../../../../services/consultation-form.service';
import { LoggerService } from '../../../../../app/services/logger.service';
import { AlertService } from '../../../../services/alert.service';
import { StoreService } from '../../../../services/store.service';
import { ApiPatientVisitService } from '../../../../services/api-patient-visit.service';
import { ApiCmsManagementService } from '../../../../services/api-cms-management.service';
import { UtilsService } from '../../../../../app/services/utils.service';

// Objects
import { ChargeItemDescription } from '../../../../../app/util/objects/ChargeItemDescription';
import { DISPLAY_DATE_FORMAT, INPUT_DELAY } from '../../../../../app/util/constants/app.constants';
// import { ChargeDetailsItem}  from '../../../../objects/request/PaymentCheck';
import { Uom } from '../../../../../app/util/objects/Uom';
import { DrugItem, Instruction, DosageInstruction } from '../../../../../app/util/objects/DrugItem';
import { DisplayDollarPipe } from '../../../../../app/util/pipes/display-dollar.pipe';

@Component({
  selector: 'app-prescription-item',
  templateUrl: './prescription-item.component.html',
  styleUrls: ['./prescription-item.component.scss']
})
export class PrescriptionItemComponent implements OnInit {
  @Input() prescriptionItem: FormGroup;
  @Input() index: number;
  @Output() onDelete = new EventEmitter<number>();
  @Output() updatePrice = new EventEmitter<boolean>();
  @Output() onTopChargeItemDescriptionChanged = new EventEmitter<ChargeItemDescription>();

  loading = false;
  isCollapsed = false;
  isDiscountShown = false;

  errors = [];
  baseUom = [];
  chargeItems = [];
  selectedItems = [];

  code;
  itemSelected;
  dosageMin = 1;
  defaultQty = 1;
  FIXED_DECIMAL = 2;
  salesUom: string = '';
  price: number;
  totalPrice: FormControl;
  unitPriceDisplay: string;
  // adjustedUnitPrice: FormControl;
  adjustedUnitPriceDisplay: string;
  isServiceOrTest: boolean;

  codesTypeahead = new Subject<string>();
  topChargeItemDescription: ChargeItemDescription;
  instructions: Array<Instruction>;
  dosageInstructions: Array<DosageInstruction>;
  dosageInstruction: FormControl;
  currentDosageInstruction: string;
  dollarMask: DisplayDollarPipe;

  constructor(
    private apiCmsManagementService: ApiCmsManagementService,
    private apiPatientVisitService: ApiPatientVisitService,
    private store: StoreService,
    private utils: UtilsService,
    private alertService: AlertService,
    private logger: LoggerService
  ) {}

  ngOnInit() {
    console.log('prescriptionItem:', this.prescriptionItem);

    if (this.prescriptionItem.get('drugId').value !== '') {
      this.initGeneralDetails();
      this.initItemDetails();
    }

    this.subscribeChangeOnItem();

    this.setMandatoryFields();

    this.disableFields();

    this.onFilterInputChanged();

    this.updatePrice.emit(true);
  }

  initItemDetails() {
    // Initialise Prices

    // Update Item Code Name, Unit Price, Adjusted Unit Prices, Item Description
    const item = this.chargeItems.find(item => {
      // console.log("pre-it item: ",item);
      return item.item.id === this.prescriptionItem.get('drugId').value;
    });

    console.log('pre-it item: ', item);

    if (item) {
      this.itemSelected = item ? item.item : [];
      this.code = this.itemSelected.code || 'Not available';

      const purchaseQty = this.prescriptionItem.get('purchaseQty').value;
      if (purchaseQty === 0 || purchaseQty === '') {
        console.log('pre-it: purchaseQty is 0');
        // this.getCaseItemPrice(1);
      }

      this.salesUom = this.itemSelected.salesUom || '';

      this.topChargeItemDescription = {
        charge: this.itemSelected.name || '',
        cautionary: this.itemSelected.precautionaryInstructions || '',
        sig: (this.prescriptionItem.get('instruction').value || { instruct: '' }).instruct || '',
        remarks: this.prescriptionItem.get('remark').value || '',
        qty: this.prescriptionItem.get('purchaseQty').value || '',
        uom: this.itemSelected.salesUom || 0
      };

      this.updateTopDescription();
      this.patchDosageInstruction();
    }
  }

  initGeneralDetails() {
    this.topChargeItemDescription = {
      charge: '',
      cautionary: '',
      sig: '',
      remarks: '',
      qty: '',
      uom: ''
    };
    this.chargeItems = this.store.activeChargeItemList;
    this.dosageInstructions = this.store.getDosageInstructions();
    this.dosageInstruction = new FormControl();
    this.instructions = this.store.getInstructions();
    this.baseUom = this.store.uoms;

    console.log('Charge Active Items : ', this.chargeItems);
  }

  calculateCost(qty) {
    let sellingPrice = this.prescriptionItem.get('unitPrice').get('price').value * 100;
    let oriTotalPrice = this.prescriptionItem.get('oriTotalPrice');
    let adjustedUnitValue = this.prescriptionItem.get('priceAdjustment').get('adjustedValue').value
      ? this.prescriptionItem.get('priceAdjustment').get('adjustedValue').value
      : 0;
    let adjustedTotalPrice = this.prescriptionItem.get('adjustedTotalPrice');
    if (qty && sellingPrice) {
      this.patchAmount(oriTotalPrice, qty, sellingPrice, false);
      this.patchAmount(adjustedTotalPrice, qty, sellingPrice + adjustedUnitValue, true);
      this.updatePrice.emit(true);
    }
  }

  adjUnitPriceFallsBelowMinimum(value) {
    console.log('unit price fell below 0.01');
    return value < 1;
  }

  patchAmount(formControl: AbstractControl, qty, price, toDollars: boolean) {
    let amount = qty * +price;
    if (toDollars) {
      amount = Number((amount / 100).toFixed(2));
    }
    formControl.patchValue(amount);
  }

  patchAdjustedUnitPrice() {
    const originalTotalPriceInCents = this.prescriptionItem.get('oriTotalPrice').value;
    const adjustedTotalPriceInCents = this.prescriptionItem.get('adjustedTotalPrice').value * 100;
    const adjustedAmount = this.prescriptionItem.get('priceAdjustment').get('adjustedValue');
    const qty = this.prescriptionItem.get('purchaseQty').value
      ? this.prescriptionItem.get('purchaseQty').value
      : this.defaultQty;
    let adjustedUnitPriceInCents = adjustedTotalPriceInCents / qty;
    const adjustedAmountInCents = (adjustedTotalPriceInCents - originalTotalPriceInCents) / qty;
    if (adjustedAmountInCents) {
      this.prescriptionItem.get('priceAdjustment').get('remark').setValidators([Validators.required]);
      this.prescriptionItem.get('priceAdjustment').get('remark').markAsTouched();
      this.prescriptionItem.get('priceAdjustment').get('remark').updateValueAndValidity();
    } else {
      this.prescriptionItem.get('priceAdjustment').get('remark').setValidators(null);
      this.prescriptionItem.get('priceAdjustment').get('remark').markAsTouched();
      this.prescriptionItem.get('priceAdjustment').get('remark').updateValueAndValidity();
    }

    if (this.adjUnitPriceFallsBelowMinimum(adjustedUnitPriceInCents)) {
      adjustedUnitPriceInCents = 1;
      this.patchAmount(this.prescriptionItem.get('adjustedTotalPrice'), qty, adjustedUnitPriceInCents, true);
      alert('Adj. Unit Price falls below minimum ($0.01). Readjusting Total Amount');
    }

    // this.adjustedUnitPrice.patchValue(adjustedUnitPriceInCents);
    this.adjustedUnitPriceDisplay = (adjustedUnitPriceInCents / 100).toFixed(2);
    adjustedAmount.patchValue(adjustedAmountInCents);

    this.updatePrice.emit(true);
  }

  subscribeChangeOnItem() {
    // Main Form Changes for Copy Prescription

    // this.prescriptionItem.valueChanges.pipe(debounceTime(INPUT_DELAY)).subscribe(data => {
    //   // if (!this.prescriptionItem.valid && this.isCollapsed) {
    //  if (this.isCollapsed) {
    //     this.rowClicked();
    //   }
    // });
    this.fillItemValues(this.itemSelected);

    this.prescriptionItem.valueChanges
      .pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged((a, b) => {
          return a.id === b.id;
        })
      )
      .subscribe(data => {
        console.log('new Form Group inserted', data);
        // Retrieve price
        this.updatePrice.emit(true);
        // this.fillItemValues(data);
        // this.updateInventories(); ---commented-10/07/2021---
      });

    // Instruction Changes
    this.prescriptionItem
      .get('instruction')
      .get('code')
      .valueChanges.pipe(debounceTime(INPUT_DELAY))
      .subscribe(data => {
        this.updateInstructionToTopDescription(this.prescriptionItem.get('instruction').value);
      });

    // Quantity Changes
    this.prescriptionItem
      .get('dose')
      .get('uom')
      .valueChanges.pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged((a, b) => {
          return a === b;
        })
      )
      .subscribe(data => {
        this.topChargeItemDescription.uom = data;
        this.updateTopDescription();
      });

    // Dosage Instruction Quantity Changes
    this.prescriptionItem
      .get('dose')
      .get('quantity')
      .valueChanges.pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged()
      )
      .subscribe(value => {
        // this.patchDosageInstruction();
      });

    this.prescriptionItem
      .get('purchaseQty')
      .valueChanges.pipe(debounceTime(INPUT_DELAY))
      .subscribe(data => {
        let qty = data;
        if (data) {
          this.topChargeItemDescription.qty = qty;
          // this.adjustedUnitPrice.patchValue(0);
          this.calculateCost(qty);
          // this.updateInventories();---commented-10/07/2021---
        }
      });

    // Dosage Instruction Changes
    this.prescriptionItem
      .get('dosageInstruction')
      .get('code')
      .valueChanges.pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged()
      )
      .subscribe(value => {
        const dosageInstructionInstruct = this.prescriptionItem.get('dosageInstruction').get('instruct');
        this.getDosageInstruction(value);
        this.updateDosageInstructionToTopDescription(dosageInstructionInstruct.value);

        if (dosageInstructionInstruct.value && dosageInstructionInstruct.value.includes('#')) {
          // this.setDosageValidators();
          this.patchDosageInstruction();
        } else {
          this.disableDosageQuantity();
        }
      });

    // Duration Changes
    this.prescriptionItem
      .get('duration')
      .valueChanges.pipe(debounceTime(INPUT_DELAY))
      .subscribe(data => {
        console.log('duration', data);
      });

    // convert correct date format
    this.prescriptionItem
      .get('expiryDate')
      .valueChanges.pipe(
        map(d => {
          d = moment(d, DISPLAY_DATE_FORMAT).format(DISPLAY_DATE_FORMAT);
          const isValid = moment(d, DISPLAY_DATE_FORMAT).isValid();
          return isValid ? d : '';
        })
      )
      .subscribe(data => {
        this.prescriptionItem.get('expiryDate').patchValue(data, { emitEvent: false });
      });

    // Remark Changes
    this.prescriptionItem
      .get('remark')
      .valueChanges.pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.updateRemarkToTopDescription(value);
      });

    this.prescriptionItem
      .get('adjustedTotalPrice')
      .valueChanges.pipe(
        debounceTime(INPUT_DELAY),
        distinctUntilChanged()
      )
      .subscribe(valueInDollars => {
        // let valueInCents = valueInDollars * 100;
        if (valueInDollars && valueInDollars !== 0) {
          this.patchAdjustedUnitPrice();
        } else {
          this.prescriptionItem.get('adjustedTotalPrice').patchValue(0);
        }
      });
  }

  onDosageInstructionSelect(option) {
    if (option) {
      console.log('Dosage Instruction', option);
      // this variable to store the original instruction and to be used in case replacement is needed
      this.currentDosageInstruction = option.instruct;
      const dosageInstruct = this.prescriptionItem.get('dosageInstruction').get('instruct');

      dosageInstruct.patchValue(option.instruct);
    }
  }

  onInstructionSelect(option) {
    this.prescriptionItem.get('instruction').patchValue(option);
    console.log('instruction option', option);

    this.updateInstructionToTopDescription(option);
  }
  /** ng-select change detection */

  resetFields(option: any) {
    this.prescriptionItem.get('drugId').patchValue(option.id);
    this.prescriptionItem.get('expiryDate').patchValue(this.utils.getDBDateOnly(''));
    this.prescriptionItem
      .get('instruction')
      .get('code')
      .patchValue('');
    this.prescriptionItem
      .get('instruction')
      .get('instruct')
      .patchValue('');
    this.prescriptionItem.get('duration').patchValue('');
    this.prescriptionItem
      .get('dosageInstruction')
      .get('code')
      .patchValue('');
    this.prescriptionItem
      .get('dosageInstruction')
      .get('instruct')
      .patchValue('');
    // Inventory values reset
    this.prescriptionItem.patchValue({
      batchNumber: '',
      expiryDate: '',
      stock: 9999
    });
  }

  patchDosageInstruction() {
    const code = this.prescriptionItem.get('dosageInstruction').get('code');
    const instruction = this.prescriptionItem.get('dosageInstruction').get('instruct');
    const doseQty = this.prescriptionItem.get('dose').get('quantity');

    this.getDosageInstruction(code.value);

    if(instruction.value===''){
      this.getDosageInstruction(code.value);
    }else{
      if (instruction.value.includes('#')) {
        this.setDosageValidators();
        const instruct = doseQty.value
          ? instruction.value.replace('#', doseQty.value)
          : this.currentDosageInstruction;
        this.updateDosageInstructionToTopDescription(instruct);
      } else{
        this.disableDosageQuantity();
      }
    }
  }

  getDosageInstruction(code){
    const instruction = this.prescriptionItem.get('dosageInstruction').get('instruct');
    if(instruction.value === '' || instruction.value === undefined){
         const dosageInstruction = this.store.getDosageInstructionByCode(code);
         if(dosageInstruction){
           instruction.patchValue(dosageInstruction.instruct);
         }
    }
  }

  disableDosageQuantity(){
    const doseQty = this.prescriptionItem.get('dose').get('quantity');
    doseQty.setValidators(null);
    doseQty.markAsTouched();
    doseQty.updateValueAndValidity();
    doseQty.reset();
    doseQty.disable();
  }

  updateTopDescription() {
    console.log('emit touch');
    this.onTopChargeItemDescriptionChanged.emit(this.topChargeItemDescription);
  }

  updateDrugToTopDescription(chargeItem) {
    console.log('pre-it this charge item description: ', this.topChargeItemDescription);
    this.topChargeItemDescription.charge = chargeItem['name'] || '';
    this.topChargeItemDescription.uom = chargeItem['salesUom'] || '';
    this.updateTopDescription();
  }

  updateDosageInstructionToTopDescription(dosageInstruction) {
    if (dosageInstruction) {
      this.topChargeItemDescription.dosageInstruction = dosageInstruction + '/';
    } else {
      this.topChargeItemDescription.dosageInstruction = '';
    }
    this.updateTopDescription();
  }

  updateCautionariesToTopDescription(chargeItem) {
    this.topChargeItemDescription.cautionary = chargeItem['precautionaryInstructions'];
    this.updateTopDescription();
  }

  updateInstructionToTopDescription(chargeItem) {
    const item = this.instructions ? this.instructions.filter(x => x.code === chargeItem.code) : [];
    if (item[0]) {
      this.topChargeItemDescription.sig = item[0]['instruct'];
      this.updateTopDescription();
    }
  }

  updateRemarkToTopDescription(remark) {
    this.topChargeItemDescription.remarks = remark;
    this.updateTopDescription();
  }

  deletePressed() {
    console.log('emit delete', this.index);
    this.onDelete.emit(this.index);
  }

  onFilterInputChanged() {
    try {
      this.codesTypeahead
        .pipe(
          filter(input => {
            if (input.trim().length === 0) {
              this.logger.info('input is 0');
              // this.drugs = this.store.drugList;
              return false;
            } else {
              return true;
            }
          }),
          distinctUntilChanged((a, b) => {
            this.logger.info('input is 1');
            return a === b;
          }),
          tap(() => (this.loading = true)),
          debounceTime(200),
          switchMap((term: string) => {
            return this.apiCmsManagementService.searchDrugs(term);
          })
        )
        .subscribe(
          data => {
            this.loading = false;
            console.log('DATA', data);

            if (data) {
              // this.drugs = data.payload;
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

  disableFields() {
    if (this.isService()) {
      const instructionCode = this.prescriptionItem.get('instruction').get('code');
      const doseUom = this.prescriptionItem.get('dose').get('uom');
      const doseQty = this.prescriptionItem.get('dose').get('quantity');
      const duration =  this.prescriptionItem.get('duration');
      const dosageInstruction = this.prescriptionItem.get('dosageInstruction');
      this.resetAndDisable(dosageInstruction);
      this.resetAndDisable(instructionCode);
      this.resetAndDisable(doseUom);
      this.resetAndDisable(doseQty);
      this.resetAndDisable(duration);
    }
  }

  resetAndDisable(control: AbstractControl){
    control.reset();
    control.disable();
  }
  // disableFields() {
  //   if (this.isService()) {
  //     this.prescriptionItem
  //       .get('instruction')
  //       .get('code')
  //       .reset();
  //     this.prescriptionItem
  //       .get('instruction')
  //       .get('code')
  //       .disable();
  //     this.prescriptionItem
  //       .get('dose')
  //       .get('uom')
  //       .reset();
  //     this.prescriptionItem
  //       .get('dose')
  //       .get('uom')
  //       .disable();
  //     this.prescriptionItem
  //       .get('dose')
  //       .get('quantity')
  //       .reset();
  //     this.prescriptionItem
  //       .get('dose')
  //       .get('quantity')
  //       .disable();
  //     this.prescriptionItem
  //       .get('dosageInstruction')
  //       .get('code')
  //       .disable();
  //     this.prescriptionItem.get('duration').reset();
  //     this.prescriptionItem.get('duration').disable();
  //   } else {
  //     // this.isServiceOrTest = false;
  //   }
  // }

  isService() {
    console.log('#001 itemSelected:', this.itemSelected);
    if (this.itemSelected) {
      const itemType = this.itemSelected.itemType;
      if (itemType === 'LABORATORY' || itemType === 'SERVICE' ||  itemType === 'VACCINATION') {
        return true;
      } else {
        return false;
      }
    }
  }

  setMandatoryFields() {
    if (!this.isService()) {
      console.log('set mandatory');
      this.prescriptionItem
        .get('instruction')
        .get('code')
        .setValidators([Validators.required]);
      this.prescriptionItem
        .get('instruction')
        .get('code')
        .markAsTouched({ onlySelf: true });
      this.prescriptionItem
        .get('instruction')
        .get('code')
        .updateValueAndValidity();
      this.prescriptionItem.get('purchaseQty').setValidators([Validators.required, Validators.min(1)]);
      this.prescriptionItem.get('purchaseQty').markAsTouched({ onlySelf: true });
      this.prescriptionItem.get('purchaseQty').updateValueAndValidity();

      if (
        this.prescriptionItem
          .get('dosageInstruction')
          .get('instruct')
          .value.includes('#')
      ) {
        this.setDosageValidators();
      } else {
        this.prescriptionItem
          .get('dose')
          .get('quantity')
          .disable();
      }

      this.prescriptionItem
        .get('expiryDate')
        .setValidators([Validators.required, Validators.pattern('((0[1-9]|[12]\\d|3[01])-(0[1-9]|1[0-2])-\\d{4})')]);
      this.prescriptionItem.get('expiryDate').markAsTouched({ onlySelf: true });
      this.prescriptionItem.get('expiryDate').updateValueAndValidity();
    }
  }

  setDosageValidators() {
    const uomInput = this.prescriptionItem
      .get('dose')
      .get('uom')
      .value.toLocaleLowerCase();

    const uom: Uom = this.store.uoms.find(item => item.uom.toLowerCase() === uomInput) || new Uom();
    this.dosageMin = uom.multiply;

    this.prescriptionItem
      .get('dose')
      .get('quantity')
      .enable();
    this.prescriptionItem
      .get('dose')
      .get('quantity')
      .setValidators([Validators.required, Validators.min(this.dosageMin), mulitplierValidator(this.dosageMin)]);
    this.prescriptionItem
      .get('dose')
      .get('quantity')
      .markAsTouched({ onlySelf: true });
    this.prescriptionItem
      .get('dose')
      .get('quantity')
      .updateValueAndValidity();
  }

  updateInventories() {
    console.log('**** updateInventories ****');

    const drugId = this.prescriptionItem.get('drugId').value;
    const quantity = this.prescriptionItem.get('purchaseQty').value;

    const drugUsage = {
      inventoryType: 'DRUG',
      itemId: drugId,
      quantity: quantity
    };
    this.apiPatientVisitService.getInventory(this.store.getClinicId(), [drugUsage]).subscribe(
      res => {
        const inventories = res.payload;
        const inventory = inventories.find(iv => iv.itemId === drugId);

        const batchNo = inventory.batchNo ? inventory.batchNo : '';
        const stock = inventory.remainingQuantity ? inventory.remainingQuantity : 9999;
        const isDateValid = moment(inventory.expiryDate, DISPLAY_DATE_FORMAT).isValid();
        const expiryDate = isDateValid
          ? moment(inventory.expiryDate, 'YYYY-MM-DD').format(DISPLAY_DATE_FORMAT)
          : moment(new Date()).format(DISPLAY_DATE_FORMAT);

        // Inventory Invalid msg will be shown if any field is mising
        const inventoryInvalid = batchNo && expiryDate && stock ? '' : 'The inventory data may not be correct.';
        this.prescriptionItem.patchValue({
          batchNumber: batchNo || '',
          expiryDate: expiryDate || moment(new Date()).format(DISPLAY_DATE_FORMAT),
          stock,
          inventoryInvalid
        });
      },
      err => {
        this.prescriptionItem.patchValue({
          // batchNumber: 'N/A',
          batchNumber: '',
          expiryDate: moment(new Date()).format(DISPLAY_DATE_FORMAT),
          stock: 9999,
          inventoryInvalid: 'The item is not available in the inventory.'
        });
      }
    );
  }

  rowClicked() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {

      console.log("expanded;");
      // if (!this.prescriptionItem.touched) {
      //        console.log("prescription item has not been touched, fill in;");
      //   this.fillItemValues(this.itemSelected);
      // } else{
      //   console.log("prescription item has been touched, fill in;");

      // }

      this.fillItemValues(this.itemSelected);
    }

    this.updateTopDescription();
  }

  fillItemValues(data) {
    console.log('fillItemValues', data);
    const drugId = data.id;
    if (drugId) {
      this.apiCmsManagementService.searchListItem(drugId).subscribe(
        pagedData => {
          if (pagedData) {
            let chargeItemDetail = pagedData['payload'].item;
            console.log('chargeItemDetail 001: ', chargeItemDetail);
            this.salesUom = chargeItemDetail.salesUom;
            this.prescriptionItem.get('drugId').patchValue(chargeItemDetail['id']);

            if (this.salesUom) {
              this.prescriptionItem
                .get('dose')
                .get('uom')
                .patchValue(this.salesUom);
            }
            const doseUOM = this.prescriptionItem.get('dose').get('uom');
            const instructionCode = this.prescriptionItem.get('instruction').get('code');
            const dosageInstructionCode = this.prescriptionItem.get('dosageInstruction').get('code');
            const purchaseQty = this.prescriptionItem.get('purchaseQty');

            if (!this.isService()) {
              if(doseUOM.value ==='' ){doseUOM.patchValue(chargeItemDetail['baseUom'])};
              if(instructionCode.value ==='' ){instructionCode.patchValue(chargeItemDetail['frequencyCode'])};
              if(dosageInstructionCode.value ==='' ){dosageInstructionCode.patchValue(chargeItemDetail['dosageInstructionCode'])};
              this.prescriptionItem.get('duration').patchValue(chargeItemDetail['frequency']);
            }

            if (purchaseQty.value === '' || purchaseQty.value === 0) {
              purchaseQty.patchValue(this.defaultQty);
            }

            this.updateDrugToTopDescription(chargeItemDetail);
            this.updateCautionariesToTopDescription(chargeItemDetail);
            this.updateRemarkToTopDescription(this.prescriptionItem.get('remark').value);
            // this.getCaseItemPrice(this.prescriptionItem.get('purchaseQty').value);

            this.disableFields();
            this.setMandatoryFields();

          }
          return pagedData;
        },
        err => {
          this.alertService.error(JSON.stringify(err.error.message));
        }
      );
    }
  }
}
