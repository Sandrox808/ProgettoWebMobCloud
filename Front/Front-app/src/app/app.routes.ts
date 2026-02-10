import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NamePickerComponent } from './namePicker/namePicker.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'namePicker', component: NamePickerComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
