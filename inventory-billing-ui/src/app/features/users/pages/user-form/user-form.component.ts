
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { User } from '../../../../shared/models/user';
import { UserService } from '../../services/user.service';

interface RoleOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;

  roles: RoleOption[] = [
    { id: 1, name: 'Administrator' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Sales Executive' },
    { id: 4, name: 'Inventory Executive' }
  ];

  editing = false;
  userId: number | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],
      fullName: [
        '',
        Validators.required
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      phone: [
        '',
        [
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      roleId: [
        '',
        Validators.required
      ],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.editing = true;
      this.userId = id;
      this.loadUser(id);
    }
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUserById(id).subscribe({
      next: (user: User | null | undefined) => {
        if (!user) {
          this.errorMessage = 'User not found.';
          this.loading = false;
          return;
        }

        this.userForm.patchValue({
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          roleId: user.roleId,
          isActive: user.isActive
        });

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load user.';
        this.loading = false;
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  save(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const formValue = this.userForm.value;

    const selectedRole = this.roles.find(
      role => role.id === Number(formValue.roleId)
    );

    if (!selectedRole) {
      this.errorMessage = 'Please select a valid role.';
      this.saving = false;
      return;
    }

    const userData = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone || '',
      roleId: Number(formValue.roleId),
      roleName: selectedRole.name,
      isActive: formValue.isActive
    };

    if (this.editing && this.userId !== null) {
      this.userService.updateUser(this.userId, userData).subscribe({
        next: user => {
          if (!user) {
            this.errorMessage = 'Unable to update user.';
            this.saving = false;
            return;
          }

          this.router.navigate(['/users']);
        },
        error: () => {
          this.errorMessage = 'Unable to update user.';
          this.saving = false;
        }
      });

      return;
    }

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: () => {
        this.errorMessage = 'Unable to create user.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  trackByRole(_index: number, role: RoleOption): number {
    return role.id;
  }
}
