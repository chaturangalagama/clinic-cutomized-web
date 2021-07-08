import { memoTemplate } from '../../app/util/templates/memo';
import { NgxPermissionsService } from 'ngx-permissions';

import { Injectable } from '@angular/core';

import { ApiPatientVisitService } from './api-patient-visit.service';
import { AlertService } from './alert.service';
import { ApiCmsManagementService } from './api-cms-management.service';
import { StoreService } from './store.service';

import { refferalLetterTemplate } from '../../app/util/templates/refferal.letter';

@Injectable()
export class PrintTemplateService {
  paymentInfo;

  clinic;

  constructor(
    private apiPatientVisitService: ApiPatientVisitService,
    private permissionsService: NgxPermissionsService,
    private apiCmsManagementService: ApiCmsManagementService,
    private alertService: AlertService,
    private store: StoreService
  ) {}

  ngOnInit() {
    this.clinic = this.store.clinic;
  }

  onBtnPrintPatientLabelClicked(patientInfo) {
    this.apiCmsManagementService.searchLabel('PATIENT_LABEL').subscribe(
      res => {
        const template = JSON.parse(res.payload.template);
        const patient = patientInfo;
        const clinic = this.store.clinic;
        console.log('patient id: ', patient);
        const html = template
          .replace(
            '{{clinicAddress}}',
            `${clinic.address.address.toUpperCase() || ''}, SINGAPORE ${clinic.address.postalCode}`
          )
          .replace('{{clinicTel}}', clinic.contactNumber)
          .replace('{{clinicFax}}', clinic.faxNumber)
          .replace('{{id}}', patient.patientNumber)
          .replace('{{name}}', patient.name.toUpperCase())
          .replace('{{gender}}', patient.gender)
          .replace('{{dob}}', patient.dob)
          .replace('{{userIdType}}', patient.userId.idType)
          .replace('{{userId}}', patient.userId.number)
          .replace('{{contact}}', patient.contactNumber.number)
          .replace(
            '{{address}}',
            `${patient.address.address}, ${patient.address.postalCode}`
            // `${patient.address.address}, ${patient.address.country} ${patient.address.postalCode}`
          )
          .replace('{{company}}', patient.company ? patient.company.name : '')
          .replace(
            '{{allergies}}',
            patient.allergies && patient.allergies.length
              ? patient.allergies.map(allergy => allergy.name).join(', ')
              : 'NIL'
          );
        this.printTemplate(html);
      },
      err => this.alertService.error(JSON.stringify(err.error['message']))
    );
  }

