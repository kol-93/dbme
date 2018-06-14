import {Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn} from 'typeorm';
import {SchemaTableConstraintEntity} from './schema.table.constraint.entity';


@Entity({
    name: 'constraint_column_usage',
    schema: 'information_schema',
    synchronize: false,
})
export class SchemaConstraintColumnUsageEntity {
    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_catalog' })
    constraintCatalog: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_schema' })
    constraintSchema: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'constraint_name' })
    constraintName: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_catalog' })
    tableCatalog: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_schema' })
    tableSchema: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_name' })
    tableName: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'column_name' })
    columnName: string;

    @ManyToOne(type => SchemaTableConstraintEntity, constraint => constraint.usedColumns)
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
    constraint?: SchemaTableConstraintEntity;
}
