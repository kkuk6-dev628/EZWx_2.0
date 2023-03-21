import { JwtAuthGuard } from './../../auth/jwt/jwt-auth.guard';
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LayerControlService } from './layer-control.service';

@Controller('api/layer-control')
export class LayerControlController {
  constructor(private layerControlService: LayerControlService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  find(@Request() request) {
    return this.layerControlService.getLayerControlState(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  update(@Request() request, @Body() layerControlState) {
    layerControlState.userId = request.user.id;
    layerControlState.updated_at = undefined;
    layerControlState.created_at = undefined;
    return this.layerControlService.updateLayerControlState(layerControlState);
  }

  @UseGuards(JwtAuthGuard)
  @Get('base')
  findBaseLayerControl(@Request() request) {
    return this.layerControlService.getBaseLayerControlState(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('base')
  updateBaseLayerControl(@Request() request, @Body() baseLayerControlState) {
    baseLayerControlState.userId = request.user.id;
    return this.layerControlService.updateBaseLayerControlState(baseLayerControlState);
  }
}
