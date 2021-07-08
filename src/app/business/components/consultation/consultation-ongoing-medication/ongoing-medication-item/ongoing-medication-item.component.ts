import { INPUT_DELAY, DISPLAY_DATE_FORMAT } from '../../../../../app/util/constants/app.constants';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { StoreService } from '../../../../services/store.service';
@Component({
  selector: 'app-ongoing-medication-item',
  templateUrl: './ongoing-medication-item.component.html',
  styleUrls: ['./ongoing-medication-item.component.scss']
})
export class OngoingMedicationItemComponent implements OnInit {
  @Input() item: FormGroup;
  searchKey: FormControl;
  minDate: Date;
  items;
  codesTypeahead = new Subject<string>();
  constructor(private store: StoreService) { }
  types = [{
    value: 'SHORT_TERM',
    label: 'SHORT_TERM'
  }, {
    value: 'LONG_TERM',
    label: 'LONG_TERM'
  }, {
    value: 'ACTIVE',
    label: 'ACTIVE'
  }, {
    value: 'INACTIVE',
    label: 'INACTIVE'
  }];

  ngOnInit() {
    this.searchKey = new FormControl();
    this.init();

    this.item.get('startDate').valueChanges.pipe(map(d => {
      d = moment(d, DISPLAY_DATE_FORMAT).format(DISPLAY_DATE_FORMAT);
      const isValid = moment(d, DISPLAY_DATE_FORMAT).isValid();
      return isValid ? d : '';
    })).subscribe(data => {
      this.item.get('startDate').patchValue(data, { emitEvent: false });
    });
  }

  init(){
    this.minDate = new Date();
    this.items = this.store.activeChargeItemList;
    console.log("items: ",this.items);
    this.patchItem();

  }

  patchItem(){
    const itemCode = this.item.get('itemCode').value;
    if(itemCode){
      const itemFound = this.store.findActiveItem(itemCode);
      this.item.get('itemCode').patchValue([itemCode]);
      console.log("#007 itemFound: ",itemFound);
      this.items = [itemFound];
      this.onDrugSelect(itemFound);
    }
  }

  onDrugSelect(event){
    console.log("drug selected: ",event);
    this.item.get('itemCode').patchValue(event.item.code);
    this.item.get('medicationName').patchValue(event.item.name);
  }
}
