# Project mail

Create your virtual env and activate it

```
virtualenv -p python3 venv

. venv/bin/activate
```

Install requirements:

```
pip install -r requirements.txt
```

# Migrate

```
./manage.py makemigrations mail
./manage.py migrate
```

# Sample admin user

```
./manage.py createsuperuser --email=root@example.com
```

# Run server

```
./manage.py runserver
```


Open http://localhost:8000 in your browser