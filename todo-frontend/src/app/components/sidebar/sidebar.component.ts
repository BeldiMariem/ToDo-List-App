import { Component, Output, EventEmitter, inject, Input, OnInit, computed, effect } from '@angular/core';
import { UserDTO } from '../../core/models/user/user-dto.model';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink, CommonModule]
})
export class SidebarComponent implements OnInit {
  @Output() menuItemSelected = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isCollapsed = false;

  private authService = inject(AuthService);

  currentUser = computed(() => this.authService.getCurrentUser());
  userEmail = computed(() => this.authService.getUserEmail());
  userName = computed(() => this.authService.getUserName());
  isAuthenticated = computed(() => this.authService.isAuthenticated());

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
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}