import {
    IsIn,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsPostalCode,
    IsString,
    Length,
    Max,
    MaxLength,
    Min,
    ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

export class shippingAddressDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    fullName!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    street!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    city!: string;

    @IsString()
    @Length(2, 2)
    country!: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;
}

export class createOrderDTO {
    @IsMongoId()
    productId!: string;

    @ValidateNested()
    @Type(() => shippingAddressDTO)
    shippingAddress!: shippingAddressDTO;
}

export class ListOrdersDTO {
    @IsOptional()
    @IsIn(['buyer', 'seller'])
    role?: 'buyer' | 'seller';

    @IsOptional()
    @IsIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
    status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

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

export class shipOrdersDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    trackingCode!: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    carrier?: string;
}