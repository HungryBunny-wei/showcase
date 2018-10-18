import {Column, Entity} from 'typeorm';
import {Base} from './base';

@Entity('User')
export class User extends Base {

  @Column()
  Name: string;

  @Column()
  Phone: string;

  @Column({nullable: true})
  OpenId: string;

  @Column()
  UserType: 'user' | 'service' | 'staff';

  @Column({type: 'int', nullable: true})
  ServiceProviderId: number;

  @Column({length: 1024, nullable: true})
  AvatarUrl: string;

  @Column({nullable: true})
  NickName: string;

  @Column({type: 'datetime', nullable: true})
  LoginTime: Date;

  @Column()
  Manage: 'none' | 'manage' | 'admin';

  @Column('datetime', {nullable: true})
  Birthday: Date;

  @Column({nullable: true})
  Password: string;

  @Column('tinyint', {nullable: true})
  register: boolean;
}
