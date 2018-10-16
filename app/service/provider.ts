import {Service} from 'egg';
import {Repository} from 'typeorm';
import {ServiceProvider} from '../entity/service-provider';
import {ErrorService} from '../lib/error/error.service';

/**
 * 微信服务
 */
export default class ProviderService extends Service {

  public async save(serviceProvider: ServiceProvider): Promise<ServiceProvider> {
    const proRepo: Repository<ServiceProvider> = this.ctx.app.typeorm.getRepository(ServiceProvider);
    return await proRepo.save(serviceProvider);
  }

  public async update(serviceProvider: ServiceProvider): Promise<ServiceProvider> {
    const proRepo: Repository<ServiceProvider> = this.ctx.app.typeorm.getRepository(ServiceProvider);
    return await proRepo.save(serviceProvider);
  }

  public async findOne(id: any): Promise<ServiceProvider> {
    if (!id) {
      throw ErrorService.RuntimeErrorIdIsNull();
    }
    const proRepo: Repository<ServiceProvider> = this.ctx.app.typeorm.getRepository(ServiceProvider);
    const serviceProvider = await proRepo.findOne({
      where: {
        Id: id,
      },
    });
    if (!serviceProvider) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    return serviceProvider;
  }
}
