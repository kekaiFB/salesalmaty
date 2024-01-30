from django.db import models
from datetime import timedelta

#Для post_save
from django.dispatch import receiver
from django.db.models.signals import post_delete, post_save
from django.core.cache import cache 

from smart_selects.db_fields import ChainedForeignKey, ChainedManyToManyField
from django.urls import reverse
from django.contrib.auth.models import User
from simple_history.models import HistoricalRecords


class Company(models.Model):  
    title = models.CharField(max_length=150, db_index=True, verbose_name="Компания", unique=True)  
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leader_user')
    email = models.EmailField(max_length=254, verbose_name="email", blank=True, null=True)
    password_app = models.CharField(max_length=500, verbose_name="Пароль приложения", blank=True, null=True)

 
    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = '1 Компании'

    def __str__(self):
        return self.title

class Office(models.Model):  
    сompany = models.ForeignKey(Company, on_delete=models.CASCADE, verbose_name="Компания", blank=True, null=True)  
    title = models.CharField(max_length=500, db_index=True, verbose_name="Подразделение")  

    class Meta:
        verbose_name = 'Подразделение'
        verbose_name_plural = '1 Подразделения'
        unique_together = [['сompany', 'title']]
        ordering = ['title']

    def __str__(self):
        return self.title
            

class Post(models.Model):
    office = models.ForeignKey(Office, on_delete=models.CASCADE, verbose_name="Подразделение", related_name='posts')  
    title = models.CharField(max_length=500, db_index=True, verbose_name="Должность")

    class Meta:
        verbose_name = 'Должность'
        verbose_name_plural = '2 Должности'
        unique_together = [['office', 'title']]
        ordering = ['title']


    def __str__(self):
        return self.title



class WorkStatus(models.Model):  
    title = models.CharField(max_length=500, verbose_name="Название", unique=True)

    class Meta:
        verbose_name = 'Статус работника'
        verbose_name_plural = '5 Статусы работника' 
        ordering = ['title']  

    def __str__(self):
        return self.title
    

class Human(models.Model):  
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="user", null=True, unique=True, related_name='humans_user')
    groups = models.CharField(max_length=300, db_index=True, null=True)  
    office = models.ManyToManyField(Office, verbose_name="Подразделение", related_name='humans')  
    post = models.ManyToManyField(Post, verbose_name="Должность", related_name='humans') 
    first_name = models.CharField(max_length=200, db_index=True, verbose_name="Имя", default='', null=True)  
    last_name = models.CharField(max_length=200, db_index=True, verbose_name="Фамилия", default='', null=True)    
    sur_name = models.CharField(max_length=200, db_index=True, verbose_name="Отчество", null=True, blank=True)  
    status = models.ForeignKey(WorkStatus, on_delete=models.CASCADE, verbose_name="Статус", null=True)  
    date_start = models.DateField(blank=True, null=True, verbose_name="Начало работы") 
    shift = models.ForeignKey('Shift', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Смена", related_name='humans') 

    comment_update = models.CharField(max_length=200, db_index=True, verbose_name="Комментарий", null=True, blank=True)  
    author_update = models.ForeignKey(User, on_delete=models.SET_NULL, verbose_name="user_update", related_name="humans", null=True)
    history = HistoricalRecords(m2m_fields=[post], verbose_name='Версия', cascade_delete_history=True, related_name='humans')
    

    is_active = models.BooleanField(verbose_name='Активный', default=True)
    comment = models.CharField(max_length=400, blank=True, null=True,  verbose_name="Комментарий", default='')  
    time_update = models.DateTimeField(auto_now=True, verbose_name='Дата обновления', null=True)

    employee_number = models.CharField(max_length=200, blank=True, null=True, verbose_name="Номер сотрудника в базе данных кадровой службы")

    class Meta:
        verbose_name = 'Человек'
        verbose_name_plural = '3 Люди' 
        ordering = ['last_name']  
        unique_together = [['user', 'employee_number']]
   
    def __str__(self):
        return f"{self.last_name} {self.first_name} {self.sur_name}"


    def get_absolute_url(self):
       return reverse('user:user', kwargs={'id': self.id})

class Reason(models.Model):  
    title = models.CharField(max_length=200, verbose_name="Продукт", null=True, blank=True) 
    body = models.CharField(max_length=150, verbose_name="Описание", null=True, blank=True) 

    class Meta:
        verbose_name = 'Продук'
        verbose_name_plural = '5 Продукт' 
        ordering = ['title']  

    def __str__(self):
        return self.title


class Shift(models.Model):  
    title = models.CharField(max_length=150, verbose_name="Название") 
    description = models.CharField(max_length=500, verbose_name="Описание")

    class Meta:
        verbose_name = 'Смена'
        verbose_name_plural = '6 Смены' 
        ordering = ['title']  

    def __str__(self):
        return self.title

        

class ShiftOffice(models.Model):
    office = models.ForeignKey(Office, on_delete=models.CASCADE, verbose_name="Подразделение")
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, verbose_name="Смена")
    cycle_start_date = models.DateTimeField(verbose_name="Дата начала цикла", null=True)
    cycle_end_date = models.DateTimeField(verbose_name="Дата окончания цикла", null=True)
    work_days_hours = models.JSONField(verbose_name="Рабочие дни и часы", null=True)

    class Meta:
        verbose_name = 'Смена в подразделении'
        verbose_name_plural = 'Смены в подразделениях'
        unique_together = [['office', 'shift']]

    def __str__(self):
        return f"{self.shift.title} в {self.office.title}"

    def generate_cycle_dates(self, work_schedule):
        cycle_dates = {}
        for date, is_working in work_schedule.items():
            date_time_obj = datetime.datetime.strptime(date, '%Y-%m-%d %H')
            if self.cycle_start_date <= date_time_obj:
                cycle_dates[date] = is_working
        return cycle_dates
     

