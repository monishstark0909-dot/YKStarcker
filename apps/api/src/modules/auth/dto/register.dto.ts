/** @format */

import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(8)
	password!: string;

	@IsString()
	@MinLength(2)
	displayName!: string;

	@IsString()
	@Matches(/^[a-zA-Z0-9_]+$/)
	username!: string;
}
