import {Column, Entity, JoinColumn, OneToMany, PrimaryColumn} from 'typeorm';
import {SchemaColumnEntity} from './schema.column.entity';
import {SchemaTableConstraintEntity} from './schema.table.constraint.entity';

@Entity({
    name: 'tables',
    schema: 'information_schema',
    synchronize: false,
    orderBy: {
        tableCatalog: 'ASC',
        tableSchema: 'ASC',
        tableName: 'ASC',
    }
})
export class SchemaTableEntity {
    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_catalog' })
    tableCatalog: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_schema' })
    tableSchema: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_name' })
    tableName: string;

    @Column({ type: 'varchar', length: 256, name: 'table_type' })
    tableType: 'BASE TABLE' | 'VIEW';

    @OneToMany(type => SchemaColumnEntity, column => column.table)
    @JoinColumn([
        {
            name: 'table_catalog',
            referencedColumnName: 'tableCatalog'
        },
        {
            name: 'table_schema',
            referencedColumnName: 'tableSchema'
        },
        {
            name: 'table_name',
            referencedColumnName: 'tableName'
        },
    ])
    columns?: SchemaColumnEntity[];


    @OneToMany(type => SchemaTableConstraintEntity, constraint => constraint.table)
    @JoinColumn([
        {
            name: 'table_catalog',
            referencedColumnName: 'tableCatalog'
        },
        {
            name: 'table_schema',
            referencedColumnName: 'tableSchema'
        },
        {
            name: 'table_name',
            referencedColumnName: 'tableName'
        },
    ])
    constraints?: SchemaTableConstraintEntity[];
}
