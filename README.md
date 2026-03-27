# Scholarsphere
## Overview
Briefly describe your project and its main features.

## Table of Contents

[Prerequisites](#)

Installation
Configuration
Running the Project
Usage
Contributing
License
Prerequisites
Ensure you have the following prerequisites installed:

Python 3.x
Node.js
npm or yarn
PostgreSQL
Installation
Backend (Flask API)
Clone the repository:

```
sh
Copy code
git clone https://github.com/your-username/your-repository.git
cd your-repository/backend
Create a virtual environment and activate it:
```
sh
Copy code
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
Install the required Python packages:

sh
Copy code
pip install -r requirements.txt
Frontend (React Web App)
Navigate to the frontend directory:

sh
Copy code
cd ../frontend
Install the required Node packages:

sh
Copy code
npm install
# or
yarn install
Database (PostgreSQL)
Ensure PostgreSQL is installed and running.

Create a new database:

sh
Copy code
createdb your-database-name
Set up the database schema and initial data:

sh
Copy code
# Add your database migration or seeding commands here
Configuration
Backend:

Rename backend/.env.example to backend/.env and update the environment variables as needed.
Frontend:

Rename frontend/.env.example to frontend/.env and update the environment variables as needed.
Running the Project
Backend (Flask API)
Start the Flask development server:
sh
Copy code
cd backend
source venv/bin/activate  # Ensure the virtual environment is activated
flask run
Frontend (React Web App)
Start the React development server:
sh
Copy code
cd frontend
npm start
# or
yarn start
Usage
Provide detailed instructions and examples on how to use your project. Include any necessary API endpoints, features, or functionalities.

Contributing
Fork the repository.
Create a new branch: git checkout -b feature-branch-name.
Make your changes and commit them: git commit -m 'Add some feature'.
Push to the branch: git push origin feature-branch-name.
Open a pull request.
License
This project is licensed under the [Your License Name] License - see the LICENSE file for details.






Backend

1. Ensure that you are inside the aru_venv folder directory.
2. Run python -m venv .venv
3. Activate the environment.
4. Run pip install -r requirements.txt
5. Run pip install -e .
6. Run python app.y
7. Create a .env file containing the SECRET_KEY
8. Install wkhtmltopf on https://wkhtmltopdf.org/downloads.html

\*Note
To generate secret key for .env file, use python secrets module.

> > import secrets
> > secrets.token_hex(16)

Frontend

1. Ensure that you are inside the frontend folder directory.
2. Run npm install
3. Run npm start
