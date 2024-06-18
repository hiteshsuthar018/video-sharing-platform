# Video sharing platform

## steps to setup project

- first clone the project on your local
- install the node_module by executing `npm install` in the git folder
- create a file `.env` and write the code
```
PORT=3000
MONGODB_URI=<YOUR_MONGODB_URL>
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=<YOUR_ACCESS_TOKEN>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<YOUR_REFRESH_TOKEN>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_NAME>
CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_KEY>
```
- start the server using `npm run dev`