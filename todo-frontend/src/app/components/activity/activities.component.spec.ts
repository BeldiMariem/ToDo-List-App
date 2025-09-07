import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivitiesComponent } from './activities.component';
import { ActivityService } from '../../core/services/activity.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { of, throwError } from 'rxjs';
import { ActivityType, CreateActivityRequest, ActivityFilters } from '../../core/models/activity.model';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { FormsModule } from '@angular/forms';
import { signal, WritableSignal } from '@angular/core';

class MockActivityService {
  activities = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  
  loadUserActivities = jasmine.createSpy('loadUserActivities');
  createActivity = jasmine.createSpy('createActivity').and.returnValue(of({}));
  deleteActivity = jasmine.createSpy('deleteActivity').and.returnValue(of(void 0));
  removeActivityFromSignal = jasmine.createSpy('removeActivityFromSignal');
  getActivityTypeDisplayName = jasmine.createSpy('getActivityTypeDisplayName').and.returnValue('Meeting');
  formatActivityTime = jasmine.createSpy('formatActivityTime').and.returnValue('10:00 AM - 11:00 AM');
}

class MockUserService {
  getUsers = jasmine.createSpy('getUsers').and.returnValue(of([]));
}

class MockAuthService {
  getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue(null);
  decodeJwt = jasmine.createSpy('decodeJwt').and.returnValue({});
  fetchCurrentUserFromToken = jasmine.createSpy('fetchCurrentUserFromToken').and.returnValue(of({}));
}

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;
  let activityService: MockActivityService;
  let userService: MockUserService;
  let authService: MockAuthService;

  const mockActivities = [
    {
      id: 1,
      title: 'Test Meeting',
      description: 'Test Description',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      type: ActivityType.MEETING,
      organizerId: 1,
      organizerName: 'John Doe',
      participantIds: [1, 2],
      participantNames: ['John Doe', 'Jane Smith'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockUsers: UserDTO[] = [
    { id: 1, email: 'john@example.com', username: 'johndoe' },
    { id: 2, email: 'jane@example.com', username: 'janesmith' }
  ];

  const mockCurrentUser: UserDTO = { id: 1, email: 'john@example.com', username: 'johndoe' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ActivitiesComponent],
      providers: [
        { provide: ActivityService, useClass: MockActivityService },
        { provide: UserService, useClass: MockUserService },
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    
    activityService = TestBed.inject(ActivityService) as unknown as MockActivityService;
    userService = TestBed.inject(UserService) as unknown as MockUserService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;

    activityService.activities.set(mockActivities);
    authService.getCurrentUser.and.returnValue(mockCurrentUser);
    userService.getUsers.and.returnValue(of(mockUsers));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load current user on init', () => {
      component.ngOnInit();
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser()).toEqual(mockCurrentUser);
    });

    it('should load activities on init', () => {
      component.ngOnInit();
      expect(activityService.loadUserActivities).toHaveBeenCalled();
    });

    it('should load users on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(userService.getUsers).toHaveBeenCalled();
      expect(component.users()).toEqual(mockUsers);
    }));
  });

  describe('Activity Creation', () => {
    it('should create activity with valid data', fakeAsync(() => {
      const newActivity: CreateActivityRequest = {
        title: 'New Activity',
        description: 'Test Description',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        type: ActivityType.MEETING,
        participantIds: [1]
      };

      component.newActivity.set(newActivity);
      
      component.createActivity();
      tick();
      
      expect(activityService.createActivity).toHaveBeenCalledWith(newActivity);
    }));

    it('should handle creation error', fakeAsync(() => {
      const newActivity: CreateActivityRequest = {
        title: 'New Activity',
        description: 'Test Description',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        type: ActivityType.MEETING,
        participantIds: [1]
      };

      activityService.createActivity.and.returnValue(throwError(() => ({ error: { message: 'Creation failed' } })));
      component.newActivity.set(newActivity);
      
      spyOn(console, 'error');
      component.createActivity();
      tick();
      
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('Filtering', () => {
    it('should filter activities by type', fakeAsync(() => {
      const activitiesWithMultipleTypes = [
        { ...mockActivities[0], type: ActivityType.MEETING },
        { ...mockActivities[0], id: 2, type: ActivityType.CALL }
      ];
      
      activityService.activities.set(activitiesWithMultipleTypes);
      fixture.detectChanges();
      tick();
      
      component.filters.set({ type: ActivityType.MEETING });
      fixture.detectChanges();
      tick();
      
      const filtered = component.filteredActivities();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe(ActivityType.MEETING);
    }));
  });

  describe('Pagination', () => {
    it('should paginate activities correctly', fakeAsync(() => {
      const multipleActivities = [
        ...mockActivities,
        { ...mockActivities[0], id: 2, title: 'Second Activity' },
        { ...mockActivities[0], id: 3, title: 'Third Activity' },
        { ...mockActivities[0], id: 4, title: 'Fourth Activity' }
      ];
      
      activityService.activities.set(multipleActivities);
      fixture.detectChanges();
      tick();
      
      component.currentPage.set(1);
      component.itemsPerPage.set(2);
      fixture.detectChanges();
      tick();
      
      const paginated = component.paginatedActivities();
      
      expect(paginated.length).toBe(2);
    }));

    it('should calculate total pages correctly', fakeAsync(() => {
      const multipleActivities = [
        ...mockActivities,
        { ...mockActivities[0], id: 2, title: 'Second Activity' },
        { ...mockActivities[0], id: 3, title: 'Third Activity' }
      ];
      
      activityService.activities.set(multipleActivities);
      fixture.detectChanges();
      tick();
      
      component.itemsPerPage.set(2);
      fixture.detectChanges();
      tick();
      
      expect(component.totalPages()).toBe(2); 
    }));
  });

  describe('User Interaction', () => {
    it('should toggle participant selection', () => {
      const userId = 1;
      component.toggleParticipantSelection(userId);
      expect(component.isParticipantSelected(userId)).toBeTrue();
      
      component.toggleParticipantSelection(userId);
      expect(component.isParticipantSelected(userId)).toBeFalse();
    });

    it('should filter users based on search query', () => {
      component.users.set(mockUsers);
      component.userSearchQuery.set('john');
      component.filterUsers();
      
      expect(component.filteredUsers().length).toBe(1);
      expect(component.filteredUsers()[0].email).toContain('john');
    });
  });

  describe('Utility Methods', () => {
    it('should get activity type color', () => {
      const color = component.getActivityTypeColor(ActivityType.MEETING);
      expect(color).toBe('#2196F3');
    });

    it('should get user initials', () => {
      const initials = component.getUserInitials('test@example.com');
      expect(initials).toBe('TE');
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});