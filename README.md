# Car Inventory Management System
The Car Inventory Management System is a Node.js-based backend application that allows users to manage car records. It provides various APIs to perform CRUD (Create, Read, Update, Delete) operations on car records, along with user authentication using JWT and MetaMask for enhanced security.

## Features
User Sign-up and Sign-in: Users can sign up and sign in using their email and password or via MetaMask authentication.
JWT Authentication: Authenticated users receive a JSON Web Token (JWT) for secure API access.
Car Management: Users can create, retrieve, update, and delete car records.
User Roles: The system supports admin and regular user roles. Only admins can perform certain privileged actions.
Car Categories: Cars can be categorized for easy organization and retrieval.
MetaMask Authentication: Users can also authenticate using MetaMask (Ethereum wallet) for enhanced security.
## Installation
Clone the repository: git clone https://github.com/mibraheem03/Ropstam.git
Change into the project directory: cd car-inventory-management
Install dependencies: npm install
## Configuration
Rename  .env.template to .env file in the root directory and set the following environment variables:

MONGODB Your MONGODB Connection Address

ACCESS_TOKEN  Unique Phrase For User authentication Token

EMAIL  Email Address to Sending Sign Up Emails

EMAIL_APP_PASSWORD  App Password For the Email Provided UP

Ensure you enable "less secure apps" or generate an app-specific password if using Gmail.
``
## Usage
Start the server: npm start
Access the API via http://localhost:3000/api/
### API Endpoints
#### Auth
POST /api/signup/email: User sign-up with email and password.

POST /api/signin/email: User sign-in with email and password.

POST /api/signup/metamask: User sign-up with MetaMask authentication.

POST /api/signin/metamask: User sign-in with MetaMask authentication.

#### Car
GET /api/car/cars: Get all car records.

GET /api/car/cars/:id: Get a specific car record by ID.

POST /api/car/cars: Create a new car record (Creater only).

PUT /api/car/cars/:id: Update a specific car record by ID (Creater only).

DELETE /api/car/cars/:id: Delete a specific car record by ID (Creater only).

## Testing
Start the server: npm start
Use Postman or any API client to test the API endpoints with sample requests.
## Security Considerations
Use secure JWT secrets and enable HTTPS for production deployments.
Store sensitive data (e.g., passwords) securely and use bcrypt for password hashing.
Implement role-based access control for privileged actions.
Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

# Acknowledgments
Thanks to the authors of the libraries and frameworks used in this project.