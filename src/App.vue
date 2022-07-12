<template>
  <div class="flex items-center justify-center bg-grey-300 h-screen">
    <div class="flex flex-col gap-y-4 flex-1 max-w-5xl">
      <div class="flex gap-x-2">
        <button class="bg-indigo-300 text-indigo-900 rounded px-3 py-2" @click="client.login('guest')">Login</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="client.logoff()">Logoff</button>
      </div>
      <ul class="space-y-2">
        <li>
          Sign in Status: <span class="font-bold text-indigo-600">{{ status }}</span>
        </li>
        <li>
          Auth: <span class="font-bold text-indigo-600">{{ client.getToken() }}</span>
        </li>
        <li>
          Session Id: <span class="font-bold text-indigo-600">{{ client.getSessionId() }}</span>
        </li>
        <li>
          Screen Name: <span class="font-bold text-indigo-600">{{ screenName || '[None]' }}</span>
        </li>
      </ul>
      <div class="flex gap-x-4">
        <div class="h-16 w-4/5 h-72 border rounded-lg shadow p-2 overflow-y-scroll">
          <ul v-for="(chatMessage, index) in chatMessages" :key="index">
            <li>{{ chatMessage.screenName }}: {{ chatMessage.message }}</li>
          </ul>
        </div>
        <div class="h-16 w-1/5 h-72 border rounded-lg shadow p-2 overflow-y-scroll">
          <ul v-for="(user, index) in users" :key="index">
            <li>{{ user }}</li>
          </ul>
        </div>
      </div>
      <div>
        <input
          v-model="message"
          type="text"
          class="w-full border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          @keydown.enter="sendChatMessage"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue';
import { ClientInterface, Events } from '../types/index.d';

const client = inject('client') as ClientInterface;
const status = ref(client.isOnline() ? 'Online' : 'Offline');

if (status.value === 'Offline') localStorage.clear();

const users = ref(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users') || '') : []);

const screenName = ref(localStorage.getItem('screenName') ? localStorage.getItem('screenName' || '') : '');

const chatMessages = ref<{ screenName: string; message: string }[]>([]);

const message = ref<string>('');

const sendChatMessage = (): void => {
  if (!message.value) return;

  client.sendChatMessage(message.value);
  message.value = '';
};

client.on(Events.LOGGED_ON, () => {
  status.value = 'Online';
  client.joinChat('Welcome');
});

client.on(Events.LOGGED_OFF, () => {
  status.value = 'Offline';
  localStorage.clear();
});

client.on(Events.SET_SCREEN_NAME, (e: { screenName: string }) => {
  localStorage.setItem('screenName', e.screenName);
  screenName.value = e.screenName;
});

client.on(Events.CHAT_ROOM_USERS, (e: { users: string[] }) => {
  localStorage.setItem('users', JSON.stringify(e.users));
  users.value = e.users;
});

client.on(Events.NEW_CHAT_MESSAGE, (e: { screenName: string; message: string }) => {
  chatMessages.value.push(e);
});

client.on(Events.USER_ENTERED_CHAT, (e: { screenName: string }) => {
  chatMessages.value.push({ screenName: 'OnlineHost', message: `${e.screenName} has entered the chat room.` });
});

client.on(Events.USER_LEFT_CHAT, (e: { screenName: string }) => {
  chatMessages.value.push({ screenName: 'OnlineHost', message: `${e.screenName} has left the chat room.` });
});
</script>
