import { createApp } from 'vue';
import App from './App.vue';
import { Client } from './index';
const client = await new Client({ server: 'http://127.0.0.1:81', websocketServer: 'http://127.0.0.1:6001' });

const app = createApp(App);

app.provide('client', client);

app.mount('#app');
