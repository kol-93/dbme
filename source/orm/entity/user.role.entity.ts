import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {RoleAccessEntity} from './role.access.entity';

@Entity({
    name: 'user_roles',
    schema: 'auth',
})
export class UserRoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 256 })
    name: string;

    @Column({ type: 'boolean', name: 'default_policy' })
    defaultPolicy: boolean;

    @OneToMany(type => RoleAccessEntity, access => access.role)
    rights?: RoleAccessEntity[];
}
