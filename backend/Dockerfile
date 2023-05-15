FROM python:3.11
ENV DjangoHome=/home/app/webapp
RUN mkdir -p $DjangoHome
WORKDIR $DjangoHome
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
RUN pip install --upgrade pip
COPY . $DjangoHome
RUN pip install -r requirements.txt
RUN python manage.py migrate
CMD python manage.py runserver 0.0.0.0:8000