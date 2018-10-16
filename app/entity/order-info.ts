import {Column, Entity} from 'typeorm';
import {Base} from './base';

@Entity('Order_Info')
export class OrderInfo extends Base {

  @Column('int')
  Status: number;

  @Column('int')
  UserCarInfoId: number;
  @Column('int')
  UserId: number;

  @Column('datetime')
  StartTime: Date;
  @Column('datetime')
  EndTime: Date;
  @Column({type: 'datetime', nullable: true})
  ServiceTime: Date;
  @Column({type: 'datetime', nullable: true})
  ReallyTime: Date;
  @Column()
  AddressName: string;
  @Column()
  Address: string;
  @Column()
  Latitude: string;
  @Column()
  Longitude: string;
  @Column()
  ServiceType: string;
  @Column()
  Name: string;
  @Column()
  Phone: string;
  @Column()
  PaymentMethod: string;
  @Column('decimal')
  RealPayment: string;

  @Column({type: 'int', nullable: true})
  CardId: number;
  @Column({type: 'int', nullable: true})
  ServiceProviderId: number;

}
