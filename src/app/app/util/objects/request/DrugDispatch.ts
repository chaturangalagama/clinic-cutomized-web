import { DosageInstruction, Instruction } from '../DrugItem';

export interface DrugDispatch {
  dispatchDrugDetail: Array<DispatchDrugDetail>;
}

export interface DispatchDrugDetail {
  drugId: string;
  name: string;
  dose: Dose;
  instruction: Instruction;
  dosageInstruction: DosageInstruction;
  batchNumber: string;
  expiryDate: string;
  remark: string;
  payment: Payment;
  quantity?: number;
  duration?: number;
  priceAdjustment?: UserPaymentOption;
}

interface UserPaymentOption {
  decreaseValue: number;
  increaseValue: number;
  paymentType: string;
  remark: string;
}

export interface Payment {
  value: number;
  paymentType: string;
}

export interface Dose {
  uom: string;
  quantity?: number;
}
