import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile/profile.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Snack bar for feedback messages

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
    MatSnackBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  showPassword1: boolean = false;
  showPassword2: boolean = false;

  private existingPassword: string = ''; // Store the current password

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar // Feedback messages
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'), this.matchPasswords]],
    });
  }

  ngOnInit() {
    this.fetchUserData();
  }

  fetchUserData() {
    const userId = 2; // Example user ID
    this.profileService.getUserById(userId).subscribe((response) => {
      this.existingPassword = response.data.password; // Store the existing password
      this.profileForm.patchValue({
        name: response.data.name,
        email: response.data.email,
      });
    });

    this.profileService.getUserWithRoleCommentsTopics(userId).subscribe((response) => {
      // Show user details if needed
      console.log(response);
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    const { newPassword, confirmPassword } = this.profileForm.value;

    // Check if new passwords match the existing password
    if (newPassword !== this.existingPassword) {
      this.snackBar.open('New password does not match the current password.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }

    // If passwords match, update the profile
    const updatedProfile = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      newPassword,
    };

    this.profileService.updateUser(updatedProfile).subscribe(() => {
      this.snackBar.open('Profile updated successfully.', 'Dismiss', {
        duration: 3000,
      });

      // Fetch role details, comments, and topics after updating the profile
      this.fetchUserRoleAndComments();
    });
  }

  fetchUserRoleAndComments() {
    const userId = 2; // Example user ID

    this.profileService.getUserWithRoleCommentsTopics(userId).subscribe((response) => {
      const { roleName, roleRights, commentsTotal, topicsTotal } = response;

      // Check if roleRights is an array before using map function
      const rightsDisplay = Array.isArray(roleRights) ? roleRights.map((right) =>
        right.allowed ? `\u001B[32m${right.name}\u001B[0m` : `\u001B[31m${right.name}\u001B[0m`
      ) : [];

      console.log('Role Rights (highlighted):', rightsDisplay);
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
}