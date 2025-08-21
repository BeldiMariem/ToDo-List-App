import { Component, Output, EventEmitter } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Output() menuItemSelected = new EventEmitter<string>();

  isCollapsed = false;
  userName = 'Mariem';
  
  dashboardActive = true;
  projectsActive = false;
  tasksActive = false;
  calendarActive = false;
  teamActive = false;
  documentsActive = false;
  messagesActive = false;
  settingsActive = false;
  logoutActive = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  selectMenuItem(itemId: string) {
    this.dashboardActive = false;
    this.projectsActive = false;
    this.tasksActive = false;
    this.calendarActive = false;
    this.teamActive = false;
    this.documentsActive = false;
    this.messagesActive = false;
    this.settingsActive = false;
    this.logoutActive = false;

    switch(itemId) {
      case 'dashboard': this.dashboardActive = true; break;
      case 'projects': this.projectsActive = true; break;
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