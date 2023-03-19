<template>
  <div class="flex items-center justify-center bg-grey-300 h-screen">
    <div class="flex flex-col gap-y-4 flex-1 max-w-5xl">
      <div class="flex gap-x-4">
        <div class="flex items-center gap-x-2">
          <label for="username">Screen Name:</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          />
        </div>
        <div class="flex items-center gap-x-2">
          <label for="password">Password:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          />
        </div>
      </div>
      <h1 class="text-xl font-bold">Send Instant Message</h1>
      <div class="flex gap-x-4">
        <div class="flex items-center gap-x-2">
          <label for="username">Screen Name:</label>
          <input
            id="instantMessageScreenName"
            v-model="instantMessageScreenName"
            type="text"
            class="border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          />
        </div>
        <div class="flex items-center gap-x-2">
          <label for="insantMessage">Message:</label>
          <input
            id="insantMessage"
            v-model="instantMessage"
            type="insantMessage"
            class="border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          />
        </div>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="sendInstantMessage">Send IM</button>
      </div>
      <div class="flex gap-x-2">
        <button class="bg-indigo-300 text-indigo-900 rounded px-3 py-2" @click="login">Login</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="client.logoff()">Logoff</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="joinChatRoom">Join Chat</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="leaveChatRoom">Leave Chat</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="fetchChatUsers">Chat Users</button>
        <button class="bg-indigo-200 text-indigo-900 rounded px-3 py-2" @click="fetchStatus">Status</button>
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
        <li>
          Error: <span class="font-bold text-indigo-600">{{ error || '[None]' }}</span>
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
          v-model="chatInput"
          type="text"
          class="w-full border rounded-lg p-2 shadow focus:ring-1 ring-indigo-300 focus:outline-none"
          @keydown.enter="sendChatMessage"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { inject, ref, onMounted } from 'vue';
import { ClientInterface, Events } from '../types/index.d';

const client = inject('client') as ClientInterface;
const status = ref(client.isOnline() ? 'Online' : 'Offline');

if (status.value === 'Offline') localStorage.clear();

const users = ref(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users') || '') : []);
const screenName = ref(localStorage.getItem('screenName') ? localStorage.getItem('screenName' || '') : '');
const chatMessages = ref<{ screenName: string; message: string }[]>([]);
const chatInput = ref<string>('');

const instantMessageScreenName = ref<string>('');
const instantMessage = ref<string>('');

const username = ref<string>('');
const password = ref<string>('');
const error = ref<string>('');

onMounted(() => {
  if (status.value !== 'Online') return;

  client.fetchChatMessages().then((messages) => {
    messages.forEach((message) => {
      chatMessages.value.push({ screenName: message.screenName, message: message.message });
    });
  });
});

const login = (): void => {
  if (!username.value || !password.value) {
    client.login('guest');
    return;
  }

  client.login(username.value, password.value).catch((e: Error) => {
    error.value = e.message;
  });
};

const sendChatMessage = (): void => {
  if (!chatInput.value) return;

  client.sendChatMessage(chatInput.value, uuidv4());
  chatInput.value = '';
};

const joinChatRoom = (): void => {
  client.on(Events.NEW_CHAT_MESSAGE, (e: { screenName: string; message: string }) => {
    chatMessages.value.push(e);
  });

  client.on(Events.CHAT_ROOM_USERS, (e: { users: string[] }) => {
    localStorage.setItem('users', JSON.stringify(e.users));
    users.value = e.users;
  });

  client.on(Events.NEW_INSTANT_MESSAGE, (e: { screenName: string; message: string }) => {
    e.screenName = `(Instant Message) ${e.screenName}`;

    chatMessages.value.push(e);
  });

  client.on(Events.USER_ENTERED_CHAT, (e: { screenName: string }) => {
    chatMessages.value.push({ screenName: 'OnlineHost', message: `${e.screenName} has entered the chat room.` });
  });

  client.on(Events.USER_LEFT_CHAT, (e: { screenName: string }) => {
    chatMessages.value.push({ screenName: 'OnlineHost', message: `${e.screenName} has left the chat room.` });
  });

  client.joinChatRoom('Welcome');
};

const leaveChatRoom = (): void => {
  client.leaveChatRoom('Welcome');
  client.off([Events.NEW_CHAT_MESSAGE, Events.CHAT_ROOM_USERS, Events.USER_ENTERED_CHAT, Events.USER_LEFT_CHAT]);
};

const sendInstantMessage = (): void => {
  if (!instantMessage.value || !instantMessageScreenName.value) return;

  client.sendInstantMessage(instantMessageScreenName.value, instantMessage.value);

  instantMessage.value = '';
};

const fetchChatUsers = (): void => {
  client.fetchChatUsers().then((response) => {
    chatMessages.value.push({ screenName: 'OnlineHost', message: `Users: ${response.join(', ')}` });
  });
};

const fetchStatus = async (): Promise<void> => {
  const status = await client.status();

  chatMessages.value.push({ screenName: 'OnlineHost', message: `Your online status is set to: ${status}` });
};

client.on(Events.LOGGED_ON, () => {
  status.value = 'Online';
  client.fetchChatRooms();
});

client.on(Events.LOGIN_INVALID, () => {
  error.value = 'The screen name or password you have entered is invalid.';
});

client.on(Events.LOGGED_OFF, () => {
  status.value = 'Offline';
  localStorage.clear();
});

client.on(Events.SET_SCREEN_NAME, (e: { screenName: string }) => {
  localStorage.setItem('screenName', e.screenName);
  screenName.value = e.screenName;
});

client.on(Events.CHAT_ROOM_LIST, (e: { chatRooms: string[] }) => {
  const chatRooms = Object.keys(e.chatRooms)
    .map((chatRoom: string): string => {
      return chatRoom + ` (${e.chatRooms[chatRoom]})`;
    })
    .join(', ');

  chatMessages.value.push({ screenName: 'OnlineHost', message: chatRooms });
});
</script>
