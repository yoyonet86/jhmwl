import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveLayoutService } from './services/responsive-layout.service';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <router-outlet></router-outlet>
    </ion-app>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    ion-app {
      height: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  
  constructor(
    private layoutService: ResponsiveLayoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize layout service
    this.layoutService.initializeTheme();
    
    // Load user session if available
    // This will be handled by the AuthService
  }
}