import { io } from 'socket.io-client';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(nuxtApp => {
    const socket = io('http://localhost:3000', {
        autoConnect: false
    });

    return {
        provide: {
            socket
        }
    };
});