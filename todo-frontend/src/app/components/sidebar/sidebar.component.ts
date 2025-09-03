import { Component, Output, EventEmitter, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { NotificationDTO } from '../../core/models/notification.model';

interface ToastNotification {
  id: number;
  message: string;
  type?: string;
  time: Date;
  icon: string;
  visible: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink, CommonModule]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isCollapsed = false;
  @Output() menuItemSelected = new EventEmitter<string>(); // Emits string
  @Output() toggleNotificationPanel = new EventEmitter<void>(); // Emits void

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentUser!:  UserDTO ;
  userEmail = '';
  isAuthenticated = false;

  dashboardActive = true;
  boardsActive = false;
  tasksActive = false;
  calendarActive = false;
  teamActive = false;
  logoutActive = false;

  notifications: NotificationDTO[] = [];
  unreadCount = 0;

  private notificationSubscription!: Subscription;
  private authCheckInterval: any;
  private unreadCountSubscription!: Subscription;


ngOnInit() {
    
    this.checkAuthState();
    
    this.authCheckInterval = setInterval(() => {
      this.checkAuthState();
    }, 1000);

    this.unreadCountSubscription = this.notificationService.unreadCount$
      .subscribe(count => {
        this.unreadCount = count;

      });
  }
 

  private checkAuthState() {
    const isCurrentlyAuthenticated = this.authService.isAuthenticated();
    
    if (isCurrentlyAuthenticated !== this.isAuthenticated) {
      this.updateAuthState(isCurrentlyAuthenticated);
    }
  }

  private updateAuthState(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getCurrentUser();
      this.userEmail = this.authService.getUserEmail();
      this.notificationService.connect();
    } else {
      this.notificationService.disconnect();
      this.notifications = [];
      this.unreadCount = 0;
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onMenuItemClick(menuItemId: string) {
    this.menuItemSelected.emit(menuItemId); 
  }

  onNotificationsClick() {
    this.toggleNotificationPanel.emit(); 
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

  testWebSocket() {
    this.notificationService.testConnection();
  }

  ngOnDestroy() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.notificationService.disconnect();
  }
}