import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../core/services/activity.service';
import { Activity, ActivityType } from '../../core/models/activity.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  activities: Activity[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CalendarComponent implements OnInit {
  private activityService = inject(ActivityService);
  
  activities = this.activityService.activities;
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);
  calendarDays = signal<CalendarDay[]>([]);
  
  ngOnInit() {
    this.activityService.loadUserActivities();
    this.generateCalendar();
  }
  
  generateCalendar(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, 1 - i);
      date.setDate(1 - i);
      days.unshift({
        date,
        isCurrentMonth: false,
        isToday: false,
        activities: this.getActivitiesForDate(date)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        activities: this.getActivitiesForDate(date)
      });
    }
    
    const totalCells = 42; 
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        activities: this.getActivitiesForDate(date)
      });
    }
    
    this.calendarDays.set(days);
  }
  
  getActivitiesForDate(date: Date): Activity[] {
    return this.activities().filter(activity => {
      const activityDate = new Date(activity.startTime);
      return activityDate.toDateString() === date.toDateString();
    });
  }
  
  previousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
    this.generateCalendar();
  }
  
  nextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
    this.generateCalendar();
  }
  
  today(): void {
    this.currentDate.set(new Date());
    this.generateCalendar();
  }
  
  selectDate(date: Date): void {
    this.selectedDate.set(date);
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
}