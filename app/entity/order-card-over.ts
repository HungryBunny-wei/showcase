import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum OrderCardOverStatus {
  noStart = '-1', // 需要完成的订单
  start = '0', // 完成订单
  confirm = '1', // 确认订单
}

@Entity()
export class OrderCardOver extends Base {

  @Column()
  Status: OrderCardOverStatus;
  @Column('int')
  UserCardPackageId: number;
  @Column('int')
  UserId: number;
  @Column('int', {nullable: true})
  StaffId: number; // 员工Id
  @Column({type: 'int'})
  ServiceProviderId: number;
  @Column()
  ServiceProviderName: string;
  @Column({nullable: true})
  uid: string;
  @Column({nullable: true})
  Score: string;
  @Column({type: 'longtext', nullable: true})
  Evaluate: string;

}
