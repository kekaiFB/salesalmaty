function parseDates_to_yyyymmdd(data, toMoment=true, format_date='YYYY-MM-DD') {
    const datePattern = /(\d{2})[-./](\d{2})[-./](\d{4})|(\d{4})[-./](\d{2})[-./](\d{2})/g;
    if (data !== undefined && data.length !== 0) {
        if (moment.isMoment(data)) {
            // Если data - это объект Moment.js, вернуть его без изменений
            return data;
        }

        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                // Предположим, что data[i] - это строка, представляющая дату
                // Проверяем различные форматы и преобразуем их в 'YYYY-MM-DD'
                var formatted_date = data[i].replace(datePattern, '$3-$2-$1');

                // Преобразование строк в объекты Date
                if (toMoment)
                {
                    data[i] = moment(formatted_date, format_date, true);
                } else {
                    data[i] = formatted_date; 
                }
            }
            return data;
        } else {
            // Предположим, что data - это строка, представляющая дату
            // Проверяем различные форматы и преобразуем их в 'YYYY-MM-DD'
            var formatted_date = data.replace(datePattern, '$3-$2-$1');

            // Преобразование строк в объект Date
            if (toMoment)
            {
                var date_ISO = moment(formatted_date, format_date, true);
            } else {
                var date_ISO = formatted_date;
            }
            return date_ISO;
        }
    } else {
        if (Array.isArray(data)) {
            return [];
        } else {
            return '';
        }
    }
}
