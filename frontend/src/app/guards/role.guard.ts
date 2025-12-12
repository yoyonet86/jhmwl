import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  ActivatedRouteSnapshot,
  RouterStateSnapshot 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export interface RoleGuardConfig {
  roles?: string[];
  permissions?: { resource: string; action: string }[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const config = route.data['roles'] as RoleGuardConfig;
    
    if (!config) {
      return this.checkBasicAuth();
    }

    return this.checkRolePermissions(config, state.url);
  }

  private checkBasicAuth(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }

  private checkRolePermissions(config: RoleGuardConfig, url: string): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Check roles
        if (config.roles && config.roles.length > 0) {
          const hasRequiredRole = config.roles.some(role => this.authService.hasRole(role));
          if (!hasRequiredRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check permissions
        if (config.permissions && config.permissions.length > 0) {
          const hasRequiredPermission = config.permissions.some(permission =>
            this.authService.hasPermission(permission.resource, permission.action)
          );
          if (!hasRequiredPermission) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}