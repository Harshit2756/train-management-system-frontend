import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { interval, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

export function usernameExistsValidator(
  authService: AuthService
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return interval(1000).pipe(
      switchMap(() => {
        if (!control.value || control.pristine) {
          return of(null);
        }
        return authService.checkUsernameExists(control.value).pipe(
          map((isTaken) => (isTaken ? { usernameTaken: true } : null)),
          catchError(() => of(null))
        );
      })
    );
  };
}
