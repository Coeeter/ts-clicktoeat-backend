# ts-clicktoeat-backend (ClickToEat V2)
<img src="/public/assets/clicktoeat_v2_logo_round.svg" width="200" align="left" />
This repository contains the source code for the updated and better version of my old project <a href="https://github.com/Coeeter/ClickToRun">ClickToRun</a> which is a restaurant review application. I created this project for my studies in TP as I need to reuse the ClickToEat API for a mobile application. I took up this chance to recreate the api with my current knowledge relevant to this industry and recreated the api with better features and with easy to understand code.
<br clear="left" />

## Features
- User authentication using jwt tokens
- Fetch relevant restaurants, branches, comments, users' favorite restaurants, likes and dislikes
- Able to create comments and reply to other comments
- Able to like or dislike other comments
- Storage of images in Amazon s3 bucket
- A small landing page for the api
- A reset password page to reset password

## Usage
To run this server on your local machine you can clone this repository and make sure to create and env file using the values in the .env.example file in root. Also make sure to have mysql installed on your machine. Then you can run the server on your local port 8080 by running these commands

### For first time running server:
```
npm install
```
To install all packages required for the server to run.

```
npm run build
```
To compile all the typescript files to javascript files.

```
npm run start
```
To start the server.

```
cd public
```
Move to public folder so we can run commands there.

```
npm run build
```
Build the react project.

### For other times:
```
npm run start
```
With this the api is ready to be consumed.<br/>
I have also deployed this api using ec2 and load balancers so you can also use the api by this link https://clicktoeat.nasportfolio.com.

## Built using
- nodejs (for the api)
  - typescript
  - express
  - express-fileupload
  - express-validator
  - typeorm
  - mysql
  - aws-sdk
  - bcrypt
  - jsonwebtoken
  - http-status-codes
  - nodemailer
  - uuid
  - cors
  - dotenv
- reactjs (for the landing and reset password page)
  - vite
  - material ui
  - typescript
  - react-router-dom
  - react-hook-form