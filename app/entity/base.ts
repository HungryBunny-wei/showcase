import {CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

export abstract class Base {

  @PrimaryGeneratedColumn()
  Id: number;

  @CreateDateColumn({type: 'datetime'})
  CreaTime: Date;

  @UpdateDateColumn({type: 'datetime'})
  ModiTime: Date;

}
