export class CreateUserDto {
  firstname: string;

  lastname: string;

  email: string;

  hash: string;

  hearAbout: string;

  certifications: { name: string; description: string }[];
}
