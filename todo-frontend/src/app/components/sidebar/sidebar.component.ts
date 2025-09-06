import { Component, Output, EventEmitter, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { NotificationDTO } from '../../core/models/notification.model';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink, CommonModule]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isCollapsed = false;
  @Output() menuItemSelected = new EventEmitter<string>(); 
  @Output() toggleNotificationPanel = new EventEmitter<void>(); 

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser!: UserDTO;
  userEmail = '';
  isAuthenticated = false;

  activeItem: string = '';

  notifications: NotificationDTO[] = [];
  unreadCount = 0;

  private notificationSubscription!: Subscription;
  private authCheckInterval: any;
  private unreadCountSubscription!: Subscription;
  private routerSubscription!: Subscription;

  ngOnInit() {
    this.checkAuthState();
    
    this.authCheckInterval = setInterval(() => {
      this.checkAuthState();
    }, 1000);

    this.unreadCountSubscription = this.notificationService.unreadCount$
      .subscribe(count => {
        this.unreadCount = count;
      });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveItemBasedOnRoute(event.url);
      }
    });

    this.setActiveItemBasedOnRoute(this.router.url);
  }

  private setActiveItemBasedOnRoute(url: string): void {
    if (url.includes('/boards')) {
      this.activeItem = 'boards';
    } else if (url.includes('/activities')) {
      this.activeItem = 'activities';
    } else if (url.includes('/profile')) {
      this.activeItem = 'profile';
    } else if (url.includes('/logout')) {
      this.activeItem = 'logout';
    } else if (url.includes('/calendar')) {
      this.activeItem = 'calendar';
    } else {
      this.activeItem = 'boards';
    }
    
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
    this.activeItem = menuItemId;
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
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.notificationService.disconnect();
  }
}