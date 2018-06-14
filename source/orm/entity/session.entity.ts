import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {UserEntity} from './user.entity';

@Entity({
    name: 'sessions',
    schema: 'auth',
})
@Index(['uuid', 'expires'])
@Index(['uuid', 'user', 'expires'])
export class SessionEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @CreateDateColumn()
    created: Date;

    @Column({ type: 'timestamp' })
    expires: Date;

    @Column({ type: 'varchar', length: 1024, name: 'access_key' })
    accessKey: string;

    @Column({ type: 'varchar', length: 1024, name: 'refresh_key' })
    refreshKey: string;

    @ManyToOne(type => UserEntity, user => user.sessions)
    user: UserEntity;
}
