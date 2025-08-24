// sidebar.component.ts
import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Output() menuItemSelected = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isCollapsed = false;
  
  private authService = inject(AuthService);
  currentUser!: UserDTO;  
  dashboardActive = true;
  boardsActive = false;
  tasksActive = false;
  calendarActive = false;
  teamActive = false;
  documentsActive = false;
  messagesActive = false;
  settingsActive = false;
  logoutActive = false;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser = user;
    console.log('Current User:', this.currentUser);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  selectMenuItem(itemId: string) {
    this.dashboardActive = false;
    this.boardsActive = false;
    this.tasksActive = false;
    this.calendarActive = false;
    this.teamActive = false;
    this.documentsActive = false;
    this.messagesActive = false;
    this.settingsActive = false;
    this.logoutActive = false;

    switch(itemId) {
      case 'dashboard': this.dashboardActive = true; break;
      case 'board': this.boardsActive = true; break;
      case 'tasks': this.tasksActive = true; break;
      case 'calendar': this.calendarActive = true; break;
      case 'team': this.teamActive = true; break;
      case 'documents': this.documentsActive = true; break;
      case 'messages': this.messagesActive = true; break;
      case 'settings': this.settingsActive = true; break;
      case 'logout': this.logoutActive = true; break;
    }
    
    this.menuItemSelected.emit(itemId);
  }
}