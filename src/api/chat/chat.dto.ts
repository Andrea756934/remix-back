import {
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Max,
    Min
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class startConversationDTO {
    @IsMongoId()
    productId!: string;
}

export class sendMessageDTO {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    text!: string;
}

export class ListMessageDTO {
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