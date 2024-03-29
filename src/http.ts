import { OptionsInterface } from '../types';

export default class HttpClient {
  headers: Headers;
  options: OptionsInterface;

  constructor(options: OptionsInterface = {}) {
    this.options = options;
    this.headers = new Headers();
    this.headers.append('Accept', 'application/json');
    this.headers.append('Content-Type', 'application/json');
  }

  setToken(token: string): void {
    this.headers.append('Authorization', `Bearer ${token}`);
  }

  async post(path: string, body: object = {}): Promise<any> {
    const response: Response = await fetch(`${this.options.server}${path}`, {
      method: 'POST',
      mode: 'cors',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok) throw new Error(json.message);

    return json;
  }

  async get(path: string): Promise<any> {
    const response: Response = await fetch(`${this.options.server}${path}`, {
      method: 'GET',
      mode: 'cors',
      headers: this.headers,
    });

    const json = await response.json();

    if (!response.ok) throw new Error(json.message);

    return json;
  }
}
