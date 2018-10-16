import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class UserTs {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  Age: number;

}
