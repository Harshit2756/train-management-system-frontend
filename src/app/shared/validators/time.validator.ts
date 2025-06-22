import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const departureTime = formGroup.get('departureTime')?.value;
    const arrivalTime = formGroup.get('arrivalTime')?.value;

    if (departureTime && arrivalTime && arrivalTime <= departureTime) {
      return { arrivalTimeBeforeDeparture: true };
    }

    return null;
  };
}
