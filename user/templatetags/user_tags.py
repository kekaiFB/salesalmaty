import re
from django import template
register = template.Library()

from table.models import Company, Post
from django.shortcuts import get_object_or_404
 
@register.inclusion_tag('user/my_tags/button_submit_confirmation.html')
def button_submit_confirmation(label):
   return { 'label': label }

@register.simple_tag()
def name_company(user):
    if 'Администратор' == str(user.groups.all()[0]):
        company = get_object_or_404(Company, leader=user) 
    else:
        company = 'СДЕЛАТЬ ПОТОМ'

    return company

@register.simple_tag()
def query(queryset, **kwargs):
    return queryset.filter(**kwargs)


from datetime import datetime, timedelta
from calendar import monthrange
import locale
# locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
# locale.setlocale(
#     category=locale.LC_ALL,
#     locale="Russian"  )


@register.simple_tag()
def time_diff(date):
    my_date = datetime.strptime(date, "%d-%m-%Y")
    date_now = datetime.now()
    delta = date_now - my_date
    years = delta.days // 365
    months = (delta.days % 365) // 30
    days = delta.days % 30

    result = []
    if years > 0:
        result.append(f"{years} {'год' if years == 1 else 'года' if 1 < years < 5 else 'лет'}")
    if months > 0:
        result.append(f"{months} {'месяц' if months == 1 else 'месяца' if 1 < months < 5 else 'месяцев'}")
    if days > 0:
        result.append(f"{days} {'день' if days == 1 else 'дня' if 1 < days < 5 else 'дней'}")

    return ' '.join(result)

    # my_date = datetime.strptime(date, "%Y-%m-%d")
    # date_now = datetime.now()
    # res = ''

    # res_year =(date_now.year - my_date.year)
    # if res_year > 0:
    #     res += str(res_year)
        
    #     if (res_year == 1) or (res_year == 21) or (res_year == 31):
    #         res += ' год '
    #     elif (res_year > 1 and res_year < 5) or ( res_year > 21 and res_year < 25):
    #         res += ' года '
    #     else:
    #         res += ' лет '
    
    # res_month = date_now.month - my_date.month
    # if res_month > 0:
    #     res += str(res_month)
    #     if res_month == 1:
    #         res += ' месяц '
    #     elif res_month > 1 and res_year < 5:
    #         res += ' месяца '
    #     elif res_month > 5:
    #         res += ' месяцев '
    

    # res_days = (date_now - my_date).days
    # if res_days > 0:
    #     count_days = 0
    #     if date_now.day- my_date.day > 0:
    #         count_days = date_now.day- my_date.day 
    #     else:
    #         count_days= monthrange(date_now.year, date_now.month)[1] + date_now.day- my_date.day

    #     res += str(count_days)

    #     if (count_days == 1) or (count_days == 21) or (count_days == 31):
    #         res += ' день '
    #     elif (count_days > 1 and count_days < 5) or ( count_days > 21 and count_days < 25):
    #         res += ' дня '
    #     else:
    #         res += ' дней '

    # return res


@register.simple_tag()
def get_post(human, posts):
    list = []
    human = human.post.select_related()
    for h in human:
        for p in posts:
            if p.id == h.post_id:
                list.append([p.office.title, p.title, p.office.id, p.id])
    
    return list


@register.simple_tag()
def get_post_update(human_history_id, posts, post_history):
    post_history = [x[1] for x in post_history if x[0] == human_history_id]
    my_list = []
    for ph in post_history:
        for p in posts:
            if p.id == ph:
                my_list.append([p.office.title, p.title, p.office.id, p.id])
    return my_list


@register.simple_tag()
def check_role_employee(groups):
    flag = True
    get_groups = []
    for group in groups:
        if str(group) == 'Начальник': 
            flag = False
        else:
            get_groups.append(str(group))
    if flag:
        return get_groups


@register.simple_tag()
def check_role_boss(groups):
    flag = False
    get_groups = []
    groups =  groups.split(' ')
    for group in groups:
        if str(group) == 'Начальник': 
            flag = True
            get_groups.append(group)

    if flag:
        return get_groups
    

@register.simple_tag()
def unique_office(input_list):
    return set(elem[0] for elem in input_list)
    # unique_office = set()
    # [unique_office.add(elem[0]) for elem in input_list]
    # return unique_office
    

@register.simple_tag()
def strip_groups(groups):
    all_role = {
        'Сотрудник': False,
        'Редактор Абсентеизма': False,
        'Начальник': False,
        'Редактор ТГО': False,
        'ВВЛ - редактор расписания': False,
        'МВЛ - редактор расписания': False,
        'ЕАЭС - редактор расписания': False,
        'Администратор': False
    }
    output_group = []
    for role in all_role:
        if role in groups:
            all_role[role] = True
            output_group.append(role)
    return output_group



@register.simple_tag()
def get_fio(last_name=' ', first_name=' ', sur_name=' '):
    full_name_parts = [part.strip() for part in (last_name, first_name, sur_name) if part is not None and part.strip()]
    return ' '.join(full_name_parts)


    # last_name = last_name or ' '
    # first_name = first_name or ' '
    # sur_name = sur_name or ' '
    # return str(last_name) + ' ' + str(first_name) + ' ' + str(sur_name)


@register.simple_tag()
def get_or_empty(field=' '):
    return field if field != '' else ''


@register.filter
def get_attribute(obj, attribute_name):
    return getattr(obj, attribute_name, '')