class ScheduleNotJob(models.Model):
    office = models.ForeignKey(Office, on_delete=models.SET_NULL, null=True, verbose_name="Подразделение", related_name='snj') 
    post = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True, verbose_name="Должность", related_name='snj') 
    human = models.ForeignKey(Human, on_delete=models.CASCADE, verbose_name="Сотрудник", related_name='snj')  
    
    reason = models.ForeignKey(Reason, on_delete=models.SET_NULL, null=True, verbose_name="Причина", related_name='snj')
    comment = models.CharField(max_length=300, blank=True, null=True, verbose_name="Примечание")
    length_time = models.IntegerField(blank=True, null=True, verbose_name="Длительность")
    date_start = models.DateField(blank=True, null=True, verbose_name="Начало") 
    date_end = models.DateField(blank=True, null=True, verbose_name="Окончание") 

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author_snj", null=True, verbose_name="Автор")
    editor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="editor_snj", null=True,  verbose_name="Редактор")

    history = HistoricalRecords(verbose_name='Версия', cascade_delete_history=True, related_name='snj')
     
    class Meta:
        verbose_name = 'Данные продажи'
        verbose_name_plural = '7 Данные продаж'

    def __str__(self):
        return str(self.human)


# @receiver(post_save, sender=ScheduleNotJob)
# def update_date_snj(sender, instance, **kwargs):
#     if instance.length_time:
#         date_end = instance.date_start + timedelta(days=instance.length_time - 1)
#         sender.objects.filter(pk=instance.id).update(date_end=date_end.strftime('%Y-%m-%d'))
#     elif instance.date_end:
#         length_time = (instance.date_end - instance.date_start).days
#         sender.objects.filter(pk=instance.id).update(length_time=length_time + 1)    
#     else:
#          sender.objects.filter(pk=instance.id).update(date_end=None)


class ImportExample(models.Model):
    input_file = models.FileField(upload_to='imports/example/', null=True, blank=True, verbose_name="Шаблон")


class Import(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Автор")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    import_name = models.CharField(max_length=255, verbose_name="Экспорт View")
    input_file = models.FileField(upload_to='imports/input_file/', null=True, blank=True, verbose_name="Входной файл")
    output_file = models.FileField(upload_to='imports/output_file/', null=True, blank=True, verbose_name="Выходной файл")
    output_file_to_admin = models.FileField(upload_to='imports/output_file/', null=True, blank=True, verbose_name="Выходной файл для администратора")
    is_edit = models.BooleanField(verbose_name='Можно редактировать', default=True)

    def __str__(self):
        return str(self.title)


class ImportSNJStatusField(models.Model):
    import_parent = models.OneToOneField(Import, on_delete=models.CASCADE, verbose_name="Импорт")
    input_file_modify = models.TextField(null=True, blank=True, verbose_name="Переходный файл")
    input_file_modify_original = models.TextField(null=True, blank=True, verbose_name="Переходный исходный файл")
    office = models.BooleanField(verbose_name='Подразделения', default=False)
    post = models.BooleanField(verbose_name='Должности', default=False)
    fio = models.BooleanField(verbose_name='ФИО', default=False)
    reason = models.BooleanField(verbose_name='Причина пропуска', default=False)
    shift = models.BooleanField(verbose_name='Смена', default=False)
    date = models.BooleanField(verbose_name='Даты', default=False)
    comment = models.BooleanField(verbose_name='Комментарии', default=False)

