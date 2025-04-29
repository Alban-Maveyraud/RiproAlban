// src/app/config.service.ts
import { Injectable } from '@angular/core';

export interface ConfigOptions {
  rewrite: boolean;
  dotEnd: boolean;
  colorTypes: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: ConfigOptions = {
    rewrite: false,
    dotEnd: false,
    colorTypes: false
  };

  getConfig(): ConfigOptions {
    return this.config;
  }

  setConfig(config: ConfigOptions): void {
    this.config = config;
  }
}
