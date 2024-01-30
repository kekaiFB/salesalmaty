
module_dir = os.path.dirname(__file__)  
file_path = os.path.join(module_dir, 'dataframe/vs.txt') 
data_file = open(file_path , 'r')       
data = str(data_file.read())

for data_list in data.split('\n'):
    data_list = data_list.split(';')
    if len(data_list) == 3:
        if data_list[0] != '' and data_list[1] != '' and data_list[2] != '':
            fleet_query = Fleet.objects.filter(title__icontains=data_list[2])
            if not fleet_query.exists():
                Fleet.objects.create(title=data_list[2], code_iata=data_list[1], code_ikao=data_list[0])
            else:
                fleet_query.update(code_iata=data_list[1], code_ikao=data_list[0], title =data_list[2])
                fleet_query.save()
    elif len(data_list) == 2:
        if data_list[0] != '' and data_list[1] != '':
            fleet_query = Fleet.objects.filter(title__icontains=data_list[1])
            if not fleet_query.exists():
                Fleet.objects.create(title=data_list[1], code_ikao=data_list[0])
            else:
                fleet_query.update(code_ikao=data_list[0], title =data_list[2])
                fleet_query.save()