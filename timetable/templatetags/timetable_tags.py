from ast import literal_eval
from django.utils.safestring import mark_safe
from bs4 import BeautifulSoup
from django import template
register = template.Library()
from datetime import datetime


@register.simple_tag
def timetable_history_tag(timetable):
    list_timetable = []
    res = Timetable.history.select_related().order_by('-history_date')
    for elem in timetable:
        count = 0
        listField = []
       
        for r in res:
            if r.id == elem.id:
                if count == 0:
                    count+=1
                    listField.append(r.history_date)
                    new_record = r
                elif count == 1:
                    count+=1
                    old_record = r
                    delta = new_record.diff_against(old_record)
                    for change in delta.changes:
                        listField.append(change.field)
                    list_timetable.append(listField)
                elif count > 1:
                    
                    break
                else:
                    pass

        if len(listField) == 1:
            list_timetable.append([datetime.now()])
    return list_timetable 


@register.inclusion_tag('timetable/my_tags/classTimetable.html')
def classTimetable( t_value=0, t_label='', th = []):
    if t_value is None:
        t_value = ''
    style = ''
    clas = []
    th_date = th[0]
    th_date = datetime(th_date.year, th_date.month, th_date.day, th_date.hour, th_date.minute, th_date.second,  th_date.microsecond)   
    difference_minutes = (datetime.now()-th_date).total_seconds() / (60*60)
    if t_label in th:
        if difference_minutes < 10:
            clas = ["fw-bold", "text-white"]
            style = "#f00"
        elif difference_minutes < 30:
            clas = ["fw-bold", "text-white"]
            style = "#ff4f4f"
        elif difference_minutes < 60: 
            style = "#fc7979"
        elif difference_minutes < 240: 
            style = "#ffa1a1"
        elif difference_minutes < 480: 
            style = "#ffd1d1"
        elif difference_minutes < 1440: 
            style = "#f1f2a7"
        elif difference_minutes < 2880: 
            style = "#feffcc"
        elif difference_minutes < 10080: 
            style = "#f9fae1"
    return { 't_value': t_value,  't_label': t_label, 'style': style, 'clas': clas}


@register.inclusion_tag('timetable/my_tags/classTimetable_link.html')
def classTimetable_link( t_value=0, t_label='', th = [], label=''):
    if t_value is None:
        t_value = ''
    style = ''
    clas = []
    th_date = th[0]
    th_date = datetime(th_date.year, th_date.month, th_date.day, th_date.hour, th_date.minute, th_date.second,  th_date.microsecond)   
    difference_minutes = (datetime.now()-th_date).total_seconds() / (60*60)
    if t_label in th:
        if difference_minutes < 10:
            clas = ["fw-bold", "text-white"]
            style = "#f00"
        elif difference_minutes < 30:
            clas = ["fw-bold", "text-white"]
            style = "#ff4f4f"
        elif difference_minutes < 60: 
            style = "#fc7979"
        elif difference_minutes < 240: 
            style = "#ffa1a1"
        elif difference_minutes < 480: 
            style = "#ffd1d1"
        elif difference_minutes < 1440: 
            style = "#f1f2a7"
        elif difference_minutes < 2880: 
            style = "#feffcc"
        elif difference_minutes < 10080: 
            style = "#f9fae1"
    return { 't_value': t_value,  't_label': t_label, 'style': style, 'clas': clas, 'label': label}


@register.simple_tag
def background(timetablestatusight):
    # timetablestatusight = str(timetablestatusight)
    # style = ''
    # if timetablestatusight == 'Действует':
    #     pass
    # elif timetablestatusight == 'На согласовании':
    #     style = "#fbff0d"
    # elif timetablestatusight == 'Тестирование':
    #     style = "#bae8e8"
    # elif timetablestatusight == 'Отменен':
    #     pass
    # elif timetablestatusight == 'Отказано':
    #     pass
    # elif timetablestatusight == 'Заявка':
    #     style = "#6da3d6"
    status_styles = {
        'Действует': '',
        'На согласовании': '#00bfff',  
        'Тестирование': '#ffa500',   
        'Отменен': '',
        'Отказано': '',
        'Заявка': '#ffff00',          
    }

    return status_styles.get(str(timetablestatusight), '')  


