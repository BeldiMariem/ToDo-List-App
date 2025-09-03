import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Subscription } from 'rxjs';
import { NotificationService } from '../core/services/notification.service';
import { NotificationDTO } from '../core/models/notification.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isNotificationPanelOpen = false;
  notifications: NotificationDTO[] = [];
  unreadCount = 0;

  private notificationSubscription!: Subscription;
  private unreadCountSubscription!: Subscription;
  private notificationService = inject(NotificationService);

  ngOnInit() {

    this.notificationSubscription = this.notificationService.notifications$
      .subscribe(notifications => {
        this.notifications = notifications || [];
        this.unreadCount = this.notifications.filter(n => !this.getSeenStatus(n)).length;
      });

    this.unreadCountSubscription = this.notificationService.unreadCount$
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  getNotificationMessage(notification: NotificationDTO): string {
    return notification?.message || 'No message available';
  }

  getSeenStatus(notification: NotificationDTO): boolean {
    return notification?.seen || false;
  }

  getNotificationId(notification: NotificationDTO): number {
    return notification?.id || 0;
  }

  onMenuItemSelected(menuItemId: string) {
    console.log('Selected menu item:', menuItemId);
  }

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onToggleNotificationPanel() {
    this.toggleNotificationPanel();
  }

  toggleNotificationPanel() {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  }

  closeNotificationPanel() {
    this.isNotificationPanelOpen = false;
  }



  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }



  clearAllNotifications() {
    this.notificationService.clearAllNotifications();
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'task': 'fa-tasks',
      'reminder': 'fa-clock',
      'update': 'fa-sync-alt',
      'alert': 'fa-exclamation-circle',
      'message': 'fa-comment',
      'success': 'fa-check-circle',
      'error': 'fa-exclamation-triangle'
    };

    return icons[type] || 'fa-bell';
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }
}