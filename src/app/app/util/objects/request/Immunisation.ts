
export interface ImmunisationGiven {
    immunisation: Array<Immunisation>;
}

export interface Immunisation {
    serviceId: string;
    serviceItemId: string;
    priceAdjustment: DiscountGiven;
    batchNumber: string;
    nextDose: string;
    vaccinationId: string;
    doseId: string;
}

export interface DiscountGiven {
    decreaseValue: number;
    increaseValue: number;
    paymentType: string;
}
