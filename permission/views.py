from django.contrib.auth.models import Group, User, Permission
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from table.models import ScheduleNotJob
from django.http import HttpResponse
from django.apps import apps
from django.contrib.auth import get_user_model

def index(request, user=0):
    try:
        editorPremission()
        empolyee()
        administrator()
        boss()
        # editorTGO()
        
        # for type_country in ['ВВЛ', 'МВЛ', 'ЕАЭС']:
        #     editorTimetable(type_country)
        # from django.contrib.auth.models import User
        # user=User.objects.create_user(username='admin1', email='admin1@mial.ru', password='admin1')
        # user.is_superuser=True
        # user.is_staff=True
        # user.save()
        return HttpResponse("yea")
    except Exception as e:
        return HttpResponse("oops.. no", e)

def editorPremission():
    editor_table, created = Group.objects.get_or_create(name="Редактор Абсентеизма")
    app_models = apps.get_app_config('table').get_models()

    for model in app_models:
        try:
            content_type = ContentType.objects.get_for_model(model)
            post_permission = Permission.objects.filter(content_type=content_type)
            for perm in post_permission:
                if perm.codename == "change_schedulenotjob":
                    editor_table.permissions.add(perm)
                    break
        except:
            pass

def editorTGO():
    editor_table, created = Group.objects.get_or_create(name="Редактор ТГО")
    app_models = apps.get_app_config('table_tgo').get_models()

    for model in app_models:
        try:
            content_type = ContentType.objects.get_for_model(model)
            post_permission = Permission.objects.filter(content_type=content_type)
            for perm in post_permission:
                    editor_table.permissions.add(perm)
        except:
            pass


def editorTimetable(type_country=''):
    editor_table, created = Group.objects.get_or_create(name = type_country + " - редактор расписания")
    app_models = apps.get_app_config('timetable').get_models()

    for model in app_models:
        try:
            content_type = ContentType.objects.get_for_model(model)
            post_permission = Permission.objects.filter(content_type=content_type)
            for perm in post_permission:
                    editor_table.permissions.add(perm)
        except:
            pass




'''
    user = User.objects.get(username=user)
    user.groups.add(editor_group)

    user = get_object_or_404(User, pk=user.id)

    print(user.has_perm("place.delete_place")) 
    print(user.has_perm("place.change_place")) 
    print(user.has_perm("place.view_place")) 
    print(user.has_perm("place.add_place"))
'''
#https://testdriven.io/blog/django-permissions/



def empolyee():
    empolyee, created = Group.objects.get_or_create(name="Сотрудник")
    # app_models = apps.get_app_config('table').get_models()
    # for model in app_models:
    #     try:
    #         content_type = ContentType.objects.get_for_model(model)
    #         post_permission = Permission.objects.filter(content_type=content_type)
    #         for perm in post_permission:
    #             administrator.permissions.add(perm)
    #     except:
    #         pass

def administrator():
    administrator, created = Group.objects.get_or_create(name="Администратор")
    get_perm_apps_full(administrator)


def boss():
    boss, created = Group.objects.get_or_create(name="Начальник")
    boss.permissions.clear()
    exclude_perm = ['add_operation']
    exclude_table = ['timetable']
    get_perm_apps_full(boss, exclude_perm, exclude_table)
    

def get_perm_apps_full(user_role, exclude_perm = [], exclude_table=[]):
    for app in ['table',]:
    # for app in ['table', 'table_tgo', 'timetable']:
        if app not in exclude_table:
            app_models = apps.get_app_config(app).get_models()

            for model in app_models:
                try:
                    content_type = ContentType.objects.get_for_model(model)
                    post_permission = Permission.objects.filter(content_type=content_type)
                    for perm in post_permission:
                        if 'Компания' in perm.name or any(perm.codename in x for x in exclude_perm):
                            pass
                        else:
                            try:
                                user_role.permissions.add(perm)
                            except:
                                pass
                except:
                    pass

