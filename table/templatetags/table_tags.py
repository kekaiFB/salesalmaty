from django import template
from datetime import datetime

register = template.Library()

@register.simple_tag()
def different_date(current_date, date_start):
    current_date_obj = datetime.strptime(current_date, '%Y-%m-%d')
    date_start_obj = datetime.strptime(date_start, '%Y-%m-%d')
    days = (current_date_obj - date_start_obj).days
    if days > 0:
        return days
    else:
        return 0