import {
    IsArray,
    IsNotEmpty,
    IsString,
    IsUrl,
    IsNumber,
    IsEnum,
    IsIn,
    IsInt,
    MaxLength,
    Min,
    Max,
    IsOptional,
    ArrayMinSize,
    ArrayMaxSize
}
    from "class-validator";
import { ProductCondition } from "./prodotti.entity";
import { Type } from "class-transformer";

export class addProductDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.5)
    price!: number;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsEnum(
        ['new_with_tag', 'new', 'very_good', 'good', 'satisfactory'],
        {
            message: 'type deve essere una delle condizioni accettabili'
        }
    )
    condition?: ProductCondition;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    size?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @IsUrl({}, { each: true })
    images!: string[]
}

export class updateProductDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    title!: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description!: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.5)
    price!: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    category?: string;

    @IsOptional()
    @IsEnum(
        ['new_with_tag', 'new', 'very_good', 'good', 'satisfactory'],
        {
            message: 'type deve essere una delle condizioni accettabili'
        }
    )
    condition?: ProductCondition;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @IsUrl({}, { each: true })
    images?: string[];
}

export class ListProductDTO {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(
        ['new_with_tag', 'new', 'very_good', 'good', 'satisfactory'],
        {
            message: 'type deve essere una delle condizioni accettabili'
        }
    )
    condition?: ProductCondition;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsIn(['newest', 'price_asc', 'price_desc'])
    sort?: 'newest' | 'price_asc' | 'price_desc';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class ListMineDTO extends ListProductDTO {
    @IsOptional()
    @IsIn(['active', 'sold', 'paused'])
    status?: 'active' | 'sold' | 'paused';
}

export class ChangeStatusDTO {
    @IsIn(['active', 'paused'])
    status!: 'active' | 'paused';
}