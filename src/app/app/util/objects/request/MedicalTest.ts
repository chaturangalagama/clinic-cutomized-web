import { MaxDiscount } from '../response/MaxDiscount';
export interface IssuedMedicalTest {
    issuedMedicalTestDetails: IssuedMedicalTestDetail[];
}

export interface IssuedMedicalTestDetail {
    testId: string;
    suggestedLocation: string;

    priceAdjustment: MaxDiscount;
}

export interface Payment {
    value: number;
    paymentType: string;
}
