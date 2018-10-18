import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum OrderCardStatus {
  start = '0', // 客户下单
  confirm = '1', // 确认订单
}

@Entity('Order_Card')
export class OrderCard extends Base {

  @Column()
  Status: OrderCardStatus;
  @Column('int')
  UserId: number;
  @Column('int')
  CardId: number; // 月卡Id
  @Column('decimal')
  RealPayment: string;
  @Column({type: 'datetime', nullable: true})
  ConfirmTime: Date;
}
