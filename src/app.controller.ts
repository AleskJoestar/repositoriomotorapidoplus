import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('lobby') // Nova página lobby
  lobby() {
    return { titulo: 'Sistema de Chamados - Lobby', layout: false };
  }

  @Get('home')
  @Render('home') // Template KAIAdmin (mantém igual)
  home() {
    return { titulo: this.appService.getTitulo(), layout: false };
  }

  @Get('home2')
  @Render('home2')
  layout() {
    return { titulo: this.appService.getTitulo() };
  }

  @Get('sobre')
  @Render('sobre') // Mudei de 'sobre-mim' para 'sobre' conforme seu pedido
  sobre() {
    return { titulo: 'Sobre o Projeto', layout: false };
  }
}