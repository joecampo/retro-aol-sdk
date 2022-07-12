import Echo from 'laravel-echo';
import { OptionsInterface } from '../types';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

declare global {
  interface Window {
    Pusher: any;
  }
}

window.Pusher = window.Pusher || {};

export default class EchoClient {
  token: string;
  options: OptionsInterface;
  client: Echo;

  constructor(token: string, options: OptionsInterface = {}) {
    this.token = token;
    this.options = options;

    const server: URL = new URL(options.server || '');
    const wsServer: URL = new URL(options.websocketServer || '');

    this.client = new Echo({
      authEndpoint: `${server.protocol}//${server.hostname}${server.port ? `:${server.port}` : ''}/broadcasting/auth`,
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      wsHost: wsServer.hostname,
      wsPort: wsServer.port,
      wssPort: wsServer.port,
      forceTLS: false,
      encrypted: true,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
      },
    });
  }
}
