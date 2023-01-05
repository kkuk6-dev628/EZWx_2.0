import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthSignupDto {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  confirmPassword: string;

  @IsNotEmpty()
  hearAbout: string;

  @IsNotEmpty()
  certifications: { name: string; description: string }[];
}

export class AuthSinginDto {
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
