import { Injectable } from "@nestjs/common";

@Injectable()

export class SettingsService {
    getAllSettings() {
     return {'testing':'testing stuff'}
    }
}