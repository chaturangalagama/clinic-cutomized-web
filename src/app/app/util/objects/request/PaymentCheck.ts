export default class PaymentCheck{
  chargeDetails: Array<ChargeDetailsItem>;

  constructor( chargeDetails: Array<ChargeDetailsItem>){
    this.chargeDetails = chargeDetails || [];
  }
}

export class ChargeDetailsItem {
  itemId?: string;
  quantity?: number;

  constructor(itemId?: string, quantity?: number) {
    this.itemId = itemId || '';
    this.quantity = quantity || 0;
  }
}
