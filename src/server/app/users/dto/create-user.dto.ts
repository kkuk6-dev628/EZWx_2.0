import { Provider } from 'src/server/common/types/user';

export class CreateUserDto {
  username: string;
  email: string;
  hash: string;
}
