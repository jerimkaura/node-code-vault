### Introduction
A push notification is a message that pops on the screen when a mobile or a web application is performing another activity. In modern web applications, push notifications have a wider place. Push notifications engage the users and draw their attention to a new activity occurring in the web application even when they are not using the application.

The benefits of push notifications include:
- Increased application engagement as users get engaged even when they are not using the app.
- Boost user retention by sending them personalized offers and advertisements.
- Track user metrics to determine the level of success of an application.
- Enhance the user experience by conveniently providing information.

### Goal
In this article, I will explain a step-by-step implementation of push notifications using service workers in a Node.js application.

### Table of contents
- Introduction
- Prerequisites
- Creating the node application
- Building the server-side
- Coding the client-side
- Conclusion & Further Reading

### Prerequisites
- Nodejs installed on your computer.
- Basic understanding of Node.js
- Code editor. I will use visual studio code.

### Creating the Node.js Application

#### Init application
Set up the Node.js application by running the following command:

```bash
npm init -y
```

This command will create an empty `package.json` file for our application. The `package.json` will hold the project's metadata that includes dependencies, scripts, and versions.

#### Install dependencies
Next, we will install the required dependencies.

>We will use `express` as our backend framework for Node.js, `body-parser` to parse HTTP request body, `web-push` to send the messages triggered by the application's backend.

To install these dependencies, run the following command in your terminal.

```bash
npm install –save express, body-parser, web-push.
```

### Building the server side
#### Import the dependencies
We are all set. Now, let's start the implementation by creating the server-side. We will create the application's entry point which will also be our server. So in the root directory, we will create a new file and name it `index.js`. In the file, we will bring in our installed dependencies as shown below:

```js
//Express
const express = require('express');

//web-push
const webpush = require('web-push');

//body-parser
const bodyParser = require('body-parser');

//path
const path = require('path');

//using express
const app = express();

//using bodyparser
app.use(bodyParser.json())
```

#### Generate VAPID Keys
Next, we will create a set of Vapid keys for the application. The VAPID(Voluntary Application Server Identification) keys will allow us to send push messages without having to set up a messaging service. They also identify who is sending the push notification. You can find more about vapid keys [here](https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#identifying_your_service_with_vapid_auth). Vapid keys occur in pairs. One private and another public key. To generate the VAPID Keys. Run the command below in the terminal:

```bash
./node_modules/.bin/web-push generate-vapid-keys
```
The command should give the keys like below:

```bash
=======================================
Public Key:
BKd0FOnmkngVtRSf7N3ogMcnnDQGtu5PSMcbzmt_uvrcDTpL424TE6W92qpnMGZPeh1XqHi1rA_MT0iUL0gBXuY

Private Key:
GyXqHJJVtw7uXgCx9mXw9QK65SsCnALClWNHpPHy2pQ

=======================================
```

#### Setting the VAPID Keys with web push
To set the VAPID Keys, we first store our keys in variables, then call the `setVapiddetails` method of the `web-push` module. In the `index.js` file we will add the following block of code.

```js
//storing the keys in variables
const publicVapidKey = 'Your public vapid key';
const privateVapidKey = 'Your private vapid key';

//setting vapid keys details
webpush.setVapidDetails('mailto:mercymeave@section.com', publicVapidKey,privateVapidKey);
```
#### Creating the subscribe route.
This route will specify where the client sends the post requests. It will send the notification to the service worker. The block of code below specified how to set up the route.

```js
//subscribe route
app.post('/subscribe', (req, res)=>{
//get push subscription object from the request
const subscription = req.body;

//send status 201 for the request
res.status(201).json({})

//create payload: specified the details of the push notification
const payload = JSON.stringify({title: 'Section.io Push Notification' });

//pass the object into sendNotification function and catch any error
webpush.sendNotification(subscription, payload).catch(err=> console.error(err));
})
```

### Coding the client side
#### Setting the static path
Now we have set up our server. Next, is coding the client-side from where the post request is sent.
First, we will set up our static folder path in the `index.js` file. Under the dependencies, we will include the below piece of code:

```js
//set the static path
app.use(express.static(path.join(__dirname, "client")));
```

#### Creating the required files
Next, in the root folder, create a folder named `client`. In the client folder, we will create three files. The `index.js` will have our frontend code, a `client.js` for our client, and a `service.js` for our service worker.

In the `index.html` file, we will add the code below:

``html










Section.io push Notification





```
#### Setting up the service worker
A service worker is a script run by the browser in the background separate from the web page and bridges the browser and the network. It usually intercepts requests made by the document in the browser and redirects requests to cache memory to allow offline access.
To set up our service worker, in the `client.js` file, we will import our public vapid key.

```js
const publicVapidKey = 'Your public key';
```

Next, since we are using the VAPID key in a web application, we use the function below to convert the public key to a Uint8Array to pass into the subscribe call. You can find more about the conversion [here.](npmjs.com/package/web-push)
```js
function urlBase64ToUint8Array(base64String) {
const padding = "=".repeat((4 - base64String.length % 4) % 4);
const base64 = (base64String + padding)
.replace(/\-/g, "+")
.replace(/_/g, "/");

const rawData = window.atob(base64);
const outputArray = new Uint8Array(rawData.length);

for (let i = 0; i < rawData.length; ++i) {
outputArray[i] = rawData.charCodeAt(i);
}
return outputArray;
}
```
Next, we will check if the service worker is enabled in the current browser and trigger the send method.
```js
//check if the serveice worker can work in the current browser
if('serviceWorker' in navigator){
send().catch(err => console.error(err));
}
```
In the send method, we will register the service worker, and then trigger the send notification functionality as below:
```js
//register the service worker, register our push api, send the notification
async function send(){
//register service worker
const register = await navigator.serviceWorker.register('/worker.js', {
scope: '/'
});

//register push
const subscription = await register.pushManager.subscribe({
userVisibleOnly: true,

//public vapid key
applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
});

//Send push notification
await fetch("/subscribe", {
method: "POST",
body: JSON.stringify(subscription),
headers: {
"content-type": "application/json"
}
});
}
```
The next phase will be coded in the `worker.js` file. We will add an event listener to the push and specify the options for the push notification such as title, body, image, and icon. We will add the below block of code in the `worker.js` file.

```js
self.addEventListener("push", e => {
const data = e.data.json();
self.registration.showNotification(
data.title, // title of the notification
{
body: "Push notification from section.io", //the body of the push notification
image: "https://pixabay.com/vectors/bell-notification-communication-1096280/",
icon: "https://pixabay.com/vectors/bell-notification-communication-1096280/" // icon
}
);
});
```
### Run the server
Now to test out the application, add the block of code below in the `index.js` file. the run the command `npm start` in your terminal.
```js
const port = 3000;
app.listen(port, ()=>{
    console.log(`server started on ${port}`)
});
```
Now the application will send the push notification every time you refresh the browser as shown below:
![The push notification of the application](/engineering-education/push-notifications-in-nodejs-using-service-workers/notification.png)

### Conclusion and further reading
In this article, we learned how to use service workers to implement push notifications in a web application. You can find the complete code of the implementation [here](https://github.com/mercymeave/code-space/tree/main/push-notifications). To find more about the topic, you can check the resources in the following links:

- Service worker: https://developers.google.com/web/fundamentals/primers/service-workers
- Push Notifications: https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
- Web-Push: https://www.npmjs.com/package/web-push
