import { ClassConstructor, plainToInstance } from 'class-transformer';
import { BaseValidator } from './base.validator';
import { IValidator } from './interface.validator';

export class GenericValidator<T extends object>
  extends BaseValidator
  implements IValidator
{
  constructor(private readonly dtoClass: ClassConstructor<T>) {
    super();
  }

  async validate(data: any): Promise<this> {
    const dados = plainToInstance(this.dtoClass, data);

    return this.validator(dados);
  }
}

/**
 * Função auxiliar para criar um validador genérico
 * @param dtoClass - Classe DTO para validação
 * @param data - Dados a serem validados
 * @returns Promise com o resultado da validação
 *
 * @example
 * const result = await validateDTO(ChamadoDTO, dadosForm);
 * if (result.isError) {
 *   console.log(result.getErrors);
 * }
 */
export async function validate<T extends object>(
  dtoClass: ClassConstructor<T>,
  data: any,
): Promise<BaseValidator> {
  const validator = new GenericValidator(dtoClass);
  return validator.validate(data);
}
