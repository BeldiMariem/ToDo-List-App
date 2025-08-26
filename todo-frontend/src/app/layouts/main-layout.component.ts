import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="main-layout" [class.sidebar-collapsed]="isSidebarCollapsed">
      <app-sidebar 
        [isCollapsed]="isSidebarCollapsed"
        (menuItemSelected)="onMenuItemSelected($event)"
        (toggleSidebar)="onSidebarToggle()">
      </app-sidebar>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  onMenuItemSelected(menuItemId: string) {
    console.log('Selected menu item:', menuItemId);
  }

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}