export const enum Events {
  'LOGGED_ON' = '.logged.on',
  'LOGGED_OFF' = '.logged.off',
  'CHAT_ROOM_USERS' = '.chat.room.users',
  'SET_SCREEN_NAME' = '.set.screen.name',
  'NEW_CHAT_MESSAGE' = '.new.chat.message',
  'USER_ENTERED_CHAT' = '.user.entered.chat',
  'USER_LEFT_CHAT' = '.user.left.chat',
}

export interface ClientInterface {
  isOnline(): boolean;
  login(username: string, password?: string): Promise<any>;
  logoff(): Promise<any>;
  on(event: Events | string, callback: any): void;
  joinChat(roomName: string): Promise<any>;
  sendChatMessage(message: string): Promise<any>;
  getToken(): string | undefined;
  getSessionId(): string | undefined;
}

export interface OptionsInterface {
  server?: string;
  websocketServer?: string;
}
