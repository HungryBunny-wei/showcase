import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum MonthCardType {
  vip = '0', // 高级会员
  singleDouble = '1', // 单双月会员
}

@Entity('User_CardPackage')
export class UserCardPackage extends Base {
  @Column('datetime')
  StartTime: Date;
  @Column('datetime')
  EndTime: Date;
  @Column('int')
  Num: number;
  @Column('int')
  Max: number;
  @Column('int')
  UserId: number;
  @Column({type: 'int'})
  ServiceProviderId: number;
  @Column()
  ServiceProviderName: string;
  @Column('int')
  Days: number;
  @Column('int')
  OrderCardId: number;
  @Column({type: 'datetime', nullable: true})
  BuyTime: Date;

  /**
   * 月卡信息
   */
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
}
