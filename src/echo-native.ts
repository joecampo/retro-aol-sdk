import Echo from 'laravel-echo';
import { OptionsInterface } from '../types';
import Pusher from 'pusher-js/react-native';

export default class NativeEchoClient {
  token: string;
  options: OptionsInterface;
  client: Echo;

  constructor(token: string, options: OptionsInterface = {}) {
    this.token = token;
    this.options = options;

    const server: URL = new URL(options.server || '');
    const wsServer: URL = new URL(options.websocketServer || '');

    this.client = new Echo({
      broadcaster: 'pusher',
      client: new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        authEndpoint: `${server.protocol}//${server.hostname}${server.port ? `:${server.port}` : ''}/broadcasting/auth`,
        wsHost: wsServer.hostname,
        wsPort: Number(wsServer.port),
        wssPort: Number(wsServer.port),
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        auth: {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/json',
          },
        },
      }),
    });
  }
}
