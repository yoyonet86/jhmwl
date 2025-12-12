import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ResponsiveLayoutService } from '../../services/responsive-layout.service';
import {
  CaptchaChallenge,
  VerificationCodeRequest,
  LoginRequest,
  PhoneLoginRequest
} from '../../models/auth.models';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container" [class.mobile]="isMobile">
      <div class="login-header">
        <h1>{{ appName }}</h1>
        <p>请登录您的账户</p>
      </div>

      <div class="login-form-container">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title>用户登录</ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <!-- Login Method Toggle -->
            <div class="login-method-toggle">
              <ion-segment value="{{ loginMethod }}" (ionChange)="onLoginMethodChange($event)">
                <ion-segment-button value="password">
                  <ion-label>密码登录</ion-label>
                </ion-segment-button>
                <ion-segment-button value="sms">
                  <ion-label>短信验证</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              
              <!-- Password Login Form -->
              <div *ngIf="loginMethod === 'password'" class="form-section">
                <ion-item class="form-item">
                  <ion-label position="floating">手机号</ion-label>
                  <ion-input 
                    formControlName="username" 
                    type="tel"
                    inputmode="numeric"
                    placeholder="请输入手机号"
                    [disabled]="isLoading">
                  </ion-input>
                </ion-item>

                <ion-item class="form-item">
                  <ion-label position="floating">密码</ion-label>
                  <ion-input 
                    formControlName="password" 
                    [type]="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
                    [disabled]="isLoading">
                    <ion-icon 
                      name="{{ showPassword ? 'eye-off' : 'eye' }}" 
                      slot="end"
                      (click)="togglePasswordVisibility()"
                      class="password-toggle">
                    </ion-icon>
                  </ion-input>
                </ion-item>

                <!-- CAPTCHA Section -->
                <div *ngIf="showCaptcha" class="captcha-section">
                  <div class="captcha-question">
                    <ion-label>安全验证</ion-label>
                    <p>{{ captchaChallenge?.question }}</p>
                  </div>
                  
                  <ion-item class="form-item">
                    <ion-label position="floating">验证码</ion-label>
                    <ion-input 
                      formControlName="captchaCode" 
                      type="text"
                      placeholder="请输入验证码"
                      maxlength="4"
                      [disabled]="isLoading">
                    </ion-input>
                  </ion-item>
                </div>
              </div>

              <!-- SMS Login Form -->
              <div *ngIf="loginMethod === 'sms'" class="form-section">
                <ion-item class="form-item">
                  <ion-label position="floating">手机号</ion-label>
                  <ion-input 
                    formControlName="phone" 
                    type="tel"
                    inputmode="numeric"
                    placeholder="请输入手机号"
                    [disabled]="isLoading">
                  </ion-input>
                </ion-item>

                <div class="captcha-section">
                  <div *ngIf="showPhoneCaptcha" class="captcha-question">
                    <ion-label>安全验证</ion-label>
                    <p>{{ phoneCaptchaChallenge?.question }}</p>
                  </div>
                  
                  <ion-item *ngIf="showPhoneCaptcha" class="form-item">
                    <ion-label position="floating">验证码</ion-label>
                    <ion-input 
                      formControlName="captchaCode" 
                      type="text"
                      placeholder="请输入验证码"
                      maxlength="4"
                      [disabled]="isLoading">
                    </ion-input>
                  </ion-item>
                </div>

                <ion-item class="form-item">
                  <ion-label position="floating">短信验证码</ion-label>
                  <ion-input 
                    formControlName="code" 
                    type="tel"
                    inputmode="numeric"
                    placeholder="请输入6位短信验证码"
                    maxlength="6"
                    [disabled]="isLoading || !canRequestCode">
                    <ion-button 
                      fill="clear" 
                      slot="end"
                      (click)="requestVerificationCode()"
                      [disabled]="!canRequestCode || isLoading">
                      {{ codeButtonText }}
                    </ion-button>
                  </ion-input>
                </ion-item>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="error-message">
                <ion-icon name="alert-circle" slot="start"></ion-icon>
                <ion-label>{{ errorMessage }}</ion-label>
              </div>

              <!-- Login Button -->
              <ion-button 
                type="submit" 
                expand="block" 
                size="large"
                [disabled]="loginForm.invalid || isLoading"
                class="login-button">
                <ion-spinner *ngIf="isLoading" name="crescent" slot="start"></ion-spinner>
                {{ isLoading ? '登录中...' : '登录' }}
              </ion-button>

              <!-- Additional Links -->
              <div class="additional-links">
                <ion-button 
                  fill="clear" 
                  size="small" 
                  (click)="showForgotPassword()">
                  忘记密码？
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Demo Credentials -->
        <ion-card *ngIf="!isProduction" class="demo-card">
          <ion-card-header>
            <ion-card-title>演示账户</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>管理员:</strong> 13800138000 / AdminP@ssw0rd123</p>
            <p><strong>司机:</strong> 13800138001 / DriverP@ssw0rd123</p>
            <p><strong>调度员:</strong> 13800138002 / DispatcherP@ssw0rd123</p>
          </ion-card-content>
        </ion-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
      padding: 2rem;
      overflow-y: auto;
    }
    
    .login-container.mobile {
      padding: 1rem;
    }
    
    .login-header {
      text-align: center;
      color: white;
      margin-bottom: 2rem;
    }
    
    .login-header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .login-header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .login-form-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
    }
    
    .login-card {
      margin: 0;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: visible;
    }
    
    .login-method-toggle {
      margin-bottom: 1.5rem;
    }
    
    .form-section {
      margin-bottom: 1rem;
    }
    
    .form-item {
      margin-bottom: 1rem;
      --border-radius: 8px;
    }
    
    .password-toggle {
      cursor: pointer;
      padding: 4px;
      color: var(--ion-color-medium);
    }
    
    .captcha-section {
      background: var(--ion-color-light);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .captcha-question {
      margin-bottom: 0.5rem;
    }
    
    .captcha-question ion-label {
      font-weight: 600;
      color: var(--ion-color-dark);
    }
    
    .captcha-question p {
      margin: 0.5rem 0 0 0;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    
    .error-message {
      background: var(--ion-color-danger);
      color: white;
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
    }
    
    .error-message ion-icon {
      margin-right: 0.5rem;
    }
    
    .login-button {
      --border-radius: 8px;
      margin-top: 1rem;
      font-weight: 600;
    }
    
    .additional-links {
      text-align: center;
      margin-top: 1rem;
    }
    
    .demo-card {
      margin-top: 1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .demo-card ion-card-header {
      padding-bottom: 0.5rem;
    }
    
    .demo-card ion-card-title {
      color: white;
      font-size: 1rem;
    }
    
    .demo-card p {
      margin: 0.25rem 0;
      font-size: 0.85rem;
      opacity: 0.9;
    }
    
    .demo-card strong {
      color: var(--ion-color-warning);
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  appName = '金鸿马物流安全平台';
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  loginMethod: 'password' | 'sms' = 'password';
  isMobile = false;
  isProduction = false;

  // CAPTCHA and SMS
  captchaChallenge?: CaptchaChallenge;
  phoneCaptchaChallenge?: CaptchaChallenge;
  showCaptcha = false;
  showPhoneCaptcha = false;

  // SMS timer
  canRequestCode = true;
  codeRequestCountdown = 0;
  private countdownInterval?: any;
  codeButtonText = '获取验证码';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private layoutService: ResponsiveLayoutService,
    private router: Router
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
        }
      });

    // Check layout
    this.layoutService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMobile => {
        this.isMobile = isMobile;
      });

    // Check production environment
    this.isProduction = !window.location.hostname.includes('localhost');

    // Load initial CAPTCHA for password login
    this.loadCaptcha();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearCountdown();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      // Password login fields
      username: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      captchaCode: [''],

      // SMS login fields
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onLoginMethodChange(event: any): void {
    this.loginMethod = event.detail.value;
    this.errorMessage = '';
    this.loginForm.reset();
    
    // Clear countdown
    this.clearCountdown();
    this.canRequestCode = true;
    this.codeButtonText = '获取验证码';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.loginMethod === 'password') {
        await this.loginWithPassword();
      } else {
        await this.loginWithSMS();
      }
    } catch (error: any) {
      this.errorMessage = error?.userMessage || error?.message || '登录失败，请重试';
      
      // Reload CAPTCHA on error
      if (this.loginMethod === 'password' && this.showCaptcha) {
        this.loadCaptcha();
      }
      if (this.loginMethod === 'sms' && this.showPhoneCaptcha) {
        this.loadPhoneCaptcha();
      }
    } finally {
      this.isLoading = false;
    }
  }

  private async loginWithPassword(): Promise<void> {
    const formValue = this.loginForm.value;
    const request: LoginRequest = {
      username: formValue.username,
      password: formValue.password,
      captchaCode: this.showCaptcha ? formValue.captchaCode : undefined,
      captchaToken: this.captchaChallenge?.token
    };

    await this.authService.loginWithPassword(request).toPromise();
    this.router.navigate(['/dashboard']);
  }

  private async loginWithSMS(): Promise<void> {
    const formValue = this.loginForm.value;
    const request: PhoneLoginRequest = {
      phone: formValue.phone,
      code: formValue.code,
      captchaCode: this.showPhoneCaptcha ? formValue.captchaCode : undefined,
      captchaToken: this.phoneCaptchaChallenge?.token
    };

    await this.authService.loginWithPhone(request).toPromise();
    this.router.navigate(['/dashboard']);
  }

  async requestVerificationCode(): Promise<void> {
    if (!this.canRequestCode) return;

    const phone = this.loginForm.get('phone')?.value;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      this.errorMessage = '请输入正确的手机号';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Load CAPTCHA if needed
      if (!this.phoneCaptchaChallenge) {
        await this.loadPhoneCaptcha();
      }

      const request: VerificationCodeRequest = {
        phone,
        captchaToken: this.phoneCaptchaChallenge?.token || '',
        captchaCode: this.loginForm.get('captchaCode')?.value || ''
      };

      await this.authService.requestVerificationCode(request).toPromise();
      
      // Start countdown
      this.startCountdown(60);
      this.errorMessage = '';

    } catch (error: any) {
      this.errorMessage = error?.userMessage || '发送验证码失败，请重试';
      // Reload CAPTCHA on error
      this.loadPhoneCaptcha();
    } finally {
      this.isLoading = false;
    }
  }

  private loadCaptcha(): void {
    this.authService.getCaptcha().subscribe({
      next: (captcha) => {
        this.captchaChallenge = captcha;
        this.showCaptcha = true;
      },
      error: (error) => {
        console.error('Failed to load CAPTCHA:', error);
        this.showCaptcha = false;
      }
    });
  }

  private loadPhoneCaptcha(): void {
    this.authService.getCaptcha().subscribe({
      next: (captcha) => {
        this.phoneCaptchaChallenge = captcha;
        this.showPhoneCaptcha = true;
      },
      error: (error) => {
        console.error('Failed to load phone CAPTCHA:', error);
        this.showPhoneCaptcha = false;
      }
    });
  }

  private startCountdown(seconds: number): void {
    this.canRequestCode = false;
    this.codeRequestCountdown = seconds;
    this.codeButtonText = `${seconds}秒后重发`;

    this.countdownInterval = setInterval(() => {
      this.codeRequestCountdown--;
      this.codeButtonText = `${this.codeRequestCountdown}秒后重发`;

      if (this.codeRequestCountdown <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
    this.canRequestCode = true;
    this.codeButtonText = '获取验证码';
    this.codeRequestCountdown = 0;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  showForgotPassword(): void {
    // Implement forgot password functionality
    this.router.navigate(['/forgot-password']);
  }
}