import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { ActivityService } from '../../core/services/activity.service';
import { Activity, ActivityType } from '../../core/models/activity.model';
import { signal } from '@angular/core';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  
  let mockActivityService: {
    activities: ReturnType<typeof signal<Activity[]>>;
    loadUserActivities: jasmine.Spy;
  };

  const mockActivities: Activity[] = [
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      type: ActivityType.MEETING,
      organizerId: 1,
      organizerName: 'John Doe',
      participantIds: [1, 2, 3],
      participantNames: ['John Doe', 'Jane Smith', 'Bob Johnson'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z'
    },
    {
      id: 2,
      title: 'Client Call',
      description: 'Project discussion',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T15:00:00Z',
      type: ActivityType.CALL,
      organizerId: 1,
      organizerName: 'John Doe',
      participantIds: [1, 4],
      participantNames: ['John Doe', 'Client ABC'],
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-12T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    mockActivityService = {
      activities: signal(mockActivities),
      loadUserActivities: jasmine.createSpy('loadUserActivities')
    };

    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        { provide: ActivityService, useValue: mockActivityService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    
    (component as any).activityService = mockActivityService;
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load activities', () => {
    expect(mockActivityService.loadUserActivities).toHaveBeenCalled();
  });

  it('should generate calendar with correct structure', () => {
    const testDate = new Date(2024, 0, 1);
    component.currentDate.set(testDate);
    component.generateCalendar();

    const calendarDays = component.calendarDays();
    
    expect(calendarDays.length).toBe(42);
    
    const currentMonthDays = calendarDays.filter(day => day.isCurrentMonth);
    expect(currentMonthDays.length).toBe(31);
  });

  it('should filter activities for specific date', () => {
    const testDate = new Date('2024-01-15T00:00:00Z');
    const activities = component.getActivitiesForDate(testDate);
    
    expect(activities.length).toBe(2);
    expect(activities[0].title).toBe('Team Meeting');
    expect(activities[1].title).toBe('Client Call');
  });

  it('should return empty array for date with no activities', () => {
    const testDate = new Date('2024-01-01T00:00:00Z');
    const activities = component.getActivitiesForDate(testDate);
    
    expect(activities.length).toBe(0);
  });

  it('should navigate to previous month', () => {
    const initialDate = new Date(2024, 0, 1); 
    component.currentDate.set(initialDate);
    
    component.previousMonth();
    
    const newDate = component.currentDate();
    expect(newDate.getMonth()).toBe(11);
    expect(newDate.getFullYear()).toBe(2023);
  });

  it('should navigate to next month', () => {
    const initialDate = new Date(2024, 0, 1);
    component.currentDate.set(initialDate);
    
    component.nextMonth();
    
    const newDate = component.currentDate();
    expect(newDate.getMonth()).toBe(1); 
    expect(newDate.getFullYear()).toBe(2024);
  });

  it('should navigate to today', () => {
    const pastDate = new Date(2023, 0, 1); 
    component.currentDate.set(pastDate);
    
    component.today();
    
    const newDate = component.currentDate();
    const today = new Date();
    expect(newDate.getFullYear()).toBe(today.getFullYear());
    expect(newDate.getMonth()).toBe(today.getMonth());
    expect(newDate.getDate()).toBe(today.getDate());
  });

  it('should select a date', () => {
    const testDate = new Date(2024, 0, 15);
    
    component.selectDate(testDate);
    
    expect(component.selectedDate()).toEqual(testDate);
  });

  it('should return correct colors for activity types', () => {
    expect(component.getActivityTypeColor(ActivityType.MEETING)).toBe('#2196F3');
    expect(component.getActivityTypeColor(ActivityType.CALL)).toBe('#9C27B0');
    expect(component.getActivityTypeColor(ActivityType.TASK)).toBe('#4CAF50');
    expect(component.getActivityTypeColor(ActivityType.EVENT)).toBe('#FF9800');
    expect(component.getActivityTypeColor(ActivityType.REMINDER)).toBe('#F44336');
    expect(component.getActivityTypeColor('UNKNOWN' as ActivityType)).toBe('#666');
  });


  it('should handle date selection', () => {
    const testDate = new Date(2024, 0, 15);
    const selectDateSpy = spyOn(component, 'selectDate').and.callThrough();
    
    component.selectDate(testDate);
    
    expect(selectDateSpy).toHaveBeenCalledWith(testDate);
    expect(component.selectedDate()).toEqual(testDate);
  });
});