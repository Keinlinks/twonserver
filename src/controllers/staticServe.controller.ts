import { Controller, Get } from '@nestjs/common';
import * as stun from 'stun';

@Controller('')
export class AngularServe {
  @Get()
  async getIpAdress() {
    const res = await stun.request('stun.l.google.com:19302');
    console.log('your ip', res.getXorAddress().address);
    return res.getXorAddress().address;
  }
}