  onPrintBillReceipt(patientInfo, paymentInfo, receiptType, draft) {
    console.log('onPrintBillReceipt', patientInfo, paymentInfo);
    const patient = patientInfo;
    const clinic = this.store.clinic;
    this.paymentInfo = paymentInfo;
    this.apiPatientVisitService.patientVisitSearch(this.store.getPatientVisitRegistryId()).subscribe(
      res => {
        const consultationInfo = res.payload;
        const patientReferralEntity = consultationInfo.patientReferralEntity;
        const consultDoctor =
          this.store.getDoctorList().find(doctor => doctor.id === patientReferralEntity.consultation.doctorId) || '';
        const currentUser = this.store.getUser();
        let currentUserName = '';
        if (this.permissionsService.getPermission('ROLE_DOCTOR') && !this.permissionsService.getPermission('ROLE_CA')) {
          // Doctor Role
          currentUserName = consultDoctor.name;
        } else {
          // CA / Other Rolew
          currentUserName = currentUser.firstName + ' ' + currentUser.lastName;
        }
        this.apiCmsManagementService.searchDiagnosisByIds(patientReferralEntity.diagnosisIds).subscribe(
          res => {
            const diagnosis = res.payload.map(d => `${d.icd10Code} [${d.icd10Term}]`);
            // this.apiCaseManageService.searchCase(consultationInfo.caseId).subscribe(res => {
            //   const caseNumber = res.payload.caseNumber;
            //   const salesOrder = res.payload.salesOrder;
            //   const purchaseItem: Array<any> = salesOrder.purchaseItem;
            //   const invoices = salesOrder.invoices;
            //   this.apiCmsManagementService.searchLabel('BILL').subscribe(
            //     res => {
            //       const template = JSON.parse(res.payload.template);
            //       const receiptTitle = draft ? 'DRAFT' : 'OFFICIAL';
            //       const drugCharges = purchaseItem.filter(item => {
            //         const storeItem = this.store.chargeItemList.find(storeItem => storeItem.item.id === item.itemRefId);
            //         return (storeItem || { item: { itemType: '' } }).item.itemType === 'DRUG';
            //       });
            //       const medicalServiceCharges = purchaseItem.filter(item => {
            //         const storeItem = this.store.chargeItemList.find(storeItem => storeItem.item.id === item.itemRefId);
            //         return (storeItem || { item: { itemType: '' } }).item.itemType === 'SERVICE';
            //       });
            //       const medicalTestCharges = purchaseItem.filter(item => {
            //         const storeItem = this.store.chargeItemList.find(storeItem => storeItem.item.id === item.itemRefId);
            //         return (storeItem || { item: { itemType: '' } }).item.itemType === 'LABORATORY';
            //       });
            //       const immunizationCharges = purchaseItem.filter(item => {
            //         const storeItem = this.store.chargeItemList.find(storeItem => storeItem.item.id === item.itemRefId);
            //         return (storeItem || { item: { itemType: '' } }).item.itemType === 'VACCINATION';
            //       });
            //       const drugTotalCharge = drugCharges.reduce((sum, obj) => (sum += this.getCalculatedPrice(obj)), 0);
            //       const medicalServiceTotalCharge = medicalServiceCharges.reduce(
            //         (sum, obj) => (sum += this.getCalculatedPrice(obj)),
            //         0
            //       );
            //       const medicalTestTotalCharge = medicalTestCharges.reduce(
            //         (sum, obj) => (sum += this.getCalculatedPrice(obj)),
            //         0
            //       );
            //       const immunizationTotalCharge = immunizationCharges.reduce(
            //         (sum, obj) => (sum += this.getCalculatedPrice(obj)),
            //         0
            //       );
            //       let drugTotalChargeString =
            //         drugTotalCharge > 0
            //           ? this.mapToHtmlBoldNameAndValue([
            //               {
            //                 name: 'DRUGS',
            //                 price: drugTotalCharge
            //               }
            //             ])
            //           : '';
            //       let medicalServiceTotalChargeString =
            //         medicalServiceTotalCharge > 0
            //           ? this.mapToHtmlBoldNameAndValue([
            //               {
            //                 name: 'MEDICAL SERVICES',
            //                 price: medicalServiceTotalCharge
            //               }
            //             ])
            //           : '';
            //       let medicalTestTotalChargeString =
            //         medicalTestTotalCharge > 0
            //           ? this.mapToHtmlBoldNameAndValue([
            //               {
            //                 name: 'MEDICAL TESTS',
            //                 price: medicalTestTotalCharge
            //               }
            //             ])
            //           : '';
            //       let immunizationTotalChargeString =
            //         immunizationTotalCharge > 0
            //           ? this.mapToHtmlBoldNameAndValue([
            //               {
            //                 name: 'IMMUNIZATIONS',
            //                 price: immunizationTotalCharge
            //               }
            //             ])
            //           : '';

            //       const totalCharge = invoices.reduce((sum, obj) => (sum += obj.payableAmount), 0) || 0;
            //       const gstTotalCharge = invoices.reduce((sum, obj) => (sum += obj.includedTaxAmount), 0) || 0;
            //       const subTotalCharge = totalCharge - gstTotalCharge;
            //       const consultationTotalCharge = subTotalCharge;
            //       const consultation = this.mapToHtmlBoldNameAndValue([
            //         {
            //           name: 'CONSULTATION / MEDICATION',
            //           price: consultationTotalCharge
            //         }
            //       ]);
            //       const payments = this.displayPaymentInfo(
            //         draft,
            //         invoices.filter(invoice => invoice.invoiceType !== 'DIRECT'),
            //         invoices.filter(invoice => invoice.invoiceType === 'DIRECT'),
            //         'breakdown'
            //       );
            //       console.log('payments: ', payments);
            //       const charges =
            //         "<div class='section-avoid-break'>" +
            //         this.mapToHtmlNoBold([
            //           {
            //             name: 'SUBTOTAL CHARGE',
            //             price: subTotalCharge
            //           }
            //         ]) +
            //         this.mapToHtmlNoBold([
            //           {
            //             name: 'GST@7%',
            //             price: gstTotalCharge
            //           }
            //         ]) +
            //         this.mapToHtmlBoldNameAndValue([
            //           {
            //             name: 'TOTAL CHARGE',
            //             price: totalCharge
            //           }
            //         ]) +
            //         payments +
            //         '<br></div>';
            //       const paymentModes = draft
            //         ? '-'
            //         : this.displayPaymentInfo(
            //             draft,
            //             invoices.filter(invoice => invoice.invoiceType !== 'DIRECT'),
            //             invoices.filter(invoice => invoice.invoiceType === 'DIRECT'),
            //             'summary'
            //           );
            //       const billNumberString = 'Case No: ' + (draft ? '-' : caseNumber || '');
            //       let html = template
            //         .replace('{{receiptTitle}}', receiptTitle)
            //         .replace(
            //           '{{clinicAddress}}',
            //           `${clinic.address.address.toUpperCase() || ''}, SINGAPORE ${clinic.address.postalCode}`
            //         )
            //         .replace(
            //           '{{companyRegistrationNumber}}',
            //           clinic.companyRegistrationNumber ? clinic.companyRegistrationNumber : ''
            //         )
            //         .replace(
            //           '{{gstRegistrationNumber}}',
            //           clinic.gstRegistrationNumber ? clinic.gstRegistrationNumber : ''
            //         )
            //         .replace('{{clinicName}}', `${clinic.name}`)
            //         .replace('{{clinicTel}}', clinic.contactNumber)
            //         .replace('{{clinicFax}}', clinic.faxNumber)
            //         .replace('{{patientName}}', patient.name)
            //         .replace('{{patientUserIdType}}', patient.userId.idType)
            //         .replace('{{patientUserId}}', patient.userId.number)
            //         .replace('{{diagnosis}}', diagnosis.length ? '' : diagnosis.join(', '))
            //         .replace('{{doctorName}}', consultDoctor.name)
            //         .replace('{{billNo}}', billNumberString)
            //         .replace('{{paymentModes}}', paymentModes)
            //         // .replace('{{subTotalCharge}}', `$${subTotalCharge.toFixed(2)}`)
            //         // .replace('{{gstTotalCharge}}', `$${gstTotalCharge.toFixed(2)}`)
            //         // .replace('{{totalCharge}}', `$${totalCharge.toFixed(2)}`)
            //         // .replace('{{payments}}', payments);
            //         .replace('{{charges}}', charges)
            //         .replace('{{assistantName}}', `${currentUserName}`)
            //         .replace(
            //           '{{visitDate}}',
            //           moment(patientReferralEntity.consultation.consultationStartTime, DB_FULL_DATE_FORMAT).format(
            //             DISPLAY_DATE_FORMAT
            //           )
            //         )
            //         .replace('{{printDate}}', moment().format(DISPLAY_DATE_FORMAT));
            //       if (receiptType === 'breakdown') {
            //         const drugs = this.mapToHtml(
            //           drugCharges.map(price => {
            //             const detail = this.store.chargeItemList.find(detail => detail.item.id === price.itemRefId);
            //             return {
            //               name: `${detail.item.name} [${detail.item.code}]`.toUpperCase(),
            //               price: this.getCalculatedPrice(price)
            //             };
            //           })
            //         );
            //         const medicalServices = this.mapToHtml(
            //           medicalServiceCharges.map(price => {
            //             const detail = this.store.chargeItemList.find(detail => detail.item.id === price.itemRefId);
            //             return {
            //               name: `${detail.item.description} [${detail.item.description}]`.toUpperCase(),
            //               price: this.getCalculatedPrice(price)
            //             };
            //           })
            //         );
            //         const medicalTests = this.mapToHtml(
            //           medicalTestCharges.map(price => {
            //             const detail = this.store.chargeItemList.find(detail => detail.item.id === price.itemRefId);
            //             return {
            //               name: `${detail.item.name} [${detail.item.category}]`.toUpperCase(),
            //               price: this.getCalculatedPrice(price)
            //             };
            //           })
            //         );
            //         const immunizations = this.mapToHtml(
            //           immunizationCharges.map(price => {
            //             const detail = this.store.chargeItemList.find(detail => detail.item.id === price.itemRefId);
            //             return {
            //               name: `${detail.item.name} [${detail.item.code}]`.toUpperCase(),
            //               price: this.getCalculatedPrice(price)
            //             };
            //           })
            //         );
            //         drugTotalChargeString =
            //           drugTotalCharge > 0
            //             ? "<div class='section-avoid-break'>" + drugTotalChargeString + drugs.join('\n') + '<br></div>'
            //             : '';
            //         medicalServiceTotalChargeString =
            //           medicalServiceTotalCharge > 0
            //             ? "<div class='section-avoid-break'>" +
            //               medicalServiceTotalChargeString +
            //               medicalServices.join('\n') +
            //               '<br></div>'
            //             : '';
            //         medicalTestTotalChargeString =
            //           medicalTestTotalCharge > 0
            //             ? "<div class='section-avoid-break'>" +
            //               medicalTestTotalChargeString +
            //               medicalTests.join('\n') +
            //               '<br></div>'
            //             : '';
            //         immunizationTotalChargeString =
            //           immunizationTotalCharge > 0
            //             ? "<div class='section-avoid-break'>" +
            //               immunizationTotalChargeString +
            //               immunizations.join('\n') +
            //               '</div>'
            //             : '';
            //         html = html
            //           .replace('{{drugs}}', drugTotalChargeString)
            //           .replace('{{medicalServices}}', medicalServiceTotalChargeString)
            //           .replace('{{medicalTests}}', medicalTestTotalChargeString)
            //           .replace('{{immunizations}}', immunizationTotalChargeString);
            //         html = html.replace('{{consultation}}', '');
            //       } else {
            //         html = html
            //           .replace('{{drugs}}', '')
            //           .replace('{{medicalServices}}', '')
            //           .replace('{{medicalTests}}', '')
            //           .replace('{{immunizations}}', '');
            //         html = html.replace('{{consultation}}', consultation);
            //       }
            //       this.printTemplate(html);
            //     },
            //     err => this.alertService.error(JSON.stringify(err.error.message))
            //   );
            // }),
              err => this.alertService.error(JSON.stringify(err.error.message));
          },
          err => this.alertService.error(JSON.stringify(err.error.message))
        );
      },
      err => this.alertService.error(JSON.stringify(err.error.message))
    );
  }

