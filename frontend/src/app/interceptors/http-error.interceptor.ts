import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Bad Request';
              break;
            case 401:
              errorMessage = 'Unauthorized - Please log in';
              break;
            case 403:
              errorMessage = 'Forbidden - Insufficient permissions';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflict - Resource already exists';
              break;
            case 422:
              errorMessage = error.error?.message || 'Validation failed';
              break;
            case 500:
              errorMessage = 'Internal server error - Please try again later';
              break;
            case 503:
              errorMessage = 'Service temporarily unavailable';
              break;
            default:
              errorMessage = `Server Error: ${error.status} - ${error.error?.message || error.message}`;
          }
        }

        // Log error to console in development
        if (!navigator.onLine) {
          errorMessage = 'No internet connection - Please check your network';
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          method: request.method,
          error: error.error
        });

        // You could also show a toast notification here
        // this.notificationService.showError(errorMessage);

        return throwError(() => ({
          ...error,
          userMessage: errorMessage
        }));
      })
    );
  }
}