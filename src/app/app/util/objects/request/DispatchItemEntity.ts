interface DispatchItemEntity {
    itemId?: string;
    dosageUom?: string;
    instruct?: string;
    duration?: number;
    dosage?: number;
    quantity?: number;
    oriTotalPrice?: string;
    batchNo?: string;
    expiryDate?: string;
    remarks?: string;
    itemPriceAdjustment?: ItemPriceAdjustment;
    itemCode?: string;
    itemName?: string;
  }
  
  interface ItemPriceAdjustment {
    adjustedValue?: string;
    paymentType?: string;
    remark?: string;
  }