import EchoClient from './echo';
import HttpClient from './http';
import Pusher from 'pusher-js/types/src/core/pusher';
import { OptionsInterface, Events } from '../types';

export default class Api {
  sessionId: string | undefined;
  token: string | undefined;
  online: boolean | undefined;
  options: OptionsInterface | undefined;
  echo: EchoClient | undefined;
  events: string[] = [];
  http: HttpClient;

  constructor(options: OptionsInterface) {
    if (options.server === undefined) {
      throw new Error('Please pass the server as protocol://host:post');
    }

    this.options = options;
    this.http = new HttpClient(options);
  }

  isOnline(): boolean {
    return this.online || false;
  }

  login(username: string, password?: string | undefined): Promise<any> {
    return this.http.post('/api/login', { username, password });
  }

  logoff(): Promise<any> {
    this.online = false;

    this.events
      .filter((event) => event !== '.logged.off')
      .forEach((event) => {
        this.echo?.client.private(`client.${this.sessionId}`).stopListening(event);
        this.events = this.events.filter((e) => e !== event);
      });

    return this.http.post('/api/logoff', {});
  }

  on(event: Events | string, callback: any): void {
    if (this.events.includes(event)) return;

    this.events.push(event);

    this.echo?.client.private(`client.${this.sessionId}`).listen(event, (e: any): void => {
      callback(e);
    });
  }

  off(event: Events | Events[] | string | string[]): void {
    if (Array.isArray(event)) {
      event.forEach((e: Events | string): void => {
        this.events = this.events.filter((event) => e !== event);

        this.echo?.client.private(`client.${this.sessionId}`).stopListening(e);
      });
      return;
    }

    this.events = this.events.filter((e) => e !== event);

    this.echo?.client.private(`client.${this.sessionId}`).stopListening(event);
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

  fetchChatMessages(): Promise<any> {
    return this.http.get('/api/chat-messages');
  }

  fetchChatUsers(): Promise<any> {
    return this.http.get('/api/chat-users');
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

  websocket(): Pusher {
    return this.echo?.client.connector.pusher;
  }

  async connect(): Promise<void> {
    if (this.options?.token) {
      this.token = this.options.token;
      this.http.setToken(this.options.token);
    }

    const { online, token, sessionId } = await this.http.post('/api/sessions');

    this.online = online;
    this.sessionId = sessionId;

    this.token = token;
    this.http.setToken(token);
  }
}
