import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {UserEntity} from './user.entity';

@Entity({
    name: 'encrypted_tokens',
    schema: 'auth',
})
export class EncryptedTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(type => UserEntity, user => user.tokens)
    user: UserEntity;

    @Column({ type: 'varchar', length: 256 })
    name: string;

    @CreateDateColumn()
    created: Date;

    @Column({ type: 'varchar', length: 2048 })
    key: string;

    @Column({ type: 'varchar', length: 2048 })
    passphrase: string;
}