  displayPaymentInfo(draft, creditPayments, directPayments, checkIsSummaryOrBreakdown) {
    console.log('displayPaymentInfo', draft, creditPayments, directPayments, checkIsSummaryOrBreakdown);
    let breakdownString = '';
    let summaryString = '';

    creditPayments.forEach(payment => {
      if (payment.payableAmount > 0) {
        breakdownString += this.mapToHtmlBoldNameAndValue([
          {
            price: payment.payableAmount
          }
        ]);
      }
    });

    const directPaymentInfos = directPayments.reduce((array, payment) => array.concat(payment.paymentInfos), []);
    let dprice = directPaymentInfos.reduce((sum, obj) => (sum += obj.amount), 0);

    if (!draft) {
      if (
        directPayments.length === 1 &&
        directPayments[0].paymentInfos.length === 1 &&
        directPayments[0].paymentInfos[0].billMode === 'CASH' &&
        directPayments[0].paymentInfos[0].cashAdjustment > 0
      ) {
        // Pay By Cash Only
        // cashOnly = true;
        breakdownString +=
          this.mapToHtmlAdjustment([
            {
              name: 'ADJUSTMENT',
              price: directPayments[0].paymentInfos[0].cashAdjustment
            }
          ]) + this.mapToHtmlDisplayAdjustment(dprice);
        summaryString += summaryString === '' ? 'CASH' : ' / CASH';
      } else {
        directPaymentInfos.forEach((paymentInfo, counter) => {
          let billMode: string = paymentInfo.billMode;
          billMode = billMode.replace(/_/g, ' ');

          breakdownString += this.mapToHtmlBoldNameAndValue([
            {
              name: 'PAY BY ' + billMode,
              price: paymentInfo.amount
            }
          ]);

          summaryString += summaryString === '' ? billMode : ' / ' + billMode;
          console.log('summary string direct: ', summaryString);
        });
      }
    } else {
      // DRAFT RECEIPT
      console.log('DRAFT!');
      breakdownString += this.mapToHtmlBoldNameAndValue([
        {
          name: 'OUTSTANDING BALANCE',
          price: directPayments.reduce((sum, obj) => (sum += obj.payableAmount - obj.paidAmount), 0)
        }
      ]);
    }

    return checkIsSummaryOrBreakdown === 'summary' ? summaryString : breakdownString;
  }

