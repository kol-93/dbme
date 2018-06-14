import {Entity, PrimaryColumn, Column, Index, ManyToOne, OneToMany} from 'typeorm';
import {EncryptedTokenEntity} from './encrypted.token.entity';
import {SessionEntity} from './session.entity';
import {UserRoleEntity} from './user.role.entity';
import {VisualKeyEntity} from './visual.key.entity';

@Entity({
    name: 'users',
    schema: 'auth',
})
export class UserEntity {
    @PrimaryColumn({ type: 'varchar', length: '256' })
    login: string;

    @Index()
    @Column({ type: 'varchar', length: '256' })
    password: string;

    @Column({ type: 'varchar', length: '256' })
    name: string;

    @ManyToOne(type => UserRoleEntity)
    role: UserRoleEntity;

    @OneToMany(type => VisualKeyEntity, key => key.user)
    visualKeys?: VisualKeyEntity[];

    @OneToMany(type => EncryptedTokenEntity, token => token.user)
    tokens?: EncryptedTokenEntity[];

    @OneToMany(type => SessionEntity, session => session.user)
    sessions?: SessionEntity[];
}
