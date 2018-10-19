import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum OrderInfoStatus {
  start = '0', // 预约
  over = '1', // 预约完成
}

@Entity('Order_Info')
export class OrderInfo extends Base {

  @Column('int')
  Status: OrderInfoStatus;
  @Column('int')
  UserId: number;
  @Column('datetime')
  StartTime: Date; // 预约日期
  @Column()
  StartTimeSlot: string; // 预约时间段
  @Column({type: 'datetime', nullable: true})
  OverTime: Date; // 完成时间
  @Column()
  Name: string; // 名称
  @Column()
  Phone: string; // 手机
  @Column({type: 'int', nullable: true})
  ServiceProviderId: number; // 服务商

}
