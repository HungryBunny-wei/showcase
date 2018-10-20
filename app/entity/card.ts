import {Column, Entity} from 'typeorm';
import {Base} from './base';

export enum CardStatus {
  'enable' = 1,
  'close' = 2,
}

@Entity()
export class Card extends Base {
  @Column()
  Title: string; // 标题;
  @Column('longtext')
  Explain: string; // 说明
  @Column('decimal')
  Price: string; // 价格
  @Column('decimal')
  OriginalPrice: string; // 原价
  @Column('int')
  Max: number; // 原价
  @Column()
  Status: CardStatus;
}
