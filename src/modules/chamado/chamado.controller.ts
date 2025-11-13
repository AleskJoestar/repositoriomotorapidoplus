import { Body, Controller, Get, Post, Render, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ChamadoService } from "./chamado.service";
import { ChamadoDto } from "./chamado.dto";
import { validate } from "src/common/validator/generic.validator";

@Controller('/chamado')
export class ChamadoController {

    constructor(private readonly chamadoService: ChamadoService) {}

    @Get()
    @Render('chamado/listagem')
    async consulta() {
        const chamados = await this.chamadoService.getAll();

        return { listaChamados: chamados };
    }

    @Get('/novo')
    @Render('chamado/formulario-cadastro')
    formularioCadastro() {
        return {};
    }

    @Post('/novo/salvar')
    async formularioCadastroSalvar(@Body() dadosForm: any, @Req() req: Request, @Res() res: Response) {

        //import { validate } from "src/common/validator/generic.validator";

        const resultado = await validate(ChamadoDto, dadosForm);

        if(resultado.isError) {

            req.addFlash('error', resultado.getErrors);
            req.setOld(dadosForm);

            return res.redirect('/chamado/novo');  
        } else {

            await this.chamadoService.create(dadosForm);

            req.addFlash('success', 'Chamado adicionado com sucesso!');

            return res.redirect('/chamado');
        }

        

        
    }
    
}