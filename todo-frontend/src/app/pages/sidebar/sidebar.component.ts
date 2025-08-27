import { Component, Output, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink]
})
export class SidebarComponent implements OnInit {
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