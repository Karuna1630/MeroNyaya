# MeroNyaya

MeroNyaya is an AI-powered legal consultation platform that connects clients with lawyers for consultation, case management, secure payment, notifications, multilingual communication, and AI-based legal assistance.

---

## Instructions to Run the Project

Follow these steps to run the project locally.

---

### 1. Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/yourusername/MeroNyaya.git
cd MeroNyaya
```

---

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

**On Windows**

```bash
venv\Scripts\activate
```

**On Mac/Linux**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

The backend will run at:

```bash
http://127.0.0.1:8000/
```

---

### 3. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm run dev
```

The frontend will run at:

```bash
http://localhost:5173/
```

---

### 4. Database Configuration

Make sure your database settings in the backend configuration file are correct.

Example database configuration:

```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'MeroNyayaDB',
        'USER': 'your_db_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '1433',
    }
}
```

---

### 5. Environment Variables

Create a `.env` file in the backend directory and configure:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=MeroNyayaDB
DB_USER=your_db_user
DB_PASSWORD=your_password
```

---

### 6. Access the Application

Frontend:

```bash
http://localhost:5173
```

Backend API:

```bash
http://127.0.0.1:8000
```

---

## Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Axios

### Backend

* Django
* Django REST Framework
* SQL Server

---
