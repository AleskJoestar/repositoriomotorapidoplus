import { IsNotEmpty, MinLength } from "class-validator";
import { Prioridade } from "./chamado.entity";

export class ChamadoDto {
    @IsNotEmpty({ message: 'O Título é obrigatório '})
    @MinLength(10, { message: 'O Título deve ter no mínimo 10 caracteres'})
    titulo: string;

    @IsNotEmpty({ message: 'A Prioridade é obrigatória '})
    prioridade: Prioridade;
    
    @IsNotEmpty({ message: 'A Descrição é obrigatória '})
    @MinLength(20, { message: 'A Descrição deve ter no mínimo 20 caracteres'})
    descricao: string;
}