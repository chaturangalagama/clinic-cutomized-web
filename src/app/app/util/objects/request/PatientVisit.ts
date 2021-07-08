
export class PatientVisit {
  registryEntity: PatientVisitRegistryEntity;

  constructor(
    registryEntity: PatientVisitRegistryEntity = new PatientVisitRegistryEntity()
  ) {
    this.registryEntity = registryEntity;
  }
}

export class PatientVisitRegistryEntity {
  patientId: string;
  clinicId: string;
  preferredDoctorId: string;
  visitPurpose: string;
  priority: string;
  remark: string;

  constructor(
    patientId: string = '',
    clinicId: string = '',
    preferredDoctorId: string = undefined,
    visitPurpose: string = '',
    priority: string = '',
    remark: string = ''
  ) {
    this.patientId = patientId;
    this.clinicId = clinicId;
    this.preferredDoctorId = preferredDoctorId;
    this.visitPurpose = visitPurpose;
    this.priority = priority;
    this.remark = remark;
  }
}

export interface VisitPurpose {
  name: string;
  consultationRequired: boolean;
}