@register.simple_tag
def check_exist(title, val):
    val = val or 0
    if title == 'airline':
        if Airlines.objects.filter(id = val).exists():
            return Airlines.objects.filter(id = val)[0]
    elif title == 'flight':
        if Flight.objects.filter(id = val).exists():
            return Flight.objects.filter(id = val)[0]
    elif title == 'airplane':
        if Fleet.objects.filter(fleets_aiplane = val).exists():
            return Fleet.objects.filter(fleets_aiplane = val)[0]
    elif title == 'equipmentAirplane':
        if EquipmentAirplane.objects.filter(id = val).exists():
            return EquipmentAirplane.objects.filter(id = val)[0].seats
    elif title == 'tgo':
        if Timetable.objects.filter(tgo__id = val).exists():
            return Timetable.objects.filter(tgo__id = val)[0].tgo.tgo_length
        else:
            return ''
    else:
        return ''


@register.simple_tag
def color(timetablestatusight):
    timetablestatusight = str(timetablestatusight)
    # if timetablestatusight == 'Действует':
    #     pass
    # elif timetablestatusight == 'На согласовании':
    #     pass
    # elif timetablestatusight == 'Тестирование':
    #     pass
    # elif timetablestatusight == 'Отменен':
    #     color = 'grey'
    # elif timetablestatusight == 'Отказано':
    #     color = 'red'
    # elif timetablestatusight == 'Заявка':
    #     pass
    
    status_colors = {
        'Действует': '',
        'На согласовании': '',
        'Тестирование': '',
        'Отменен': 'grey',
        'Отказано': 'red',
        'Заявка': '',
    }
    return status_colors.get(timetablestatusight, '')
    

@register.simple_tag
def check_days_week(dw='', t=[]):
    if t.monday and dw == 'monday':
        return  1
    elif t.tuesday and dw == 'tuesday':
        return  2
    elif t.wednesday and dw == 'wednesday':
        return  3
    elif t.thursday and dw == 'thursday':
        return  4
    elif t.friday and dw == 'friday':
        return  5
    elif t.saturday and dw == 'saturday':
        return  6
    elif t.sunday and dw == 'sunday':
        return  7
    else:
        return None

    

@register.inclusion_tag('timetable/my_tags/days_flight.html')
def day_flight(t=[]):
    days_flight = []

    if t.monday :
        days_flight.append(1)
    if t.tuesday:
        days_flight.append(2)
    if t.wednesday:
        days_flight.append(3)
    if t.thursday:
        days_flight.append(4)
    if t.friday:
        days_flight.append(5)
    if t.saturday:
        days_flight.append(6)
    if t.sunday:
        days_flight.append(7)
    return {'days_flight': days_flight}


@register.inclusion_tag('timetable/my_tags/checkedBolean.html')
def next_day_status(next_day_status=True):
    return {'next_day_status': next_day_status}


@register.inclusion_tag('timetable/my_tags/error_timetable_time.html')
def error_timetable_time(status=False):
    return {'status': status}


@register.inclusion_tag('timetable/my_tags/class_next_day_status.html')
def class_next_day_status(t_value=0, t_label='', th = []):
    style = ''
    clas = []
    th_date = th[0]
    th_date = datetime(th_date.year, th_date.month, th_date.day, th_date.hour, th_date.minute, th_date.second,  th_date.microsecond)   
    difference_minutes = (datetime.now()-th_date).total_seconds() / (60*60)
    if t_label in th:
        if difference_minutes < 10:
            clas = ["fw-bold", "text-white"]
            style = "#f00"
        elif difference_minutes < 30:
            clas = ["fw-bold", "text-white"]
            style = "#ff4f4f"
        elif difference_minutes < 60: 
            style = "#fc7979"
        elif difference_minutes < 240: 
            style = "#ffa1a1"
        elif difference_minutes < 480: 
            style = "#ffd1d1"
        elif difference_minutes < 1440: 
            style = "#f1f2a7"
        elif difference_minutes < 2880: 
            style = "#feffcc"
        elif difference_minutes < 10080: 
            style = "#f9fae1"
    return { 't_value': t_value,  't_label': t_label, 'style': style, 'clas': clas}


@register.simple_tag
def label_week(dws=0):
    days_labels = {
        1: 'Понедельник',
        2: 'Вторник',
        3: 'Среда',
        4: 'Четверг',
        5: 'Пятница',
        6: 'Суббота',
        7: 'Воскресенье',
    }
    return days_labels.get(dws, None)
    # if dws == 1:
    #     return 'Понедельник'
    # elif dws == 2:
    #     return 'Втроник'
    # elif dws == 3:
    #     return 'Среда'
    # elif dws == 4:
    #     return 'Четверг'
    # elif dws == 5:
    #     return 'Пятница'
    # elif dws == 6:
    #     return 'Суббота'
    # elif dws == 7:
    #     return 'Воскресенье'
    # else:
    #     pass


