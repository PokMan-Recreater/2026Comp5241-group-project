import {createRealtimeInterview} from './doubao-interview.js';
const interview=createRealtimeInterview();
interview.mountRoom(document.querySelector('#interview-room'));
