import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Snack bar for feedback messages
import { UserWithRoleCommentsTopics } from '../../interfaces/user';
import { RoleName, RoleRights } from '../../interfaces/role';
import { USER_ID } from '../../constants/constant';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  userId = USER_ID // Example user ID
  userData: UserWithRoleCommentsTopics | null = null;
  passwordForm: FormGroup;
  nameEmailForm: FormGroup;
  showPassword1: boolean = false;
  showPassword2: boolean = false;
  roleRights = RoleRights; // Role rights
  roleName: RoleName = ""; // Role name
  roles = {};

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar // Feedback messages
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)), this.matchPasswords]],
    });
    this.nameEmailForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.fetchUserData();
  }

  fetchUserData() {
    this.profileService.getUserWithRoleCommentsTopics(this.userId).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.userData = response;
      this.roleName = this.userData.roleName as RoleName;

      this.nameEmailForm.patchValue({
        name: this.userData.name,
        email: this.userData.email,
      });
    });

  }
  updateNameEmail() {
    if (this.nameEmailForm.invalid) {
      return;
    }

    const updatedNameEmail = {
      id: this.userId,
      name: this.nameEmailForm.value.name,
      email: this.nameEmailForm.value.email,
    };

    this.profileService.updateUser(updatedNameEmail).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackBar.open('Name and email updated successfully.', 'Dismiss', {
        duration: 3000,
      });

      // Fetch role details, comments, and topics after updating the profile
      this.fetchUserRoleAndComments();
    });
  }
  updatePassword() {
    if (this.passwordForm.invalid) {
      return;
    }
    
    if (this.passwordForm.get('newPassword')?.value === this.passwordForm.get('confirmPassword')?.value && this.passwordForm.get('newPassword')?.value) {
      // If passwords match, update the profile
      const newPassword = this.passwordForm.get('newPassword')?.value;
      this.profileService.changePassword( this.userId, newPassword ).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.snackBar.open('Profile updated successfully.', 'Dismiss', {
          duration: 3000,
        });
  
        // Fetch role details, comments, and topics after updating the profile
        this.fetchUserRoleAndComments();
      });
      this.snackBar.open('New password does not match the current password.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }

  }

  fetchUserRoleAndComments() {
    this.profileService.getUserWithRoleCommentsTopics(this.userId).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      const { roleName, roleRights, commentsTotal, topicsTotal } = response;

      // Check if roleRights is an array before using map function
      const rightsDisplay = Array.isArray(roleRights) ? roleRights.map((right) =>
        right.allowed ? `\u001B[32m${right.name}\u001B[0m` : `\u001B[31m${right.name}\u001B[0m`
      ) : [];

    });
  }

  togglePasswordVisibility() {
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibility2() {
    this.showPassword2 = !this.showPassword2;
  }

  matchPasswords(control: AbstractControl) {
    const newPassword = control.root.get('newPassword')?.value || '';
    const confirmPassword = control.root.get('confirmPassword')?.value || '';

    if (confirmPassword === newPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}