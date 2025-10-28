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
    
    isDemoUser = computed(() => {
      const user = this.currentUser();
      return user?.username === 'mariemBeldi';
    });

    ngOnInit(): void {
        this.initializeForms();
    }

    private initializeForms(): void {
        const user = this.currentUser();

        this.profileForm = this.fb.group({
            username: [
                { value: user?.username || '', disabled: this.isDemoUser() }, 
                [Validators.required, Validators.minLength(3)]
            ],
            email: [
                { value: user?.email || '', disabled: this.isDemoUser() }, 
                [Validators.required, Validators.email]
            ]
        });

        if (this.hasPassword()) {
            this.passwordForm = this.fb.group({
                oldPassword: [
                    { value: '', disabled: this.isDemoUser() }, 
                    this.isDemoUser() ? [] : [Validators.required, Validators.minLength(6)]
                ],
                newPassword: [
                    { value: '', disabled: this.isDemoUser() }, 
                    this.isDemoUser() ? [] : [Validators.required, Validators.minLength(6)]
                ],
                confirmPassword: [
                    { value: '', disabled: this.isDemoUser() }, 
                    this.isDemoUser() ? [] : [Validators.required]
                ]
            }, { validator: this.isDemoUser() ? null : this.passwordMatchValidator });
        }

        if (!this.isDemoUser()) {
            this.deleteForm = this.fb.group({
                password: ['', [Validators.required]]
            });
        }
    }

    private passwordMatchValidator(form: FormGroup) {
        if (this.isDemoUser()) return null;
        
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return newPassword === confirmPassword ? null : { mismatch: true };
    }

    onChangePassword(): void {
        if (this.isDemoUser()) {
            this.showMessage('Demo account password cannot be modified. Please create a new account to test this feature.', 'error');
            return;
        }

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
        if (this.isDemoUser()) {
            this.showMessage('Demo account cannot be deleted. Please create a new account to test deletion.', 'error');
            return;
        }

        if (this.hasPassword() && this.deleteForm.valid) {
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
        } else if (!this.hasPassword()) {
            this.isLoading.set(true);
            this.userService.deleteGoogleUser().subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.showDeleteGoogleModal.set(false);
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
        if (this.isDemoUser()) {
            this.showMessage('Demo account cannot be modified. Please create a new account to test profile updates.', 'error');
            return;
        }
    
        if (this.profileForm.valid) {
            this.isLoading.set(true);
    
            const payload = {
                username: this.profileForm.value.username,
                email: this.profileForm.value.email
            };
    
            this.userService.updateProfile(payload).subscribe({
                next: (updatedUser: UserDTO) => {
                    this.authService.updateCurrentUser(updatedUser);
                    localStorage.setItem("username", updatedUser.username);
                    localStorage.setItem("email", updatedUser.email!)
    
                    this.isLoading.set(false);
                    this.showMessage('Profile updated successfully', 'success');
                },
                error: (error) => {
                    this.isLoading.set(false);
                    
                    const errorMessage = error.message || 'Failed to update profile';
                    this.showMessage(errorMessage, 'error');
                    console.error('Profile update error:', error);
                }
            });
        }
    }
}