@register.simple_tag
def check_type_perms_timetable(type_flight, user_groups):
    # у админа доступ ко всему
    if 'Администратор' in (group.strip() for group in user_groups): 
        return True

    # требования к нужному типу страну
    type_country_edit = {'МВЛ': False, 'ВВЛ': False, 'ЕАЭС': False}
    type_flight_list = str(type_flight).split(' ')
    
    # Установка флагов в True для типов стран, которые есть в type_flight
    for obj in type_flight_list:
        if obj in type_country_edit:
            type_country_edit[obj] = True
    
    
    # проверка тербований, должна удовлетворять всем требованиями
    for group in user_groups: 
        for obj in group.split(' '):
            if obj in type_country_edit:
                type_country_edit[obj] = False
                
    # Проверка, что все требования выполнены
    return all(value is False for value in type_country_edit.values())


@register.inclusion_tag('timetable/my_tags/button_analitics.html')
def button_analitics(url, id):
    return { 'url': url,  'id': id}


@register.inclusion_tag('timetable/my_tags/button_allocation.html')
def button_allocation(url, id):
    return { 'url': url,  'id': id}


@register.simple_tag
def check_start_tgo_in_flight(timetable_time, tgo_length):
    if timetable_time and tgo_length:
        # Парсим время из строк в объекты timedelta
        timetable_timedelta = parse_time_string(str(timetable_time))
        tgo_length_timedelta = parse_time_string(str(tgo_length))

        # Вычисляем начало выполнения ТГО
        start_tgo_timedelta = timetable_timedelta - tgo_length_timedelta

        # Форматируем начало выполнения ТГО в строку (hh:mm:ss)
        hours = int(start_tgo_timedelta.total_seconds() // 3600)
        start_tgo_timedelta = start_tgo_timedelta - timedelta(hours=hours)
        minutes = int(start_tgo_timedelta.total_seconds() // 60)
        seconds = int(start_tgo_timedelta.total_seconds() % 60)

        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    else:
        return "Нет данных"

def parse_time_string(time_str):
    # Разделяем строку времени
    time_components = time_str.split(':')

    if len(time_components) == 3:
        hours, minutes, seconds = map(int, time_components)
    elif len(time_components) == 2:
        hours, minutes = map(int, time_components)
        seconds = 0
    else:
        hours, minutes, seconds = 0, 0, 0

    return timedelta(hours=hours, minutes=minutes, seconds=seconds)


@register.filter
def display_if_exists(value):
    if value:
        return value
    return 'нет данных'


@register.inclusion_tag('timetable/my_tags/timetable_flight_tgo_list_tags.html')
def timetable_flight_tgo_list_tags(timetables):
    return { 'timetables': timetables}


@register.inclusion_tag('timetable/my_tags/is_default_checkbox.html')
def is_default_checkbox(value, id):
    return { 'value': value, 'id': id}


@register.simple_tag
def calculate_end_tgo(timetable_time, tgo_length):
    # print(timetable_time, tgo_length)
    if timetable_time and tgo_length:
        # Парсим время из строк в объекты timedelta
        timetable_timedelta = parse_time_string(str(timetable_time))
        tgo_length_timedelta = parse_time_string(str(tgo_length))

        # Вычисляем начало выполнения ТГО
        start_tgo_timedelta = timetable_timedelta + tgo_length_timedelta

        # Форматируем начало выполнения ТГО в строку (hh:mm:ss)
        hours = int(start_tgo_timedelta.total_seconds() // 3600)
        start_tgo_timedelta = start_tgo_timedelta - timedelta(hours=hours)
        minutes = int(start_tgo_timedelta.total_seconds() // 60)
        seconds = int(start_tgo_timedelta.total_seconds() % 60)

        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    else:
        return "Нет данных"


@register.inclusion_tag('timetable/my_tags/multiple_set_tgo_button.html')
def multiple_set_tgo_button():
    return {}


@register.inclusion_tag('timetable/my_tags/referenceTimetable.html')
def referenceTimetable():
    return {}


# @register.simple_tag
# def format_list(value):
#     try:
#         # Преобразование строки в список
#         list_value = literal_eval(value)
        
#         # Форматирование списка для отображения в HTML с переносами строк
#         formatted_list = '<br>'.join([str(item) for item in list_value])
#         return formatted_list
#     except (ValueError, SyntaxError):
#         # В случае ошибки возвращаем исходное значение
#         return value

 
@register.inclusion_tag('timetable/my_tags/list_to_select.html')
def list_to_select(value):
    options = []  # Создаем пустой список опций
    if value is not None and value != '':
        # Разделение строки на список по запятым
        options = [item for item in value.split(', ')]
    
    return {'options': options, 'has_options': bool(options)}


@register.simple_tag
def mailbox_html_to_text(message):
    if message.html:
        # Предположим, что message содержит ваш HTML фрагмент
        html_fragment = message.html

        # Создайте объект BeautifulSoup
        soup = BeautifulSoup(html_fragment, 'html.parser')

        # Извлеките текст из HTML фрагмента
        text = soup.get_text()
        return text
    return message.text




@register.inclusion_tag('timetable/my_tags/message_used.html')
def format_list(message_used):
    list_value = []
    list_value = literal_eval(message_used.action)
    
    formatted_messages = []
    for item in list_value:
        for key, items in item.items():
            this_row = key
            new_row = ''
            last_index = 0

            # Проверяем, является ли item['value'] строкой
            items = [{'value': str(value['value']), 'action': value['action']} for value in items]
            # Создаем список всех вхождений с их индексами
            indexes = [(i, i+len(item['value']), item) for item in items for i in range(len(this_row)) if this_row.startswith(item['value'], i)]

            indexes.sort(key=lambda x: x[0]) 

            # Форматируем this_row, вставляя HTML теги
            for start, end, item in indexes:
                if start >= last_index:
                    color = 'red' if item['action'] == 'false' else 'green'
                    new_row += this_row[last_index:start] + f"<span style='color: {color};'>{item['value']}</span>"
                    last_index = end

            new_row += this_row[last_index:]
            formatted_messages.append(new_row)

    return {'formatted_messages': formatted_messages}


@register.inclusion_tag('timetable/my_tags/message_used_action.html')
def format_list_action(message_used, id):
    list_value = []
    list_value = literal_eval(message_used.action)
    
    formatted_messages = []
    for item in list_value:
        for key, items in item.items():
            this_row = key
            new_row = ''
            last_index = 0
            info_for_row = []

            items = [{'value': str(value['value']), 'action': value['action'], 'text': value['text']} for value in items]

            # Создаем список всех вхождений с их индексами
            indexes = [(i, i+len(item['value']), item) for item in items for i in range(len(this_row)) if this_row.startswith(item['value'], i)]
            indexes.sort(key=lambda x: x[0])  # Сортируем по первому элементу кортежа
            
            # Форматируем this_row, вставляя HTML теги
            for start, end, item in indexes:
                if start >= last_index:
                    color = 'red' if item['action'] == 'false' else 'green'

                    new_row += this_row[last_index:start] + f"<span style='color: {color};'>{item['value']}</span>"
                    info_for_row.append({'value': item['text'], 'color': color})
                    last_index = end

            new_row += this_row[last_index:]
            unique_info_for_row = list({message['value']: message for message in info_for_row}.values())

            formatted_messages.append({'new_row': new_row, 'info_for_row': unique_info_for_row})



    return {'formatted_messages': formatted_messages, 'id': id}


    

@register.inclusion_tag('timetable/my_tags/days_flight.html')
def new_day_flight(dict_week={}):
    days_flight = []

    # Найдем начало и конец словаря в строке
    start_index = dict_week.find('{')
    end_index = dict_week.rfind('}')
    
    # Извлечем часть строки, содержащую словарь, и удалим ковычки и слово "Дни недели"
    dict_string = dict_week[start_index + 1:end_index].strip().replace("Дни недели", "")
    dict_string = "{" + dict_string + "}"

    # Преобразуем полученную строку в словарь
    dict_week = literal_eval(dict_string)

    if dict_week['monday']:
        days_flight.append(1)
    if dict_week['tuesday']:
        days_flight.append(2)
    if dict_week['wednesday']:
        days_flight.append(3)
    if dict_week['thursday']:
        days_flight.append(4)
    if dict_week['friday']:
        days_flight.append(5)
    if dict_week['saturday']:
        days_flight.append(6)
    if dict_week['sunday']:
        days_flight.append(7)
    return {'days_flight': days_flight}




@register.inclusion_tag('timetable/my_tags/buttons_to_dt_navbar.html')
def buttons_to_dt_navbar(id='', timetable_id=0, current_view=''):
    return {'id': id, 'timetable_id': timetable_id, 'current_view': current_view}

    