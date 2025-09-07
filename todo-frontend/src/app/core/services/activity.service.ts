import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Activity, 
  CreateActivityRequest, 
  UpdateActivityRequest, 
  ActivityType,
  ActivityFilters 
} from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activities`;

  private activitiesSignal = signal<Activity[]>([]);
  public activities = this.activitiesSignal.asReadonly();

  private isLoadingSignal = signal(false);
  public isLoading = this.isLoadingSignal.asReadonly();

  private errorSignal = signal<string | null>(null);
  public error = this.errorSignal.asReadonly();

  
  loadUserActivities(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.http.get<Activity[]>(this.apiUrl).pipe(
      tap({
        next: (activities) => {
          this.activitiesSignal.set(activities);
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Failed to load activities');
          this.isLoadingSignal.set(false);
          console.error('Error loading activities:', error);
        }
      })
    ).subscribe();
  }

  loadActivitiesByDateRange(start: Date, end: Date): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    const params = {
      start: start.toISOString(),
      end: end.toISOString()
    };
    
    this.http.get<Activity[]>(`${this.apiUrl}/date-range`, { params }).pipe(
      tap({
        next: (activities) => {
          this.activitiesSignal.set(activities);
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          this.errorSignal.set('Failed to load activities by date range');
          this.isLoadingSignal.set(false);
          console.error('Error loading activities by date range:', error);
        }
      })
    ).subscribe();
  }

  createActivity(request: CreateActivityRequest): Observable<Activity> {
    this.errorSignal.set(null);
    
    return this.http.post<Activity>(this.apiUrl, request).pipe(
      tap({
        next: (activity) => {
          this.activitiesSignal.update(activities => [...activities, activity]);
        },
        error: (error) => {
          this.errorSignal.set('Failed to create activity');
          console.error('Error creating activity:', error);
        }
      })
    );
  }

  getActivity(id: number): Observable<Activity> {
    this.errorSignal.set(null);
    
    return this.http.get<Activity>(`${this.apiUrl}/${id}`).pipe(
      tap({
        error: (error) => {
          this.errorSignal.set('Failed to load activity');
          console.error('Error loading activity:', error);
        }
      })
    );
  }

  updateActivity(id: number, request: UpdateActivityRequest): Observable<Activity> {
    this.errorSignal.set(null);
    
    return this.http.put<Activity>(`${this.apiUrl}/${id}`, request).pipe(
      tap({
        next: (updatedActivity) => {
          this.activitiesSignal.update(activities =>
            activities.map(activity => activity.id === id ? updatedActivity : activity)
          );
        },
        error: (error) => {
          this.errorSignal.set('Failed to update activity');
          console.error('Error updating activity:', error);
        }
      })
    );
  }

  deleteActivity(id: number): Observable<void> {
    this.errorSignal.set(null);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.activitiesSignal.update(activities =>
            activities.filter(activity => activity.id !== id)
          );
        },
        error: (error) => {
          this.errorSignal.set('Failed to delete activity');
          console.error('Error deleting activity:', error);
        }
      })
    );
  }

  addParticipant(activityId: number, userId: number): Observable<void> {
    this.errorSignal.set(null);
    
    return this.http.post<void>(`${this.apiUrl}/${activityId}/participants/${userId}`, {}).pipe(
      tap({
        next: () => {
          this.activitiesSignal.update(activities =>
            activities.map(activity => {
              if (activity.id === activityId && !activity.participantIds.includes(userId)) {
                return {
                  ...activity,
                  participantIds: [...activity.participantIds, userId],
                  participantNames: [...activity.participantNames, 'Loading...'] 
                };
              }
              return activity;
            })
          );
        },
        error: (error) => {
          this.errorSignal.set('Failed to add participant');
          console.error('Error adding participant:', error);
        }
      })
    );
  }

  removeParticipant(activityId: number, userId: number): Observable<void> {
    this.errorSignal.set(null);
    
    return this.http.delete<void>(`${this.apiUrl}/${activityId}/participants/${userId}`).pipe(
      tap({
        next: () => {
          this.activitiesSignal.update(activities =>
            activities.map(activity => {
              if (activity.id === activityId) {
                return {
                  ...activity,
                  participantIds: activity.participantIds.filter(id => id !== userId),
                  participantNames: activity.participantNames.filter((_, index) => 
                    activity.participantIds[index] !== userId
                  )
                };
              }
              return activity;
            })
          );
        },
        error: (error) => {
          this.errorSignal.set('Failed to remove participant');
          console.error('Error removing participant:', error);
        }
      })
    );
  }

  addActivityToSignal(activity: Activity): void {
    this.activitiesSignal.update(activities => [...activities, activity]);
  }

  updateActivityInSignal(updatedActivity: Activity): void {
    this.activitiesSignal.update(activities =>
      activities.map(activity => activity.id === updatedActivity.id ? updatedActivity : activity)
    );
  }

  removeActivityFromSignal(activityId: number): void {
    this.activitiesSignal.update(activities =>
      activities.filter(activity => activity.id !== activityId)
    );
  }

  clearActivities(): void {
    this.activitiesSignal.set([]);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  getActivityTypeDisplayName(type: ActivityType): string {
    const typeNames = {
      [ActivityType.MEETING]: 'Meeting',
      [ActivityType.CALL]: 'Call',
      [ActivityType.TASK]: 'Task',
      [ActivityType.EVENT]: 'Event',
      [ActivityType.REMINDER]: 'Reminder'
    };
    return typeNames[type] || type;
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
  formatActivityTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  formatActivityDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString();
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

  filterActivities(activities: Activity[], filters: ActivityFilters): Activity[] {
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
  }

  sortActivitiesByStartTime(activities: Activity[]): Activity[] {
    return [...activities].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
    const grouped = new Map<string, Activity[]>();
    
    activities.forEach(activity => {
      const dateKey = new Date(activity.startTime).toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(activity);
    });

    return grouped;
  }
}