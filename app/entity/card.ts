import {Column, Entity} from 'typeorm';
import {Base} from './base';

@Entity()
export class Card extends Base {
  @Column()
  Title: string; // 标题;
  @Column('longtext')
  Explain: number; // 说明
  @Column('decimal')
  Price: string; // 价格
  @Column('decimal')
  OriginalPrice: string; // 原价
}
