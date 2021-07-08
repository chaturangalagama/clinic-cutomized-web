
interface PatientVisitResponse {
    id: string;
    patientId: string;
    clinicId: string;
    visitState: string;
    remark: string;
    startTime: string;
}

export { PatientVisitResponse };
