### Git
```
ssh-keygen -t ed25519 -C "<riththy_sms_teacher_class>"

```

### Setup
```
npm init -y

```

### ESM
```

```

### Package Install
```
npm install express mysql2 multer dotenv cors body-parser  bcryptjs jsonwebtoken dotenv cookie-parser cors express-validator express-session
npm install nodemon --save
npm install node-telegram-bot-api
npm install multer
npm install bcrypt
npm install joi (validate change password)
npm install nodemailer
npm install --save-dev @types/nodemailer @types/bcryptjs @types/jsonwebtoken
npm update cookie
npm install cookiejs

npm install cookie-parser
npm i --save-dev @types/cookie
npm install open // auto open html render when run app
npm list express
npm list cookie
npm install helmet   // security
npm install morgan   // for view end point api route
npm install swagger-jsdoc swagger-ui-express
```
npm install pdfmake moment
npm update express cookie
npm update cookie-parser
npm install cookie@0.4.1
npm install xlsx pdfmake moment mysql2 multer

<!-- Add --exitcrash for Restarts: In case you're handling certain error cases, use --exitcrash to restart on all types of exits: -->
nodemon --exitcrash server.js

npm uninstall express-rate-limit express-mongo-sanitize hpp express-xss-sanitizer socket.io

### update nodemon
npm install -g nodemon

### Hosting Db
``` CMD
with mail : riththy.learn@gmail.com
LMS MySQL Hosting
mysql --user avnadmin --password=AVNS_VhWUzPMwUQ35IvZ-TXb --host mysql-38e8423e-riththy-b6f5.d.aivencloud.com --port 21299 defaultdb

-- menual
DB_REMOTE_HOST=mysql-38e8423e-riththy-b6f5.d.aivencloud.com
DB_REMOTE_USER=avnadmin
DB_REMOTE_PASSWORD=AVNS_VhWUzPMwUQ35IvZ-TXb
DB_REMOTE_DATABASE=NOKORTECH_LMS_DB
DB_REMOTE_PORT=21299

```
USERS : 153;
STUDENTS :103
104
105
106
107
108
109
110
111
112
113
114
115
116
;
ATTENDANCE_TYPES : 1
2
3
4
5;
CLASS_SCHEDULES : ;
SUBJECTS : 11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
;
COURSES : 11
12
13
14
15
16
17
18
19
20
;
TEACHERS : 139
140
141
142
143
144
153
244
246
247
248
249
250
251
252
253
254
256
257
258
259
260;

### Git Command Line
```` Command line instructions
You can also upload existing files from your computer using the instructions below.

Configure your Git identity
Get started with Git and learn how to configure it.

Local
Global
Git global setup
Configure your Git identity globally to use it for all current and future projects on your machine:

git config --global user.name "RITHY"
git config --global user.email "riththy.learn@gmail.com"
Add files
Push files to this repository using SSH or HTTPS. If you're unsure, we recommend SSH.

SSH
HTTPS
How to use SSH keys?

Create a new repository
git clone git@gitlab.com:thesis202501/NOKORTECH_TEACHER_CLASS_NODEJS.git
cd NOKORTECH_TEACHER_CLASS_NODEJS
git switch --create main
touch README.md
git add README.md
git commit -m "add README"
git push --set-upstream origin main


-- Push an existing folder
```
Go to your folder
cd existing_folder
Configure the Git repository
git init --initial-branch=main
git remote add origin git@gitlab.com:thesis202501/NOKORTECH_TEACHER_CLASS_NODEJS.git
git add .
git commit -m "Initial commit"
git push --set-upstream origin main

```


Push an existing Git repository
Go to your repository
cd existing_repo
Configure the Git repository
git remote rename origin old-origin
git remote add origin git@gitlab.com:thesis202501/NOKORTECH_TEACHER_CLASS_NODEJS.git
git push --set-upstream origin --all
git push --set-upstream origin --tags


```

If you want to keep using this line:

js
Copy
Edit
import db from '../config/db.js';
Then at the bottom of your db.js file, change this:

js
Copy
Edit
export default mysql.createPool(remoteConfig); // or: export default db;
Make sure you're using export default.

Option 2: Use Named Import Instead
If your db.js exports like this:

js
Copy
Edit
export const db = mysql.createPool(config);
Then update your import:

js
Copy
Edit
import { db } from '../config/db.js';

Compressing/Optimizing Uploaded Images
npm install sharp



### Auths flow
```Code
Why only set the refreshToken as a cookie in the res (server response) and not the accessToken?
✅ Reason 1: Access token is short-lived and used in JS
Access tokens are meant to be used by frontend JavaScript (e.g., in Authorization headers when calling APIs).

You want to read the access token from useCookie() in your Nuxt app so you can:

Attach it to requests,

Check if the user is logged in,

Or store it in memory/Pinia.

So:
✅ Frontend stores accessToken as a normal cookie (or memory)
🚫 No need for server to send it as a Set-Cookie header

❌ Reason 2: Access token in HttpOnly cookies is useless in SPA
If you set the accessToken as a res.cookie(...) with httpOnly: true, then:

JavaScript on the frontend cannot access it,

You can’t add it manually to Authorization headers.

Which defeats the purpose of using it in an SPA like Nuxt.

✅ Reason 3: Refresh token should be httpOnly
This token is sensitive, long-lived, and should never be exposed to JS.

Set it with httpOnly: true on the backend like you're doing:

res.cookie('rty_refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  path: '/api/auth/refresh_token', // optional
});


Token	        Set by	    Where	                httpOnly	     Purpose
Access Token	Frontend	JS-accessible cookie	❌ No	        For attaching to API requests
Refresh Token	Backend	    HttpOnly cookie	        ✅ Yes	        For refreshing session securely

```