  updateLabelTemplate(id, templateName, template) {
    this.apiCmsManagementService.updateLabel(id, templateName, JSON.stringify(template)).subscribe(
      res => {
        console.log(res);
      },
      err => console.log(err)
    );
  }

  updateAllLabelTemplates() {
    // this.apiCmsManagementService
    //   .updateLabel('5ae03f77dbea1b12fe7d6685', 'BILL', JSON.stringify(billTemplate))
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    // this.apiCmsManagementService
    //   .updateLabel('5ae03f77dbea1b12fe7d6687', 'MEDICAL_CERTIFICATE', JSON.stringify(medicalCertificateTemplate))
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    // this.apiCmsManagementService
    //   .updateLabel('5ae03f77dbea1b12fe7d6686', 'DRUG_LABEL', JSON.stringify(drugLabelTemplate))
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    this.apiCmsManagementService
      .updateLabel('5ae03f77dbea1b12fe7d668a', 'REFERRAL_LETTER', JSON.stringify(refferalLetterTemplate))
      .subscribe(
        res => {
          console.log(res);
        },
        err => console.log(err)
      );

    // this.apiCmsManagementService
    //   .updateLabel('5ae03f77dbea1b12fe7d6689', 'TIME_CHIT', JSON.stringify(timeChitTemplate))
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    // this.apiCmsManagementService
    //   .updateLabel('5ae14ab0dbea1b35bbaa310e', 'PATIENT_LABEL', JSON.stringify(patientLabelTemplate))
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    // this.apiCmsManagementService
    //   .updateLabel(
    //     '5ae2ae6bdbea1b35bbaa310f',
    //     'VACCINATION_CERTIFICATE',
    //     JSON.stringify(vaccinationCertificateTemplate)
    //   )
    //   .subscribe(
    //     res => {
    //       console.log(res);
    //     },
    //     err => console.log(err)
    //   );

    this.apiCmsManagementService
      .updateLabel('5b1f9ef8bf8d8d03a16fd8ed', 'MEMO', JSON.stringify(memoTemplate))
      .subscribe(
        res => {
          console.log(res);
        },
        err => console.log(err)
      );
  }

