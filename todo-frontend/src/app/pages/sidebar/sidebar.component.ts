import { Component, Output, EventEmitter, inject, Input } from '@angular/core';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { AuthService } from '../../core/services/auth.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink]
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
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

 

}