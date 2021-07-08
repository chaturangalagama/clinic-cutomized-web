export class PatientNoteAdd {
  note: string;
  doctorId: string;
  addedDateTime: string;
  typeOfProblem: string;
  dateOfOnSet: string;
  status?: string;
  patientNoteId?: string;

  constructor(note: string, doctorId: string, addedDateTime: string, typeOfProblem: string, dateOfOnSet: string, status?: string, patientNoteId?: string) {
    this.note = note || '';
    this.doctorId = doctorId || '';
    this.addedDateTime = addedDateTime || '';
    this.typeOfProblem = typeOfProblem || 'LONG_TERM';
    this.dateOfOnSet = dateOfOnSet || '';
    this.status = status || 'ACTIVE';
    this.patientNoteId = patientNoteId || undefined;
  }
}
