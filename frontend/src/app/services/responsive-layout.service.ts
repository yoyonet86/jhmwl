import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  orientation: 'portrait' | 'landscape';
  sidebarMode: 'side' | 'over' | 'push';
  showSidebar: boolean;
  headerVariant: 'default' | 'compact' | 'minimal';
  theme: 'light' | 'dark' | 'auto';
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveLayoutService {
  private readonly mobileBreakpoint = environment.ui.responsiveBreakpoints.mobile;
  private readonly tabletBreakpoint = environment.ui.responsiveBreakpoints.tablet;
  private readonly desktopBreakpoint = environment.ui.responsiveBreakpoints.desktop;

  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeScreen: false,
    orientation: 'portrait',
    sidebarMode: 'side',
    showSidebar: true,
    headerVariant: 'default',
    theme: environment.ui.defaultTheme as 'light' | 'dark'
  });

  public layoutConfig$ = this.layoutConfigSubject.asObservable();
  
  public isMobile$ = this.layoutConfig$.pipe(map(config => config.isMobile), shareReplay(1));
  public isTablet$ = this.layoutConfig$.pipe(map(config => config.isTablet), shareReplay(1));
  public isDesktop$ = this.layoutConfig$.pipe(map(config => config.isDesktop), shareReplay(1));
  public isLargeScreen$ = this.layoutConfig$.pipe(map(config => config.isLargeScreen), shareReplay(1));
  
  public sidebarMode$ = this.layoutConfig$.pipe(map(config => config.sidebarMode), shareReplay(1));
  public showSidebar$ = this.layoutConfig$.pipe(map(config => config.showSidebar), shareReplay(1));
  public headerVariant$ = this.layoutConfig$.pipe(map(config => config.headerVariant), shareReplay(1));
  public theme$ = this.layoutConfig$.pipe(map(config => config.theme), shareReplay(1));
  public orientation$ = this.layoutConfig$.pipe(map(config => config.orientation), shareReplay(1));

  constructor(private breakpointObserver: BreakpointObserver) {
    this.initializeLayoutObserver();
  }

  private initializeLayoutObserver(): void {
    // Define breakpoints for different screen sizes
    const breakpointMap = new Map([
      [Breakpoints.Handset, 'handset'],
      [Breakpoints.Tablet, 'tablet'],
      [Breakpoints.Web, 'web'],
      [Breakpoints.HandsetPortrait, 'handset-portrait'],
      [Breakpoints.HandsetLandscape, 'handset-landscape'],
      [Breakpoints.TabletPortrait, 'tablet-portrait'],
      [Breakpoints.TabletLandscape, 'tablet-landscape']
    ]);

    // Observe breakpoints and update layout config
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web,
      Breakpoints.HandsetPortrait,
      Breakpoints.HandsetLandscape,
      Breakpoints.TabletPortrait,
      Breakpoints.TabletLandscape,
      `(max-width: ${this.mobileBreakpoint}px)`,
      `(min-width: ${this.mobileBreakpoint + 1}px) and (max-width: ${this.tabletBreakpoint}px)`,
      `(min-width: ${this.tabletBreakpoint + 1}px) and (max-width: ${this.desktopBreakpoint}px)`,
      `(min-width: ${this.desktopBreakpoint + 1}px)`
    ]).subscribe(result => {
      this.updateLayoutConfig(result);
    });
  }

  private updateLayoutConfig(breakpointResult: any): void {
    const currentConfig = this.layoutConfigSubject.value;
    
    // Determine screen size
    const isMobile = this.breakpointObserver.isMatched(`(max-width: ${this.mobileBreakpoint}px)`);
    const isTablet = this.breakpointObserver.isMatched(`(min-width: ${this.mobileBreakpoint + 1}px) and (max-width: ${this.tabletBreakpoint}px)`);
    const isDesktop = this.breakpointObserver.isMatched(`(min-width: ${this.tabletBreakpoint + 1}px) and (max-width: ${this.desktopBreakpoint}px)`);
    const isLargeScreen = this.breakpointObserver.isMatched(`(min-width: ${this.desktopBreakpoint + 1}px)`);

    // Determine orientation
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    // Update layout based on screen size
    let sidebarMode: 'side' | 'over' | 'push';
    let showSidebar: boolean;
    let headerVariant: 'default' | 'compact' | 'minimal';
    
    if (isMobile) {
      sidebarMode = 'over';
      showSidebar = false;
      headerVariant = 'compact';
    } else if (isTablet) {
      sidebarMode = 'push';
      showSidebar = true;
      headerVariant = 'default';
    } else {
      sidebarMode = 'side';
      showSidebar = true;
      headerVariant = 'default';
    }

    const newConfig: LayoutConfig = {
      ...currentConfig,
      isMobile,
      isTablet,
      isDesktop,
      isLargeScreen,
      orientation,
      sidebarMode,
      showSidebar,
      headerVariant
    };

    this.layoutConfigSubject.next(newConfig);
  }

  // Public methods to control layout
  toggleSidebar(): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = {
      ...currentConfig,
      showSidebar: !currentConfig.showSidebar
    };
    this.layoutConfigSubject.next(newConfig);
  }

  setSidebarVisibility(visible: boolean): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = {
      ...currentConfig,
      showSidebar: visible && (currentConfig.isTablet || currentConfig.isDesktop)
    };
    this.layoutConfigSubject.next(newConfig);
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = {
      ...currentConfig,
      theme
    };
    this.layoutConfigSubject.next(newConfig);
    this.applyTheme(theme);
  }

  setHeaderVariant(variant: 'default' | 'compact' | 'minimal'): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = {
      ...currentConfig,
      headerVariant: variant
    };
    this.layoutConfigSubject.next(newConfig);
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    const body = document.body;
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme class
    body.classList.add(`${theme}-theme`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  getCurrentLayoutConfig(): LayoutConfig {
    return this.layoutConfigSubject.value;
  }

  // Utility methods
  isBreakpointMatched(query: string): boolean {
    return this.breakpointObserver.isMatched(query);
  }

  getScreenSize(): 'mobile' | 'tablet' | 'desktop' | 'large' {
    const config = this.getCurrentLayoutConfig();
    if (config.isMobile) return 'mobile';
    if (config.isTablet) return 'tablet';
    if (config.isDesktop) return 'desktop';
    return 'large';
  }

  shouldShowBottomTabs(): boolean {
    return this.getCurrentLayoutConfig().isMobile;
  }

  shouldShowSideNav(): boolean {
    const config = this.getCurrentLayoutConfig();
    return config.isTablet || config.isDesktop;
  }

  // Load saved theme on initialization
  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as string | null;
    const theme: 'light' | 'dark' | 'auto' = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme as 'light' | 'dark' : environment.ui.defaultTheme;
    this.setTheme(theme);
  }
}