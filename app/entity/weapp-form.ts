import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class WeappForm {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({type: 'datetime'})
  CreaTime: Date;

  @Column()
  FormId: string;

  @Column('int')
  UserId: number;
}
