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

  @Column('tinyint')
  StaffFlag: boolean; // 是服务员

  @Column('tinyint')
  ServerFlag: boolean; // 是服务商

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

  @Column({nullable: true})
  CardTitle: string;
  @Column('datetime', {nullable: true})
  CardStartTime: Date;
  @Column('datetime', {nullable: true})
  CardEndTime: Date;
  @Column('int', {nullable: true})
  CardDays: number;

}
