import EchoClient from './echo';
import HttpClient from './http';
import { ClientInterface, OptionsInterface, Events } from '../types';

export class Client implements ClientInterface {
  sessionId: string | undefined;
  token: string | undefined;
  online: boolean | undefined;
  options: OptionsInterface | undefined;
  echo: EchoClient | undefined;
  http: HttpClient;

  constructor(options: OptionsInterface) {
    if (options.server === undefined) {
      throw new Error('Please pass the server as protocol://host:post');
    }

    this.options = options;
    this.http = new HttpClient(options);
    return (async (): Promise<Client> => {
      await this.connect();

      this.echo = new EchoClient(this.token || '', options);

      this.echo.client.private(`client.${this.sessionId}`);

      return await new Promise((resolve: any): void => {
        this.echo?.client.connector.pusher.connection.bind('connected', async () => {
          resolve(this);
        });
      });
    })() as unknown as Client;
  }

  isOnline(): boolean {
    return this.online || false;
  }

  login(username: string, password?: string | undefined): Promise<any> {
    return this.http.post('/api/login', { username, password });
  }

  logoff(): Promise<any> {
    this.online = false;

    return this.http.post('/api/logoff', {});
  }

  on(event: Events, callback: any): void {
    this.echo?.client.private(`client.${this.sessionId}`).listen(event, (e: any): void => {
      callback(e);
    });
  }

  fetchChatRooms(): Promise<any> {
    return this.http.post('/api/fetch-chat-rooms');
  }

  joinChatRoom(roomName: string): Promise<any> {
    return this.http.post('/api/join-chat-room', { roomName });
  }

  leaveChatRoom(roomName: string): Promise<any> {
    return this.http.post('/api/leave-chat-room', { roomName });
  }

  sendChatMessage(message: string): Promise<any> {
    return this.http.post('/api/send-chat-message', { message });
  }

  sendInstantMessage(screenName: string, message: string): Promise<any> {
    return this.http.post('/api/send-instant-message', { screenName, message });
  }

  getToken(): string | undefined {
    return this.token;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  async connect(): Promise<void> {
    const { online, token, sessionId } = await this.http.post('/api/sessions');

    this.online = online;
    this.sessionId = sessionId;

    this.token = token;
    this.http.setToken(token);
  }
}
