import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ResponsiveLayoutService } from '../../services/responsive-layout.service';
import { User } from '../../models/auth.models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  badge?: number;
}

@Component({
  selector: 'app-navigation-shell',
  template: `
    <ion-app>
      <!-- Desktop/Tablet Sidebar -->
      <ion-split-pane 
        *ngIf="!isMobile" 
        [visible]="showSidebar" 
        [when]="getSidebarWhen()"
        class="desktop-navigation">
        
        <ion-menu 
          contentId="main-content" 
          type="overlay"
          [disabled]="!showSidebar">
          
          <ion-header>
            <ion-toolbar color="primary" class="sidebar-header">
              <ion-title>{{ appName }}</ion-title>
            </ion-toolbar>
          </ion-header>
          
          <ion-content class="sidebar-content">
            <ion-list class="nav-list">
              <ng-container *ngFor="let item of navigationItems">
                <ion-item 
                  *ngIf="canShowNavItem(item)"
                  [routerLink]="item.route" 
                  routerLinkActive="active"
                  class="nav-item"
                  lines="none"
                  detail="false">
                  <ion-icon [name]="item.icon" slot="start"></ion-icon>
                  <ion-label>{{ item.label }}</ion-label>
                  <ion-badge *ngIf="item.badge" color="danger" class="nav-badge">
                    {{ item.badge }}
                  </ion-badge>
                </ion-item>
              </ng-container>
            </ion-list>
            
            <ion-footer class="sidebar-footer">
              <ion-list>
                <ion-item>
                  <ion-icon name="person-circle" slot="start"></ion-icon>
                  <ion-label>
                    <h3>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h3>
                    <p>{{ currentUser?.roles?.join(', ') }}</p>
                  </ion-label>
                </ion-item>
                <ion-item (click)="logout()" class="logout-item">
                  <ion-icon name="log-out" slot="start"></ion-icon>
                  <ion-label>退出登录</ion-label>
                </ion-item>
              </ion-list>
            </ion-footer>
          </ion-content>
        </ion-menu>
      </ion-split-pane>

      <!-- Main Content -->
      <div class="ion-page" id="main-content">
        <!-- Header Toolbar -->
        <ion-header>
          <ion-toolbar [color]="getHeaderColor()" class="main-header">
            <!-- Mobile menu button -->
            <ion-buttons slot="start" *ngIf="isMobile">
              <ion-menu-button></ion-menu-button>
            </ion-buttons>
            
            <!-- Desktop sidebar toggle -->
            <ion-buttons slot="start" *ngIf="!isMobile && showSidebar">
              <ion-button (click)="toggleSidebar()">
                <ion-icon name="menu"></ion-icon>
              </ion-button>
            </ion-buttons>
            
            <ion-title>{{ getPageTitle() }}</ion-title>
            
            <ion-buttons slot="end">
              <!-- Notifications -->
              <ion-button (click)="showNotifications()">
                <ion-icon name="notifications"></ion-icon>
                <ion-badge *ngIf="notificationCount > 0" color="danger" class="notification-badge">
                  {{ notificationCount }}
                </ion-badge>
              </ion-button>
              
              <!-- User menu -->
              <ion-button id="user-menu-button">
                <ion-icon name="person-circle"></ion-icon>
              </ion-button>
              
              <ion-popover trigger="user-menu-button" dismissOnSelect>
                <ng-template>
                  <ion-content>
                    <ion-list>
                      <ion-item (click)="showProfile()" lines="none">
                        <ion-icon name="person" slot="start"></ion-icon>
                        <ion-label>个人资料</ion-label>
                      </ion-item>
                      <ion-item (click)="showSettings()" lines="none">
                        <ion-icon name="settings" slot="start"></ion-icon>
                        <ion-label>设置</ion-label>
                      </ion-item>
                      <ion-item (click)="changePassword()" lines="none">
                        <ion-icon name="key" slot="start"></ion-icon>
                        <ion-label>修改密码</ion-label>
                      </ion-item>
                      <ion-item (click)="logout()" lines="none">
                        <ion-icon name="log-out" slot="start"></ion-icon>
                        <ion-label>退出登录</ion-label>
                      </ion-item>
                    </ion-list>
                  </ion-content>
                </ng-template>
              </ion-popover>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <!-- Main Content Area -->
        <ion-content class="main-content">
          <router-outlet></router-outlet>
        </ion-content>

        <!-- Mobile Bottom Tabs -->
        <ion-tabs *ngIf="isMobile" class="mobile-tabs">
          <ion-tab-bar slot="bottom">
            <ion-tab-button 
              *ngFor="let item of mobileTabItems" 
              [routerLink]="item.route"
              [tab]="item.route"
              class="mobile-tab">
              <ion-icon [name]="item.icon"></ion-icon>
              <ion-label>{{ item.label }}</ion-label>
              <ion-badge *ngIf="item.badge" color="danger" class="mobile-tab-badge">
                {{ item.badge }}
              </ion-badge>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </div>
    </ion-app>
  `,
  styles: [`
    .desktop-navigation {
      height: 100vh;
    }
    
    .sidebar-header {
      --background: var(--ion-color-primary);
      --color: white;
    }
    
    .sidebar-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .nav-list {
      flex: 1;
      padding: 1rem 0;
    }
    
    .nav-item {
      --padding-start: 1rem;
      --padding-end: 1rem;
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
      --background: transparent;
      --color: var(--ion-color-text);
    }
    
    .nav-item:hover {
      --background: var(--ion-color-light);
    }
    
    .nav-item.active {
      --background: var(--ion-color-primary);
      --color: white;
    }
    
    .nav-badge {
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }
    
    .sidebar-footer {
      padding: 1rem 0;
      border-top: 1px solid var(--ion-color-light-shade);
    }
    
    .logout-item {
      --color: var(--ion-color-danger);
    }
    
    .main-header {
      --background: var(--ion-color-primary);
      --color: white;
    }
    
    .main-content {
      height: 100%;
      overflow-y: auto;
    }
    
    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      font-size: 0.6rem;
      min-width: 16px;
      height: 16px;
      line-height: 16px;
    }
    
    .mobile-tabs {
      display: none;
    }
    
    @media (max-width: 768px) {
      .mobile-tabs {
        display: block;
      }
      
      .main-content {
        padding-bottom: 60px; /* Space for bottom tabs */
      }
    }
    
    .mobile-tab-badge {
      font-size: 0.6rem;
      min-width: 14px;
      height: 14px;
      line-height: 14px;
    }
    
    .mobile-tab {
      --color: var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
    }
  `]
})
export class NavigationShellComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  appName = '金鸿马物流安全平台';
  currentUser: User | null = null;
  isMobile = false;
  showSidebar = true;
  notificationCount = 0;
  
  navigationItems: NavItem[] = [
    {
      label: '仪表盘',
      icon: 'grid',
      route: '/dashboard',
      roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'EMPLOYEE']
    },
    {
      label: '司机管理',
      icon: 'people',
      route: '/drivers',
      roles: ['ADMIN', 'MANAGER', 'DISPATCHER']
    },
    {
      label: '车辆管理',
      icon: 'car',
      route: '/vehicles',
      roles: ['ADMIN', 'MANAGER', 'DISPATCHER']
    },
    {
      label: '订单管理',
      icon: 'document-text',
      route: '/orders',
      roles: ['ADMIN', 'MANAGER', 'DISPATCHER']
    },
    {
      label: '安全管理',
      icon: 'shield-checkmark',
      route: '/safety',
      roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER']
    },
    {
      label: '字典管理',
      icon: 'list',
      route: '/dictionary',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      label: '员工管理',
      icon: 'business',
      route: '/employees',
      roles: ['ADMIN', 'MANAGER', 'HR']
    },
    {
      label: '报表',
      icon: 'analytics',
      route: '/reports',
      roles: ['ADMIN', 'MANAGER']
    },
    {
      label: '设置',
      icon: 'settings',
      route: '/settings',
      roles: ['ADMIN']
    }
  ];
  
  mobileTabItems: NavItem[] = [
    {
      label: '首页',
      icon: 'home',
      route: '/dashboard'
    },
    {
      label: '订单',
      icon: 'document-text',
      route: '/orders'
    },
    {
      label: '司机',
      icon: 'people',
      route: '/drivers'
    },
    {
      label: '车辆',
      icon: 'car',
      route: '/vehicles'
    },
    {
      label: '我的',
      icon: 'person',
      route: '/profile'
    }
  ];

  constructor(
    private authService: AuthService,
    private layoutService: ResponsiveLayoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
    
    // Subscribe to layout changes
    this.layoutService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
      });
    
    this.layoutService.showSidebar$
      .pipe(takeUntil(this.destroy$))
      .subscribe(showSidebar => {
        this.showSidebar = showSidebar;
      });
    
    // Load user data if not already loaded
    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canShowNavItem(item: NavItem): boolean {
    if (!item.roles || !this.currentUser) {
      return true;
    }
    
    return item.roles.some(role => this.authService.hasRole(role));
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  getSidebarWhen(): string {
    return this.isMobile ? 'false' : 'true';
  }

  getHeaderColor(): string {
    return 'primary';
  }

  getPageTitle(): string {
    const url = this.router.url;
    const currentItem = this.navigationItems.find(item => url.startsWith(item.route));
    return currentItem?.label || '金鸿马物流安全平台';
  }

  logout(): void {
    this.authService.logout();
  }

  showNotifications(): void {
    // Implement notifications modal/page
    this.router.navigate(['/notifications']);
  }

  showProfile(): void {
    this.router.navigate(['/profile']);
  }

  showSettings(): void {
    this.router.navigate(['/settings']);
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }
}