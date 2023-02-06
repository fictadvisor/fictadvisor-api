import { IsBoolean, IsNotEmpty } from "class-validator";

export class GroupRequestDTO {
    @IsNotEmpty()
    groupId: string;

    @IsBoolean()
    @IsNotEmpty()
    isCaptain: boolean;
}