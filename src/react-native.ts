import NativeEchoClient from './echo-native';
import Api from './api';
import { ClientInterface, OptionsInterface } from '../types';

export class Client extends Api implements ClientInterface {
  constructor(options: OptionsInterface) {
    super(options);

    return (async (): Promise<Client> => {
      await this.connect();

      this.echo = new NativeEchoClient(this.token || '', options);

      this.echo.client.private(`client.${this.sessionId}`);

      return await new Promise((resolve: any): void => {
        this.echo?.client.connector.pusher.connection.bind('connected', async () => {
          resolve(this);
        });
      });
    })() as unknown as Client;
  }
}
