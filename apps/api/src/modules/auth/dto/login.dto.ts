/** @format */

import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(8)
	password!: string;

	@IsOptional()
	@Transform(({ value }) => value === true || value === "true")
	@IsBoolean()
	rememberMe?: boolean;
}
