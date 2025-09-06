import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../core/services/activity.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity, ActivityType, CreateActivityRequest, ActivityFilters } from '../../core/models/activity.model';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { TitleTruncatePipe } from '../../core/pipes/title-truncate.pipe';

@Component({
    selector: 'app-activities',
    templateUrl: './activities.component.html',
    styleUrls: ['./activities.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, TitleTruncatePipe]
})
export class ActivitiesComponent implements OnInit {
    private activityService = inject(ActivityService);
    private userService = inject(UserService);
    private authService = inject(AuthService);

    activities = this.activityService.activities;
    isLoading = this.activityService.isLoading;
    users = signal<UserDTO[]>([]);
    currentUser = signal<UserDTO | null>(null);

    showCreateModal = signal(false);
    showFilters = signal(false);

    currentPage = signal(1);
    itemsPerPage = signal(4);
    totalPages = computed(() => Math.ceil(this.filteredActivities().length / this.itemsPerPage()));

    newActivity = signal<CreateActivityRequest>({
        title: '',
        description: '',
        startTime: this.getDefaultStartTime(),
        endTime: this.getDefaultEndTime(),
        type: ActivityType.MEETING,
        participantIds: []
    });


    filters = signal<ActivityFilters>({});
    activityTypes = Object.values(ActivityType);
    filteredUsers = signal<UserDTO[]>([]);
    userSearchQuery = signal('');

    selectedActivity = signal<Activity | null>(null);
    showParticipantDetails = signal(false);

    filteredActivities = computed(() => {
        const activities = this.activities();
        const filters = this.filters();

        return activities.filter(activity => {
            let matches = true;

            if (filters.startDate) {
                const activityDate = new Date(activity.startTime);
                matches = matches && activityDate >= filters.startDate;
            }

            if (filters.endDate) {
                const activityDate = new Date(activity.endTime);
                matches = matches && activityDate <= filters.endDate;
            }

            if (filters.type) {
                matches = matches && activity.type === filters.type;
            }

            return matches;
        });
    });

    paginatedActivities = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();
        return this.filteredActivities().slice(startIndex, endIndex);
    });

    selectedParticipants = computed(() => {
        const participantIds = this.newActivity().participantIds;
        return this.users().filter(user => participantIds.includes(user.id!));
    });

    meetingActivities = computed(() => this.getActivitiesByType(ActivityType.MEETING));
    callActivities = computed(() => this.getActivitiesByType(ActivityType.CALL));
    taskActivities = computed(() => this.getActivitiesByType(ActivityType.TASK));
    eventActivities = computed(() => this.getActivitiesByType(ActivityType.EVENT));

    ngOnInit() {
        this.loadCurrentUser();
        this.loadActivities();
        this.loadUsers();
    }

    private loadCurrentUser() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.currentUser.set(user);
        }
    }

    loadActivities() {
        this.activityService.loadUserActivities();
    }
    toggleFilters() {
        this.showFilters.update(show => !show);
    }

    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users.set(users);
                this.filteredUsers.set(users);
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    createActivity() {
        const activityData = this.newActivity();

        if (!this.validateActivity(activityData)) {
            return;
        }

        this.activityService.createActivity(activityData).subscribe({
            next: (activity) => {
                this.closeCreateModal();
                this.resetForm();
                this.currentPage.set(1);
            },
            error: (error) => {
                console.error('Error creating activity:', error);
            }
        });
    }

    deleteActivity(activity: Activity) {
        if (confirm(`Are you sure you want to delete "${activity.title}"?`)) {
            this.activityService.deleteActivity(activity.id).subscribe({
                next: () => {
                    this.showParticipantDetails.set(false);
                    this.activityService.removeActivityFromSignal(activity.id);
                    if (this.paginatedActivities().length === 0 && this.currentPage() > 1) {
                        this.currentPage.set(this.currentPage() - 1);
                    }
                },
                error: (error) => {
                    console.error('Error deleting activity:', error);
                }
            });
        }
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.set(this.currentPage() + 1);
        }
    }

    prevPage() {
        if (this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
        }
    }

    showActivityParticipants(activity: Activity, event: Event) {
        event.stopPropagation();

        if (this.selectedActivity()?.id === activity.id && this.showParticipantDetails()) {
            this.hideParticipantDetails();
            return;
        }

        this.selectedActivity.set(activity);
        this.showParticipantDetails.set(true);
    }

    hideParticipantDetails() {
        this.selectedActivity.set(null);
        this.showParticipantDetails.set(false);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (this.showParticipantDetails()) {
            const target = event.target as HTMLElement;
            if (!target.closest('.participants-details-modal') &&
                !target.closest('.activity-card') &&
                !target.closest('.list-view-item')) {
                this.hideParticipantDetails();
            }
        }
    }

    toggleParticipantSelection(userId: number) {
        const currentActivity = this.newActivity();
        const participantIds = [...currentActivity.participantIds];
        const index = participantIds.indexOf(userId);

        if (index > -1) {
            participantIds.splice(index, 1);
        } else {
            participantIds.push(userId);
        }

        this.newActivity.update(prev => ({
            ...prev,
            participantIds
        }));
    }

    isParticipantSelected(userId: number): boolean {
        return this.newActivity().participantIds.includes(userId);
    }

    openCreateModal() {
        this.showCreateModal.set(true);
    }

    closeCreateModal() {
        this.showCreateModal.set(false);
        this.resetForm();
        this.userSearchQuery.set('');
        this.filteredUsers.set(this.users());
    }

    resetForm() {
        this.newActivity.set({
            title: '',
            description: '',
            startTime: this.getDefaultStartTime(),
            endTime: this.getDefaultEndTime(),
            type: ActivityType.MEETING,
            participantIds: []
        });
    }

    onStartDateChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        this.updateFilters({
            startDate: value ? new Date(value) : undefined
        });
        this.currentPage.set(1);
    }

    onEndDateChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        this.updateFilters({
            endDate: value ? new Date(value) : undefined
        });
        this.currentPage.set(1);
    }

    onTypeChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const value = select.value;

        let activityType: ActivityType | undefined;
        if (value) {
            activityType = ActivityType[value as keyof typeof ActivityType];
        }

        this.updateFilters({
            type: activityType
        });
        this.currentPage.set(1);
    }

    onUserSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const query = input.value;
        this.userSearchQuery.set(query);
        this.filterUsers();
    }

    filterUsers(): void {
        const query = this.userSearchQuery().toLowerCase();
        if (!query) {
            this.filteredUsers.set(this.users());
            return;
        }

        const filtered = this.users().filter(user =>
            user.email!.toLowerCase().includes(query) ||
            (user.username && user.username.toLowerCase().includes(query))
        );
        this.filteredUsers.set(filtered);
    }

    updateFilters(updates: Partial<ActivityFilters>) {
        this.filters.update(current => ({ ...current, ...updates }));
    }

    applyFilters(): void {
        this.currentPage.set(1);
    }

    clearFilters() {
        this.filters.set({});
        this.currentPage.set(1);
    }


    getActivitiesByType(type: ActivityType): Activity[] {
        return this.activities().filter(activity => activity.type === type);
    }

    isActivityInProgress(activity: Activity): boolean {
        const now = new Date();
        const start = new Date(activity.startTime);
        const end = new Date(activity.endTime);
        return now >= start && now <= end;
    }

    isActivityUpcoming(activity: Activity): boolean {
        return new Date(activity.startTime) > new Date();
    }

    isActivityPast(activity: Activity): boolean {
        return new Date(activity.endTime) < new Date();
    }

    getActivityTypeColor(type: ActivityType): string {
        const typeColors = {
            [ActivityType.MEETING]: '#2196F3',
            [ActivityType.CALL]: '#9C27B0',
            [ActivityType.TASK]: '#4CAF50',
            [ActivityType.EVENT]: '#FF9800',
            [ActivityType.REMINDER]: '#F44336'
        };
        return typeColors[type] || '#666';
    }

    getInitials(name: string): string {
        return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
    }

    getUserInitials(email: string): string {
        return email.substring(0, 2).toUpperCase();
    }

    private validateActivity(activity: CreateActivityRequest): boolean {
        if (!activity.title.trim()) {
            alert('Please enter a title');
            return false;
        }

        const startTime = new Date(activity.startTime);
        const endTime = new Date(activity.endTime);

        if (endTime <= startTime) {
            alert('End time must be after start time');
            return false;
        }

        return true;
    }

    private getDefaultStartTime(): string {
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        return now.toISOString().slice(0, 16);
    }

    private getDefaultEndTime(): string {
        const now = new Date();
        now.setHours(now.getHours() + 2, 0, 0, 0);
        return now.toISOString().slice(0, 16);
    }

    getActivityTypeDisplayName(type: ActivityType): string {
        return this.activityService.getActivityTypeDisplayName(type);
    }

    formatActivityTime(startTime: string, endTime: string): string {
        return this.activityService.formatActivityTime(startTime, endTime);
    }
    onItemsPerPageChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const value = parseInt(select.value, 10);
        this.itemsPerPage.set(value);
        this.currentPage.set(1);
    }
    displayRangeStart = computed(() => {
        return (this.currentPage() - 1) * this.itemsPerPage() + 1;
    });

    displayRangeEnd = computed(() => {
        return Math.min(this.currentPage() * this.itemsPerPage(), this.filteredActivities().length);
    });

    getPageNumbers(): number[] {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    }
}