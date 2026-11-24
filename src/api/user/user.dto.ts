import {
    ArrayMaxSize,
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsPostalCode,
    IsString,
    IsUrl,
    Length,
    MaxLength,
    ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { shippingAddressDTO } from "../orders/orders.dto";

export class addressDTO extends shippingAddressDTO {
    //presente solo se l'indirizzo esiste già: serve a mantenere l'identità
    @IsOptional()
    @IsMongoId()
    id?: string;
}

export class updateProfileDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName?: string;

    @IsOptional()
    @IsUrl()
    picture?: string;

    //se presente sostituisce l'intero elenco; se assente gli indirizzi restano invariati
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(5)
    @ValidateNested({ each: true })
    @Type(() => addressDTO)
    addresses?: addressDTO[];
}

export class deleteAccountDTO {
    @IsString()
    @IsNotEmpty()
    password!: string;
}