  mapToHtml(array) {
    return array.map(
      obj => `<div class="row">
            <div class="col-6">
                ${obj.name}
            </div>
            <div class="col-4">
                <span class="float-right">
                    $${(obj.price / 100).toFixed(2)}
                </span>
            </div>
        </div>`
    );
  }

  mapToHtmlAdjustment(array) {
    return array.map(
      obj => `<div class="row">
            <div class="col-6">
                ${obj.name}
            </div>
            <div class="col-6">
                <span class="float-right">
                    ($${(obj.price / 100).toFixed(2)})
                </span>
            </div>
        </div>`
    );
  }

  mapToHtmlNoBold(array) {
    return array.map(
      obj => `<div class="row">
            <div class="col-6">
                ${obj.name}
            </div>
            <div class="col-6">
                <span class="float-right">
                    $${(obj.price / 100).toFixed(2)}
                </span>
            </div>
        </div>`
    );
  }

  mapToHtmlBoldNameAndValue(array) {
    return array.map(
      obj => `<div class="row">
            <div class="col-6">
              <strong>
                ${obj.name}
              </strong>
            </div>
            <div class="col-6">
              <strong>
                <span class="float-right">
                    $${(obj.price / 100).toFixed(2)}
                </span>
              </strong>
            </div>
        </div>`
    );
  }

  mapToHtmlDisplayAdjustment(price) {
    return `<div class="row">
              <div class="col-6">
                <span>
                  <strong>PAY BY CASH </strong><small>(AFTER ADJUSTMENT)</small>
                </span>
              </div>
              <div class="col-6">
                  <span class="float-right">
                    <strong>
                      $${(price / 100).toFixed(2)}
                    </strong>
                  </span>
              </div>
            </div>`;
  }

  printTemplate(template: string) {
    const w = window.open();
    w.document.open();
    w.document.write(template);
    w.document.close();
    console.log('document closed');
    w.onload = () => {
      console.log('window loaded');
      w.window.print();
    };
    w.onafterprint = () => {
      w.close();
    };
  }

  // Calculate discounted price
  getCalculatedPrice(item) {
    if (item.priceAdjustment.paymentType === 'DOLLAR') {
      return item.originalTotalPrice + item.priceAdjustment.adjustedValue * item.purchaseQty;
    } else {
      return item.originalTotalPrice * (1 + item.priceAdjustment.adjustedValue / 100);
    }
  }
}
