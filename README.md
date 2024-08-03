# Toy Backend API

This is a guide on how to set up and test the Toy Backend API locally. The API provides endpoints for user management and toy operations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [User Routes](#user-routes)
  - [Toy Routes](#toy-routes)
- [Testing the API](#testing-the-api)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v20 or later)
- npm (usually comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/57Ajay/toy-api
   cd toy-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Add the following environment variables to the `.env` file:
   ```
    DATABASE_URL="file:./dev.db"
    PORT=3000
    ACCESS_TOKEN_SECRET=somerandomnumversandcharecterscombinedlikethissfsfwfwef
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=somerandomnumversandcharecterscombinedlikethissfsfwfwef
    REFRESH_TOKEN_EXPIRY=10d
   ```
   Replace `"somerandomnumversandcharecterscombinedlikethissfsfwfwef"` with a strong, unique secret for JWT token generation.

3. Initialize the Prisma database:
   ```
   npx prisma migrate dev --name init
   ```

## Running the Application

Start the server:
```
npm run dev 
/or/
npm start
```

The API should now be running at `http://localhost:3000`.

## API Endpoints

### User Routes

- **Register User**
  - Method: POST
  - URL: `/api/user/register`
  - Body: 
    ```json
    {
      "username": "example_user",
      "email": "user@example.com",
      "password": "secure_password"
    }
    ```

- **Login User**
  - Method: POST
  - URL: `/api/user/login`
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "secure_password"
    }
    ```

- **Logout User**
  - Method: POST
  - URL: `/api/user/logout`
  - Headers: 
    ```
    Authorization: Bearer <your_jwt_token>
    ```

### Toy Routes

- **Add Toy**
  - Method: POST
  - URL: `/api/toys/add-toy`
  - Headers: 
    ```
    Authorization: Bearer <your_jwt_token>
    ```
  - Body:
    ```json
    {
      "name": "Cool Toy",
      "description": "A very cool toy",
      "price": 19.99
    }
    ```

- **Get Toy by Name**
  - Method: GET
  - URL: `/api/toys/:name`

- **Modify Toy**
  - Method: PUT
  - URL: `/api/toys/modify/:id`
  - Headers: 
    ```
    Authorization: Bearer <your_jwt_token>
    ```
  - Body:
    ```json
    {
      "name": "Updated Toy Name",
      "description": "Updated description",
      "price": 24.99
    }
    ```

- **Delete Toy**
  - Method: DELETE
  - URL: `/api/toys/delete/:id`
  - Headers: 
    ```
    Authorization: Bearer <your_jwt_token>
    ```

## Testing the API

You can use tools like [Postman](https://www.postman.com/)(recommend) or [curl](https://curl.se/) to test the API endpoints.

1. Start by registering a new user.
2. Login with the registered user to obtain a JWT token.
3. Use the JWT token in the `Authorization` header for authenticated routes.
4. Test the toy routes by adding, retrieving, modifying, and deleting toys.

Remember to replace `:name` and `:id` in the URLs with actual toy names and IDs when testing.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed (`npm install`).
2. Check if the `.env` file is properly configured.
3. Verify that the database migrations have been applied.
4. Check the console for any error messages.

If problems persist, please open an issue in the GitHub repository.

---

Happy coding! If you have any questions or need further assistance, feel free to reach out.