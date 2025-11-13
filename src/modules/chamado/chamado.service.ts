import { Injectable } from "@nestjs/common";
import { Chamado, Situacao } from "./chamado.entity";

@Injectable()
export class ChamadoService {
    async getAll() {
        const chamados = await Chamado.find();

        return chamados;
    }

    async create(data: any) {
        const chamado = Chamado.create({ ...data, situacao: Situacao.Aberto });

        return await chamado.save();
    }
}