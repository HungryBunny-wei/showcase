import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum ServiceProviderStatus {
  start = '0', // 申请
  confirm = '1', // 确认
  refuse = '2', // 拒绝
  del = '3', // 删除
}

@Entity('ServiceProvider')
export class ServiceProvider extends Base {

  @Column()
  Name: string;

  @Column('int')
  UserId: number;

  @Column({nullable: true})
  AddressName: string;

  @Column()
  Address: string;

  @Column({nullable: true})
  Latitude: string;

  @Column({nullable: true})
  Longitude: string;

  @Column()
  Phone: string;

  @Column()
  Status: ServiceProviderStatus;
}
