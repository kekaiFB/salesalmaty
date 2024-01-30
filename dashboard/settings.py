import os
from pathlib import Path
from decouple import config 
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

MODE=config("MODE")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', cast=bool)
LOGIN_URL = 'user:login'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    #приложения
    'table',
    'table_tgo',
    'timetable',

    #разное
    'crispy_forms',
    'crispy_bootstrap5',
    'widget_tweaks',
    'smart_selects',
    'django_filters',
    'captcha',
    'django_select2',

    #разграничение прав доступа
    'permission.apps.PermissionConfig',

    #авторизация и регистрация
    'user.apps.UserConfig',
    
    #Для статических файлов
    'whitenoise.runserver_nostatic',

    #История изменений
    'simple_history',
]

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    #История изменений
    'simple_history.middleware.HistoryRequestMiddleware',

    #Для статики
    'whitenoise.middleware.WhiteNoiseMiddleware',

    # Пользовательские
    # 'table.middleware.Process500',
    # 'table_tgo.middleware.Process500',
    # 'timetable.middleware.Process500',
    # 'user.middleware.Process500',
]
#Для статики
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

ROOT_URLCONF = "dashboard.urls"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "templates")],
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
                # 'user.context_processors.context_user_site',
            ],
        },
    },
]

WSGI_APPLICATION = "dashboard.wsgi.application"



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'ATOMIC_REQUESTS': True

    }
}


#Подтверждение почты
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT')
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True


EMAIL_BACKEND = config('EMAIL_BACKEND')
# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = "ru"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


#для работы со статикой
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

STATICFILES_DIRS = [
    BASE_DIR / "table/static",
    BASE_DIR / "table_tgo/static",
    BASE_DIR / "user/static",
    BASE_DIR / "timetable/static",
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 5,
        }
    },
]



#сохраняться сеанс в базе данных при каждом отдельном запросе
SESSION_SAVE_EVERY_REQUEST =True


RECAPTCHA_PUBLIC_KEY = '6LcJykcmAAAAABZBnVc3SBbcfDtG9Akn9ZWl25vj'
RECAPTCHA_PRIVATE_KEY = '6LcJykcmAAAAAF_3omDPe6qeNf59SNis33QWXUBS'
SILENCED_SYSTEM_CHECKS = ['captcha.recaptcha_test_key_error']

CSRF_COOKIE_SECURE = True