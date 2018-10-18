import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum OrderCardStatus {
  start = '0', // 客户下单
  confirm = '1', // 确认订单
}

@Entity()
export class OrderCard extends Base {

  @Column()
  Status: OrderCardStatus;
  @Column('int')
  UserId: number;
  @Column('int')
  CardId: number; // 月卡Id
  @Column()
  Title: string; // 标题;
  @Column('longtext')
  Explain: number; // 说明
  @Column('decimal')
  Price: string; // 价格
  @Column('decimal')
  OriginalPrice: string; // 原价
  // @Column('decimal')
  // RealPayment: string;

  @Column({type: 'datetime', nullable: true})
  ConfirmTime: Date;
}
