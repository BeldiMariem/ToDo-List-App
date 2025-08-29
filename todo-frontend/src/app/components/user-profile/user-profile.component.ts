import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { UserService } from '../../core/services/user.service';
import { PasswordUpdateDTO } from '../../core/models/password-update.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserDeleteRequestDTO } from '../../core/models/user-delete-request.model';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule]
})
export class UserProfileComponent implements OnInit {
    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    deleteForm!: FormGroup;

    activeTab = signal('profile');
    isLoading = signal(false);
    message = signal('');
    messageType = signal<'success' | 'error'>('success');
    showDeleteModal = signal(false);
    showDeleteGoogleModal = signal(false);

    private authService = inject(AuthService);
    private userService = inject(UserService);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    currentUser = computed(() => this.authService.getCurrentUser());
    hasPassword = computed(() => {
      return this.authService.hasPasswordLogin();
    });

    ngOnInit(): void {
        this.initializeForms();
    }

    private initializeForms(): void {
        const user = this.currentUser();

        this.profileForm = this.fb.group({
            username: [user?.username || '', [Validators.required, Validators.minLength(3)]],
            email: [user?.email || '', [Validators.required, Validators.email]]
        });

        if (this.hasPassword()) {
            this.passwordForm = this.fb.group({
                oldPassword: ['', [Validators.required, Validators.minLength(6)]],
                newPassword: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]]
            }, { validator: this.passwordMatchValidator });
        }

        this.deleteForm = this.fb.group({
            password: ['', [Validators.required]]
        });
    }

    private passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { mismatch: true };
    }

    onChangePassword(): void {
        if (this.passwordForm.valid) {
            this.isLoading.set(true);

            const payload: PasswordUpdateDTO = {
                oldPassword: this.passwordForm.value.oldPassword,
                newPassword: this.passwordForm.value.newPassword
            };

            this.userService.updatePassword(payload).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.passwordForm.reset();
                    this.showMessage('Password updated successfully', 'success');
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.showMessage('Failed to update password', 'error');
                    console.error('Password update error:', error);
                }
            });
        }
    }

    onDeleteAccount(): void {
        if (this.deleteForm.valid) {
            this.isLoading.set(true);

            const payload: UserDeleteRequestDTO = {
                password: this.deleteForm.value.password
            };

            this.userService.deleteUser(payload).subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.showDeleteModal.set(false);
                    this.showMessage('Account deleted successfully', 'success');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.showMessage('Failed to delete account', 'error');
                    console.error('Account deletion error:', error);
                }
            });
        }
        else{
        this.showDeleteGoogleModal.set(true);

            this.userService.deleteGoogleUser().subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.showDeleteModal.set(false);
                    this.showMessage('Account deleted successfully', 'success');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.showMessage('Failed to delete account', 'error');
                    console.error('Account deletion error:', error);
                }
            });

        }
    }

    selectTab(tab: string): void {
        this.activeTab.set(tab);
        this.message.set('');
    }

    private showMessage(text: string, type: 'success' | 'error'): void {
        this.message.set(text);
        this.messageType.set(type);
        setTimeout(() => {
            this.message.set('');
        }, 5000);
    }

    onUpdateProfile(): void {
        if (this.profileForm.valid) {
            this.isLoading.set(true);

            const payload = {
                username: this.profileForm.value.username,
                email: this.profileForm.value.email
            };

            this.userService.updateProfile(payload).subscribe({
                next: (updatedUser: UserDTO) => {
                    this.authService.updateCurrentUser(updatedUser);

                    this.isLoading.set(false);
                    this.showMessage('Profile updated successfully', 'success');
                },
                error: (error) => {
                    this.isLoading.set(false);
                    this.showMessage('Failed to update profile', 'error');
                    console.error('Profile update error:', error);
                }
            });
        }
    }
}