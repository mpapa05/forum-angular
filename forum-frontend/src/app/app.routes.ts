import { Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, // Route to the Home page
    { path: 'profile', component: ProfileComponent }, // Route to the Profile page
    { path: 'admin', component: AdminComponent }, // Route to the Admin page
];
