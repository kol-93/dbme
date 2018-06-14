import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn} from 'typeorm';
import {SchemaColumnEntity} from './schema.column.entity';
import {SchemaConstraintColumnUsageEntity} from './schema.constraint.column.usage.entity';
import {SchemaTableEntity} from './schema.table.entity';

@Entity({
    name: 'table_constraints',
    schema: 'information_schema',
    synchronize: false,
    orderBy: {
        tableCatalog: 'ASC',
        tableSchema: 'ASC',
        tableName: 'ASC',
    }
})
export class SchemaTableConstraintEntity {
    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_catalog' })
    constraintCatalog: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_schema' })
    constraintSchema: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_name' })
    constraintName: string;

    @Column({ type: 'varchar', length: 256, name: 'table_catalog' })
    tableCatalog: string;

    @Column({ type: 'varchar', length: 256, name: 'table_schema' })
    tableSchema: string;

    @Column({ type: 'varchar', length: 256, name: 'table_name' })
    tableName: string;

    @Column({ type: 'varchar', length: 256, nullable: true, name: 'constraint_type' })
    constraintType?: 'CHECK' | 'FOREIGN KEY' | 'PRIMARY KEY' | 'UNIQUE';

    @ManyToOne(type => SchemaTableEntity, table => table.constraints)
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
    table: SchemaTableEntity;

    @OneToMany(type => SchemaConstraintColumnUsageEntity, usedColumn => usedColumn.constraint)
    @JoinColumn([
        {
            name: 'constraint_catalog',
            referencedColumnName: 'constraintCatalog',
        },
        {
            name: 'constraint_schema',
            referencedColumnName: 'constraintSchema',
        },
        {
            name: 'constraint_name',
            referencedColumnName: 'constraintName',
        },
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
    usedColumns?: SchemaConstraintColumnUsageEntity[];
}
