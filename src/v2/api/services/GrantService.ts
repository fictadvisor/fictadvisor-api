import { Injectable } from '@nestjs/common';
import { GrantRepository } from '../../database/repositories/GrantRepository';
import { UpdateGrantDTO } from '../dtos/UpdateGrantDTO';
import { RoleRepository } from '../../database/repositories/RoleRepository';

@Injectable()
export class GrantService {
  constructor (
    private grantRepository: GrantRepository,
    private roleRepository: RoleRepository,
  ) {}

  async delete (id: string) {
    return this.grantRepository.deleteById(id);
  }

  async update (grantId: string, body: UpdateGrantDTO) {
    if (body.weight) {
      const role = await this.roleRepository.find({
        grants: {
          some: {
            id: grantId,
          },
        },
      });

      const occupiedGrant = role.grants.some((g) => g.weight === body.weight);
      if (!occupiedGrant) {

      }
    }
    return this.grantRepository.updateById(grantId, body);
  }
}