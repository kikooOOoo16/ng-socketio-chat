<!-- PROJECT LOGO -->
<p align="center">
  <h3 align="center">Angular SocketIO chat app</h3>
  <p align="center">
    An Angular FE chat app intended to communicate with a SocketIO BE server
    <br/>
    <a href="https://github.com/kikooOOoo16/node-socketio-ts-app">Node SocketIO server</a>
  </p>
</p>
<br/>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#initialisation">Initialisation</a></li>
        <li><a href="#Docker">Docker</a></li>
      </ul>
    </li>
  </ol>
</details>
<br/>


<!-- ABOUT THE PROJECT -->
## About The Project

The features that it provides are the following:
* User authentication.
* CRUD personal chat rooms.
* Enter and chat inside created rooms with other users.
* Room author can kick and ban certain users.
* Edit already sent messages.
* Profane words filter inside chat room as well as when creating and updating chat rooms.

### Built With

* [Angular](https://angular.io/api/common/SlicePipe)
* [Bootstrap5](https://getbootstrap.com)
* [ngx-socketio](https://www.npmjs.com/package/ngx-socket-io)


<!-- GETTING STARTED -->
## Getting Started

In order to use this app you need the corresponding <a href="https://github.com/kikooOOoo16/node-socketio-ts-app">NodeJS SocketIO server</a>, once you have that running open the environment.ts file and set the serverUrl: 'http://localhost:3000' property.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kikooOOoo16/ng-socketio-chat.git
   ```
3. Install NPM packages in both the NodeJS server and the Angular app root directories
   ```sh
   npm install
   ```
4. Inside the angular app, in the src directory, create the environments directory and add the following value:
      ```TS
    export const environment = {
      production: false,
      serverUrl: 'http://localhost:3000/'
    };
   ```
### Initialisation

1. To start the Angular app just run  :
   ```sh
   ng serve
   ```
   
### Docker

The app also has a Dockerfile and can be started with Docker. Inside the same directory as the Dockerfile run :
   ```sh
   docker build -t ng-socketio-app:1
   docker run -it --name ng-socketio-app dockerImageID
   ```

<!-- CONTACT -->
## Contact

Kristijan Pavlevski - kristijan.pavlevski@outlook.com

Project Link: [https://github.com/kikooOOoo16/ng-socketio-chat](https://github.com/kikooOOoo16/ng-socketio-chat)
