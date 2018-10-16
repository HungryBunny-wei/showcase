import {Column, Entity} from 'typeorm';
import {Base} from './base';

@Entity('User_CarInfo')
export class UserCarInfo extends Base {

  @Column('int')
  Version: number;

  @Column('int')
  IsNew: number;

  @Column()
  AddressName: string;

  @Column()
  Address: string;

  @Column()
  Latitude: string;

  @Column()
  Longitude: string;

  @Column()
  Brand: string;

  @Column()
  CarModel: string;

  @Column()
  Motor: string;

  @Column()
  LicencePlate: string;

  @Column('int')
  UserId: number;

}
