import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserEntity} from './user.entity';

@Entity({
    name: 'visual_keys',
    schema: 'auth',
})
@Index([ 'user', 'name' ])
@Index([ 'user', 'value' ])
export class VisualKeyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, user => user.visualKeys)
    user: UserEntity;

    @Column({ type: 'varchar', length: 256 })
    name: string;

    @Column({ type: 'varchar', length: 256 })
    value: string;
}
