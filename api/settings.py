"""
Django settings for SciLO project.

Generated by 'django-admin startproject' using Django 2.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
import logging

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'cg#p$g+j9tax!#a3cup@1$8obt2_+&k3q+pmu)5%asj6yjpkag'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', r'cg#p$g+j9tax!#a3cup@1$8obt2_+&k3q+pmu)5%asj6yjpkag')

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
DEBUG = os.environ.get('DJANGO_DEBUG', '') != 'False'

ALLOWED_HOSTS = [".localhost", "127.0.0.1", "[::1]", "equiz.math.ualberta.ca", "142.244.163.57"]

# REST
REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# Application definition

INSTALLED_APPS = [
    'django.contrib.auth',
    'polls.apps.PollsConfig',
    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
]
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SECURE = True
# X_FRAME_OPTIONS = 'SAMEORIGIN'
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://142.244.163.57:3000'
]

ROOT_URLCONF = 'api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    }, {
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'NAME': 'django2',
        'DIRS': [os.path.join(BASE_DIR, 'frontend/build')]  #Look, we have added the root folder of frontend here
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api.wsgi.application'

AUTH_USER_MODEL = 'polls.UserProfile'


# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

POSTGRES_HOST = os.environ.get("POSTGRES_HOST", None)
POSTGRES_PORT = os.environ.get("POSTGRES_PORT", None)
POSTGRES_NAME = os.environ.get("POSTGRES_NAME", None)
POSTGRES_USER = os.environ.get("POSTGRES_USER", None)
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", None)

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', None)
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', None)
EMAIL_USE_TLS = True
EMAIL_HOST = os.environ.get('EMAIL_HOST', None)
EMAIL_PORT = os.environ.get('EMAIL_PORT', None)
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', None)
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', None)

# Temp config to send emails to a file on your system
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = os.path.join(BASE_DIR, 'emails/')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': POSTGRES_NAME,
        'USER': POSTGRES_USER,
        'PASSWORD': POSTGRES_PASSWORD,
        'HOST': POSTGRES_HOST,
        'PORT': POSTGRES_PORT,
        'TEST': {
            'NAME': 'postgres_test',
        },
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
# Google authentication
CLIENT_ID = "216032897049-hvr6e75vc4cnb4ulvblh2vq97jqhke75.apps.googleusercontent.com"
GSUITE_DOMAIN_NAMES = ['ualberta.ca']

# Sagecell Configurations
# SAGECELL_URL = "https://sagecell.sagemath.org" 
# SAGECELL_URL = "http://142.244.163.57:8888"
SAGECELL_URL = "http://0.0.0.0:8888"

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = '.static'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'frontend', "build"),  # update the STATICFILES_DIRS
)

NOSE_ARGS = ['--nocapture',
             '--nologcapture', ]

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

logging.basicConfig(level=logging.INFO)
