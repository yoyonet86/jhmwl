import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';

/**
 * 主题类型枚举
 */
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark'
}

/**
 * 主题服务
 * 提供主题切换、检测、持久化等功能
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'jhm-theme-preference';
  private readonly SYSTEM_THEME_KEY = 'prefers-color-scheme';
  
  private currentThemeSubject = new BehaviorSubject<ThemeType>(this.getInitialTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
    this.listenForSystemThemeChanges();
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeType {
    return this.currentThemeSubject.value;
  }

  /**
   * 切换主题
   * @param theme 目标主题类型
   */
  switchTheme(theme: ThemeType): void {
    if (theme !== this.getCurrentTheme()) {
      this.applyTheme(theme);
      this.currentThemeSubject.next(theme);
      this.saveThemePreference(theme);
      console.log(`[主题系统] 主题已切换到: ${theme === ThemeType.LIGHT ? '浅色' : '深色'}`);
    }
  }

  /**
   * 切换到浅色主题
   */
  switchToLight(): void {
    this.switchTheme(ThemeType.LIGHT);
  }

  /**
   * 切换到深色主题
   */
  switchToDark(): void {
    this.switchTheme(ThemeType.DARK);
  }

  /**
   * 切换到系统偏好
   */
  switchToSystem(): void {
    const systemTheme = this.getSystemTheme();
    this.switchTheme(systemTheme);
  }

  /**
   * 检查是否为浅色主题
   */
  isLightTheme(): boolean {
    return this.getCurrentTheme() === ThemeType.LIGHT;
  }

  /**
   * 检查是否为深色主题
   */
  isDarkTheme(): boolean {
    return this.getCurrentTheme() === ThemeType.DARK;
  }

  /**
   * 获取系统偏好主题
   */
  getSystemTheme(): ThemeType {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? ThemeType.DARK : ThemeType.LIGHT;
    }
    return ThemeType.LIGHT;
  }

  /**
   * 检测系统是否使用深色模式
   */
  isSystemDark(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  /**
   * 监听系统主题变化
   */
  private listenForSystemThemeChanges(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // 只有当用户选择"跟随系统"时才自动切换
        const savedTheme = this.getSavedTheme();
        if (!savedTheme) {
          const newTheme = e.matches ? ThemeType.DARK : ThemeType.LIGHT;
          this.switchTheme(newTheme);
        }
      });
    }
  }

  /**
   * 初始化主题
   */
  private initializeTheme(): void {
    const initialTheme = this.getInitialTheme();
    this.applyTheme(initialTheme);
  }

  /**
   * 获取初始主题
   */
  private getInitialTheme(): ThemeType {
    const savedTheme = this.getSavedTheme();
    if (savedTheme) {
      return savedTheme;
    }

    // 如果没有保存的偏好，使用系统偏好
    return this.getSystemTheme();
  }

  /**
   * 获取保存的主题偏好
   */
  private getSavedTheme(): ThemeType | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved && (saved === ThemeType.LIGHT || saved === ThemeType.DARK)) {
          return saved as ThemeType;
        }
      }
    } catch (error) {
      console.warn('[主题系统] 无法读取本地存储的主题偏好:', error);
    }
    return null;
  }

  /**
   * 保存主题偏好
   */
  private saveThemePreference(theme: ThemeType): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.THEME_KEY, theme);
      }
    } catch (error) {
      console.warn('[主题系统] 无法保存主题偏好到本地存储:', error);
    }
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: ThemeType): void {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      
      // 移除所有主题类
      htmlElement.classList.remove('theme-light', 'theme-dark');
      
      // 添加当前主题类
      htmlElement.classList.add(theme === ThemeType.LIGHT ? 'theme-light' : 'theme-dark');
      
      // 设置data-theme属性
      htmlElement.setAttribute('data-theme', theme);
      
      // 更新meta主题色（移动端状态栏）
      this.updateMetaThemeColor(theme);
    }
  }

  /**
   * 更新meta主题色
   */
  private updateMetaThemeColor(theme: ThemeType): void {
    if (typeof document !== 'undefined') {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        const color = theme === ThemeType.LIGHT ? '#ffffff' : '#121212';
        metaThemeColor.setAttribute('content', color);
      }
    }
  }

  /**
   * 获取主题显示名称
   */
  getThemeDisplayName(theme: ThemeType): string {
    switch (theme) {
      case ThemeType.LIGHT:
        return '浅色主题';
      case ThemeType.DARK:
        return '深色主题';
      default:
        return '未知主题';
    }
  }

  /**
   * 获取主题图标
   */
  getThemeIcon(theme: ThemeType): string {
    switch (theme) {
      case ThemeType.LIGHT:
        return 'sunny'; // 晴天图标
      case ThemeType.DARK:
        return 'moon'; // 月亮图标
      default:
        return 'settings'; // 设置图标
    }
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): Array<{ type: ThemeType; name: string; icon: string }> {
    return [
      {
        type: ThemeType.LIGHT,
        name: this.getThemeDisplayName(ThemeType.LIGHT),
        icon: this.getThemeIcon(ThemeType.LIGHT)
      },
      {
        type: ThemeType.DARK,
        name: this.getThemeDisplayName(ThemeType.DARK),
        icon: this.getThemeIcon(ThemeType.DARK)
      }
    ];
  }
}
