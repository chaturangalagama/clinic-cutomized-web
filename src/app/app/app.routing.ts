import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { FullLayoutComponent, SimpleLayoutComponent } from './containers';
import { AuthGuardService as AuthGuard } from './services/auth-guard.service';
import { PermissionsGuardService as PermissionsGuard } from './services/permissions-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'pages',
    component: FullLayoutComponent,
    canActivate: [AuthGuard, PermissionsGuard],
    data: { title: 'Home' },
    children: [
      { path: 'profile', loadChildren: './pages/profile/profile.module#ProfileModule' },
      { path: 'patient', loadChildren: '../business/views/patient/patient.module#PatientModule' },
      { path: 'appointments', loadChildren: '../business/views/patient-visit/appointments/appointments.module#AppointmentsModule' },
      { path: 'consultation', loadChildren: '../business/views/consultation/consultation.module#ConsultationModule', runGuardsAndResolvers: 'always'},
      { path: 'payment', loadChildren: '../business/views/payment/payment.module#PaymentModule' },
      { path: 'clinic', loadChildren: '../business/views/clinic/clinic.module#ClinicModule' }
    ]
  },
  {
    path: '',
    component: SimpleLayoutComponent,
    data: { title: 'Pages' },
    children: [{ path: '', loadChildren: './pages/pages.module#PagesModule' }]
  },
  { path: '**', redirectTo: '/pages/patient/list' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', useHash: true, enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
