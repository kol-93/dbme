import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId} from 'typeorm';
import {ACCESS_RIGHT} from '../../enum/e.access.right';
import {UserRoleEntity} from './user.role.entity';

@Entity({
    name: 'role_accesses',
    schema: 'auth',
})
export class RoleAccessEntity {
    @ManyToOne(type => UserRoleEntity, entity => entity.rights)
    @JoinColumn({
        name: 'role_id',
        referencedColumnName: 'id',
    })
    role: UserRoleEntity;

    @PrimaryColumn()
    @RelationId((entity: RoleAccessEntity) => entity.role)
    roleId: number;

    @PrimaryColumn({ type: 'varchar', length: 256 })
    policy: ACCESS_RIGHT;

    @Column({ type: 'boolean' })
    value: boolean;
}
