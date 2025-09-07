import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ActivityService } from './activity.service';
import { environment } from '../../../environments/environment';
import { of, Subject, throwError } from 'rxjs';
import { Activity, CreateActivityRequest, UpdateActivityRequest, ActivityType, ActivityFilters } from '../models/activity.model';

const mockActivity: Activity = {
    id: 1,
    title: 'Test Activity',
    description: 'Test Description',
    startTime: '2023-01-01T10:00:00.000Z',
    endTime: '2023-01-01T11:00:00.000Z',
    type: ActivityType.MEETING,
    organizerId: 1,
    organizerName: 'Organizer',
    participantIds: [1, 2],
    participantNames: ['User1', 'User2'],
    createdAt: '2023-01-01T09:00:00.000Z',
    updatedAt: '2023-01-01T09:00:00.000Z'
};

const mockActivities: Activity[] = [mockActivity];

describe('ActivityService', () => {
    let service: ActivityService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;

    beforeEach(() => {
        const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

        TestBed.configureTestingModule({
            providers: [
                ActivityService,
                { provide: HttpClient, useValue: httpSpy }
            ]
        });

        service = TestBed.inject(ActivityService);
        httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    });

    afterEach(() => {
        service['activitiesSignal'].set([]);
        service['isLoadingSignal'].set(false);
        service['errorSignal'].set(null);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('loadUserActivities()', () => {
        it('should set loading to true and make GET request', () => {
            const responseSubject = new Subject<Activity[]>();
            httpClientSpy.get.and.returnValue(responseSubject.asObservable());

            service.loadUserActivities();

            expect(service.isLoading()).toBeTrue();
            expect(httpClientSpy.get).toHaveBeenCalledWith(`${environment.apiUrl}/activities`);

            responseSubject.complete();
        });

        it('should update activities and set loading to false on success', fakeAsync(() => {
            httpClientSpy.get.and.returnValue(of(mockActivities));

            service.loadUserActivities();
            tick();

            expect(service.activities()).toEqual(mockActivities);
            expect(service.isLoading()).toBeFalse();
            expect(service.error()).toBeNull();
        }));

        it('should set error and set loading to false on failure', fakeAsync(() => {
            const errorResponse = { error: { message: 'Server error' } };

            httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

            spyOn(console, 'error');

            try {
                service.loadUserActivities();
                tick();
            } catch (e) {
            }

            expect(service.activities()).toEqual([]);
            expect(service.isLoading()).toBeFalse();
            expect(service.error()).toBe('Failed to load activities');
        }));
    });

    describe('loadActivitiesByDateRange()', () => {
        it('should set loading to true and make GET request with date range', () => {
            const start = new Date('2023-01-01');
            const end = new Date('2023-01-31');
            const responseSubject = new Subject<Activity[]>();
            httpClientSpy.get.and.returnValue(responseSubject.asObservable());

            service.loadActivitiesByDateRange(start, end);

            expect(service.isLoading()).toBeTrue();
            expect(httpClientSpy.get).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/date-range`,
                { params: { start: start.toISOString(), end: end.toISOString() } }
            );

            responseSubject.complete();
        });

        it('should update activities and set loading to false on success', fakeAsync(() => {
            const start = new Date('2023-01-01');
            const end = new Date('2023-01-31');
            httpClientSpy.get.and.returnValue(of(mockActivities));

            service.loadActivitiesByDateRange(start, end);
            tick();

            expect(service.activities()).toEqual(mockActivities);
            expect(service.isLoading()).toBeFalse();
            expect(service.error()).toBeNull();
        }));

        it('should set error and set loading to false on failure', fakeAsync(() => {
            const start = new Date('2023-01-01');
            const end = new Date('2023-01-31');
            const errorResponse = { error: { message: 'Server error' } };

            httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

            spyOn(console, 'error');

            try {
                service.loadActivitiesByDateRange(start, end);
                tick();
            } catch (e) {
            }

            expect(service.activities()).toEqual([]);
            expect(service.isLoading()).toBeFalse();
            expect(service.error()).toBe('Failed to load activities by date range');
        }));
    });

    describe('createActivity()', () => {
        it('should make POST request and add activity to signal on success', () => {
            const createRequest: CreateActivityRequest = {
                title: 'New Activity',
                description: 'New Description',
                startTime: '2023-01-01T10:00:00.000Z',
                endTime: '2023-01-01T11:00:00.000Z',
                type: ActivityType.MEETING,
                participantIds: [1, 2]
            };
            httpClientSpy.post.and.returnValue(of(mockActivity));

            service.createActivity(createRequest).subscribe(activity => {
                expect(activity).toEqual(mockActivity);
            });

            expect(httpClientSpy.post).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities`,
                createRequest
            );

            expect(service.activities()).toEqual([mockActivity]);
        });

        it('should handle error when creating activity', () => {
            const createRequest: CreateActivityRequest = {
                title: 'New Activity',
                description: 'New Description',
                startTime: '2023-01-01T10:00:00.000Z',
                endTime: '2023-01-01T11:00:00.000Z',
                type: ActivityType.MEETING,
                participantIds: [1, 2]
            };
            const errorResponse = { error: { message: 'Creation failed' } };
            httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

            service.createActivity(createRequest).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                }
            });

            expect(service.error()).toBe('Failed to create activity');
        });
    });

    describe('getActivity()', () => {
        it('should make GET request with activity ID', () => {
            const activityId = 1;
            httpClientSpy.get.and.returnValue(of(mockActivity));

            service.getActivity(activityId).subscribe(activity => {
                expect(activity).toEqual(mockActivity);
            });

            expect(httpClientSpy.get).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/${activityId}`
            );
        });
    });

    describe('updateActivity()', () => {
        it('should make PUT request and update activity in signal on success', () => {
            const activityId = 1;
            const updateRequest: UpdateActivityRequest = {
                title: 'Updated Activity',
                description: 'Updated Description',
                startTime: '2023-01-01T10:00:00.000Z',
                endTime: '2023-01-01T11:00:00.000Z',
                type: ActivityType.MEETING,
                participantIds: [1, 2]
            };
            const updatedActivity = { ...mockActivity, title: 'Updated Activity' };
            httpClientSpy.put.and.returnValue(of(updatedActivity));

            service['activitiesSignal'].set([mockActivity]);

            service.updateActivity(activityId, updateRequest).subscribe(activity => {
                expect(activity).toEqual(updatedActivity);
            });

            expect(httpClientSpy.put).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/${activityId}`,
                updateRequest
            );

            expect(service.activities()[0].title).toBe('Updated Activity');
        });
    });

    describe('deleteActivity()', () => {
        it('should make DELETE request and remove activity from signal on success', () => {
            const activityId = 1;
            httpClientSpy.delete.and.returnValue(of(void 0));

            service['activitiesSignal'].set([mockActivity]);

            service.deleteActivity(activityId).subscribe(response => {
                expect(response).toBeUndefined();
            });

            expect(httpClientSpy.delete).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/${activityId}`
            );

            expect(service.activities()).toEqual([]);
        });
    });

    describe('participant management', () => {
        it('should add participant to activity', () => {
            const activityId = 1;
            const userId = 3;
            httpClientSpy.post.and.returnValue(of(void 0));

            service['activitiesSignal'].set([mockActivity]);

            service.addParticipant(activityId, userId).subscribe(response => {
                expect(response).toBeUndefined();
            });

            expect(httpClientSpy.post).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/${activityId}/participants/${userId}`,
                {}
            );
        });

        it('should remove participant from activity', () => {
            const activityId = 1;
            const userId = 1;
            httpClientSpy.delete.and.returnValue(of(void 0));

            service['activitiesSignal'].set([mockActivity]);

            service.removeParticipant(activityId, userId).subscribe(response => {
                expect(response).toBeUndefined();
            });

            expect(httpClientSpy.delete).toHaveBeenCalledWith(
                `${environment.apiUrl}/activities/${activityId}/participants/${userId}`
            );
        });
    });

    describe('signal manipulation methods', () => {
        it('should add activity to signal', () => {
            service.addActivityToSignal(mockActivity);
            expect(service.activities()).toEqual([mockActivity]);
        });

        it('should update activity in signal', () => {
            service['activitiesSignal'].set([mockActivity]);
            const updatedActivity = { ...mockActivity, title: 'Updated' };

            service.updateActivityInSignal(updatedActivity);
            expect(service.activities()[0].title).toBe('Updated');
        });

        it('should remove activity from signal', () => {
            service['activitiesSignal'].set([mockActivity]);

            service.removeActivityFromSignal(mockActivity.id);
            expect(service.activities()).toEqual([]);
        });

        it('should clear activities', () => {
            service['activitiesSignal'].set([mockActivity]);

            service.clearActivities();
            expect(service.activities()).toEqual([]);
        });

        it('should clear error', () => {
            service['errorSignal'].set('Test error');

            service.clearError();
            expect(service.error()).toBeNull();
        });
    });

    describe('utility methods', () => {
        it('should get activity type display name', () => {
            expect(service.getActivityTypeDisplayName(ActivityType.MEETING)).toBe('Meeting');
            expect(service.getActivityTypeDisplayName(ActivityType.CALL)).toBe('Call');
            expect(service.getActivityTypeDisplayName(ActivityType.TASK)).toBe('Task');
            expect(service.getActivityTypeDisplayName(ActivityType.EVENT)).toBe('Event');
            expect(service.getActivityTypeDisplayName(ActivityType.REMINDER)).toBe('Reminder');
        });

        it('should get activity type color', () => {
            expect(service.getActivityTypeColor(ActivityType.MEETING)).toBe('#2196F3');
            expect(service.getActivityTypeColor(ActivityType.CALL)).toBe('#9C27B0');
            expect(service.getActivityTypeColor(ActivityType.TASK)).toBe('#4CAF50');
            expect(service.getActivityTypeColor(ActivityType.EVENT)).toBe('#FF9800');
            expect(service.getActivityTypeColor(ActivityType.REMINDER)).toBe('#F44336');
        });

        it('should format activity time', () => {
            const startTime = '2023-01-01T10:30:00.000Z';
            const endTime = '2023-01-01T12:45:00.000Z';

            const formattedTime = service.formatActivityTime(startTime, endTime);
            expect(formattedTime).toMatch(/\d{1,2}:\d{2} - \d{1,2}:\d{2}/);
        });

        it('should format activity date', () => {
            const dateTime = '2023-01-01T10:00:00.000Z';
            const formattedDate = service.formatActivityDate(dateTime);
            expect(formattedDate).toBeDefined();
        });

        it('should check if activity is in progress', () => {
            const now = new Date();
            const inProgressActivity: Activity = {
                ...mockActivity,
                startTime: new Date(now.getTime() - 1000).toISOString(),
                endTime: new Date(now.getTime() + 1000).toISOString()
            };

            expect(service.isActivityInProgress(inProgressActivity)).toBeTrue();
        });

        it('should check if activity is upcoming', () => {
            const upcomingActivity: Activity = {
                ...mockActivity,
                startTime: new Date(Date.now() + 1000).toISOString(),
                endTime: new Date(Date.now() + 2000).toISOString()
            };

            expect(service.isActivityUpcoming(upcomingActivity)).toBeTrue();
        });

        it('should check if activity is past', () => {
            const pastActivity: Activity = {
                ...mockActivity,
                startTime: new Date(Date.now() - 2000).toISOString(),
                endTime: new Date(Date.now() - 1000).toISOString()
            };

            expect(service.isActivityPast(pastActivity)).toBeTrue();
        });

        it('should filter activities', () => {
            const activities: Activity[] = [
                { ...mockActivity, type: ActivityType.MEETING, startTime: '2023-01-01T10:00:00.000Z' },
                { ...mockActivity, type: ActivityType.CALL, startTime: '2023-01-02T10:00:00.000Z' }
            ];

            const filters: ActivityFilters = {
                type: ActivityType.MEETING
            };

            const filtered = service.filterActivities(activities, filters);
            expect(filtered.length).toBe(1);
            expect(filtered[0].type).toBe(ActivityType.MEETING);
        });

        it('should sort activities by start time', () => {
            const activities: Activity[] = [
                { ...mockActivity, startTime: '2023-01-02T10:00:00.000Z' },
                { ...mockActivity, startTime: '2023-01-01T10:00:00.000Z' }
            ];

            const sorted = service.sortActivitiesByStartTime(activities);
            expect(new Date(sorted[0].startTime).getTime()).toBeLessThan(new Date(sorted[1].startTime).getTime());
        });

        it('should group activities by date', () => {
            const activities: Activity[] = [
                { ...mockActivity, startTime: '2023-01-01T10:00:00.000Z' },
                { ...mockActivity, startTime: '2023-01-01T14:00:00.000Z' },
                { ...mockActivity, startTime: '2023-01-02T10:00:00.000Z' }
            ];

            const grouped = service.groupActivitiesByDate(activities);
            expect(grouped.size).toBe(2);
            expect(grouped.get('Sun Jan 01 2023')?.length).toBe(2);
            expect(grouped.get('Mon Jan 02 2023')?.length).toBe(1);
        });
    });
});