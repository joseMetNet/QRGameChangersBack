import { DataTypes, Model, Optional } from 'sequelize';
import db from '../database/connection';

interface CategoryAttributes {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

type CategoryCreationAttributes =
    Optional<CategoryAttributes, 'id' | 'descripcion' | 'activo'>;

class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes {

    public id!: number;
    public nombre!: string;
    public descripcion?: string;
    public activo!: boolean;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize: db,
        modelName: 'Categories',
        tableName: 'Categories',
        timestamps: true,
        freezeTableName: true
    }
);

export default Category;/**/