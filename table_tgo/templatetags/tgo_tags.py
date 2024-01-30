from django.utils import timezone
from django import template
from datetime import datetime
import os

register = template.Library()


@register.simple_tag
def unique_list(lsit):
    unique_list = set()
    for elem in lsit:
        unique_list.add(elem.ressource.office.title)
    objects = ', '.join(unique_list)
    return str(objects)

@register.simple_tag
def toInt(num):
    return int(num)

@register.simple_tag
def current_day():
    return int(datetime.now().day)

@register.simple_tag
def current_month():
    return ["null" "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря" ][int(datetime.now().month)]

@register.simple_tag
def current_year():
    return int(datetime.now().year)


@register.simple_tag
def unique_ressource(tgo_obj):
    unique_list = set()
    for t in tgo_obj:
        for elem in t.ressource.all():
            unique_list.add(str(elem.ressource))    
    return sorted(list(unique_list))


@register.simple_tag
def unique_operation(tgo_obj):
    listt = list() 
    for tgo in tgo_obj:
        listt.append([str(tgo.order), str(tgo)]) 
    listt.sort(key=lambda x:int(x[0]),reverse=False) 
    listt = [x[0] + ' ' + x[1] for x in listt]
    return listt

@register.inclusion_tag('table_tgo/my_tags/button_add_resource.html')
def button_add_resource(url='', id=0, tgo_id=0):
    return {'url': url, 'id': str(id), 'tgo_id': str(tgo_id)}


@register.inclusion_tag('table_tgo/my_tags/button_add.html')
def button_add(url='', id=0):
    return {'url': url, 'id': str(id)}


@register.inclusion_tag('table_tgo/my_tags/button_add_operation.html')
def button_add_operation(url='', id=0):
    return {'url': url, 'id': str(id)}


@register.inclusion_tag('table_tgo/my_tags/del_button.html')
def del_button(url='', id=0):
    return {'url': url, 'id': str(id)}


@register.inclusion_tag('table_tgo/my_tags/restore_button.html')
def restore_button(url='', id=0):
    return {'url': url, 'id': str(id)}


@register.inclusion_tag('table_tgo/my_tags/button_edit.html')
def edit_button(url='', id=0):
    return {'url': url, 'id': str(id)}


@register.inclusion_tag('table_tgo/my_tags/del_button_text.html')
def button_text(clas, url='', id=0, text=''):
    return {'clas': clas, 'url': url, 'id': str(id), 'text': text}


@register.inclusion_tag('table_tgo/my_tags/copy_button.html')
def copy_button(url='', id=0, title='', ModalTitle=''):
    return {'url': url, 'id': str(id), 'title': title, 'ModalTitle': ModalTitle}



@register.inclusion_tag('table_tgo/my_tags/add_button_text.html')
def add_button_text(url=''):
    return {'url': url}


@register.inclusion_tag('table_tgo/my_tags/add_button_parent.html')
def add_button_parent(url='', id_parent= ''):
    return {'url': url, 'id_parent': id_parent}




#--------------РАСПИСАНИЕ------------


@register.inclusion_tag('timetable/my_tags/del_button.html')
def del_button_timetable(url='', id=0, history_id = 0):
    return {'url': url, 'id': str(id), 'history_id': str(history_id)}


@register.inclusion_tag('timetable/my_tags/button_edit.html')
def edit_button_timetable(url='', id=0, history_id = 0):
    return {'url': url, 'id': str(id), 'history_id': str(history_id)}


@register.inclusion_tag('table_tgo/my_tags/edit_button_post.html')
def edit_button_post(url='', id=0, office_id=0):
    return {'url': url, 'id': str(id), 'office_id': str(office_id)}


@register.inclusion_tag('table_tgo/my_tags/edit_button_role.html')
def edit_button_role(url='', user_id=0, human_id=0, text=''):
    return {'url': url, 'user_id': str(user_id), 'human_id': str(human_id), 'text': text}


@register.inclusion_tag('table_tgo/my_tags/del_human.html')
def del_human( url='', id=0, post_id = 0, office_id = 0):
    return {'url': url, 'id': str(id), 'post_id': str(post_id), 'office_id': str(office_id)}

counter = 0
@register.inclusion_tag('table_tgo/my_tags/merge_table.html')
def merge_table(object, flag='', order = ''):
    # если order != '', значит вставляем в конец максимальным пунктом
    global counter
    if flag == 1:
        counter = 0
    counter += 1
    return {'t': object, 'order': order , 'counter': counter}

@register.inclusion_tag('table_tgo/my_tags/merge_merge_table.html')
def merge_merge_table(object_technology, object_tgo,  flag='', order = ''):
    # если order != '', значит вставляем в конец максимальным пунктом
    global counter
    if flag == 1:
        counter = 0
    counter += 1
    return {'technology': object_technology, 'tgo': object_tgo, 'order': order , 'counter': counter}


@register.simple_tag
def merge_technology_list(tgo_objects, technology_objects, order):
    merge_res_op = {}
    list_objects = []
    for tech_obj in technology_objects:   # иду по всем операциям технологии
        merge_res_op[tech_obj] = 0
        for tgo_obj in tgo_objects:
            if tech_obj.operation == tgo_obj.operation:  # добавляю ресурсы технологии в операцию ТГО
                merge_res_op[tech_obj] = 1
                list_objects.append([[tgo_obj], [tech_obj]])

    for tech_obj in technology_objects:  # остальные добавить в конец
        if merge_res_op[tech_obj] == 0:
            order += 1
            list_objects.append([['0'], [tech_obj], order])
    return list_objects




@register.simple_tag
def check_question_condition(question, user):
    return str(question.author) == str(user) and (timezone.now() - question.created_at < timezone.timedelta(hours=48))


@register.filter
def basename(value):
    return os.path.basename(value)