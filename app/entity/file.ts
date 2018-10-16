import {Column, Entity} from 'typeorm';
import {Base} from './base';

@Entity()
export class File extends Base {

  @Column()
  uid: string;
  @Column()
  FilePath: string;
  @Column()
  Filename: string;
}
