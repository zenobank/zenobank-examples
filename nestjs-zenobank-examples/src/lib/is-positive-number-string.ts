import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isNumberString,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsPositiveNumberStringConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return isNumberString(value) && Number(value) > 0;
  }

  defaultMessage() {
    return '$property must be a positive number';
  }
}

export function IsPositiveNumberString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPositiveNumberStringConstraint,
    });
  };
}
