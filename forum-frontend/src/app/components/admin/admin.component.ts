import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl  } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Role } from '../../interfaces/role'; // Role interface
import { User } from '../../interfaces/user'; // User interface
import { AdminService } from '../../services/admin/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin',
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
    MatOptionModule,
    MatSelectModule,
    MatCheckboxModule,
    DragDropModule,
    MatExpansionModule,
    MatRadioModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  roles: Role[] = []; // List of all roles
  selectedRole: Role | null = null; // Selected role
  roleForm: FormGroup; // Form to edit role name and permissions

  assignedUsers: User[] = []; // Users assigned to the selected role
  unassignedUsers: User[] = []; // Users not assigned to the selected role

  sortMethod = 'name';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    // Initialize the form
    this.roleForm = this.fb.group({
      roleName: [''], // Role name
      readComments: [false], // Permissions
      addDeleteComments: [false],
      addDeleteTopics: [false],
      deleteOthersCommentsTopics: [false],
    });
  }

  ngOnInit(): void {
    this.loadRoles(); // Load roles when component initializes
  }

  // Load roles from the server
  loadRoles() {
    this.adminService.getRoles().pipe(takeUntil(this.destroy$)).subscribe((roles) => {
      this.roles = roles.data;
    });
  }

  // Handler for when a new role is selected
  onRoleSelected(event: MatSelectChange) {  
    const roleId = event.value;
    this.adminService.getRoleById(roleId).pipe(takeUntil(this.destroy$)).subscribe((role) => {
    this.selectedRole = role.data;

      const rights = this.selectedRole.rights;
    
      // Using bitwise AND to check permissions
      this.roleForm.patchValue({
        roleName: role.data.name,
        readComments: (rights & 1) !== 0,              // Check if the READ_COMMENTS bit is set
        addDeleteComments: (rights & 2) !== 0,         // Check if the ADD_DELETE_COMMENTS bit is set
        addDeleteTopics: (rights & 4) !== 0,           // Check if the ADD_DELETE_TOPICS bit is set
        deleteOthersCommentsTopics: (rights & 8) !== 0 // Check if the DELETE_OTHERS_COMMENTS bit is set
      });

      // Load users assigned to and not assigned to this role
      this.loadUsersForRole(roleId);
    });
} 

  // Load users for a given role
  loadUsersForRole(roleId: number) {
    this.adminService.getUsersForRole(roleId).pipe(takeUntil(this.destroy$)).subscribe((assignedUsers) => {
      this.assignedUsers = assignedUsers.data;
    });

    this.adminService.getUsers().pipe(takeUntil(this.destroy$)).subscribe((allUsers) => {
      this.unassignedUsers = allUsers.data.filter(
        (user) => !this.assignedUsers.some((au) => au.id === user.id)
      );
    });
  }

// Update role details when saved
  saveRoleDetails() {
  if (this.selectedRole) {
    let rights = 0; // Start with no permissions

    // Using bitwise OR to set permissions
    if (this.roleForm.value.readComments) {
      rights |= 1; // Set the READ_COMMENTS bit
    }

    if (this.roleForm.value.addDeleteComments) {
      rights |= 2; // Set the ADD_DELETE_COMMENTS bit
    }

    if (this.roleForm.value.addDeleteTopics) {
      rights |= 4; // Set the ADD_DELETE_TOPICS bit
    }

    if (this.roleForm.value.deleteOthersCommentsTopics) {
      rights |= 8; // Set the DELETE_OTHERS_COMMENTS bit
    }

    const updatedRole = {
      ...this.selectedRole,
      name: this.roleForm.value.roleName,
      rights, // Updated permissions
    };

    this.adminService.updateRole(updatedRole).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.snackBar.open('Role updated successfully.', 'Dismiss', {
        duration: 2000,
      });
      this.loadRoles();
    });
  }
}

  // Drag-and-drop functionality
  drop(event: CdkDragDrop<User[]>) {
    // Check if the item is dropped into a different container
    if (event.previousContainer !== event.container) {
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
  
      // Update the role of the user to the selected role's ID
      const user = event.container.data[event.currentIndex];
      user.role = this.selectedRole?.id || 0;
  
      // Send updated user data to the server
      this.adminService.updateUserById(user.id, user.role).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.snackBar.open('User role updated successfully.', 'Dismiss', {
          duration: 2000,
        });
      });
    } else {
      // If the item is dropped within the same container, just reorder it
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  sortUsers(users: User[]): User[] {
    if (this.sortMethod === 'name') {
      return users.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return users.sort((a, b) => a.id - b.id);
    }
  }

  // Change sorting method
  onSortMethodChange(method: string) {
    this.sortMethod = method;
    this.assignedUsers = this.sortUsers(this.assignedUsers);
    this.unassignedUsers = this.sortUsers(this.unassignedUsers);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}