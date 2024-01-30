const ChartjsPluginSorting = {
  id: 'sorting',
  afterDraw: ((chart, args, plugin) => {
  let container = document.querySelector('.chartjs-plugin-sorting-container');

    if (container === null) {
      // Create the container element and append the canvas to it
      container = document.createElement('div');
      container.classList.add('chartjs-plugin-sorting-container');
      container.style.position = 'relative';
      container.style.display = 'flex';
      container.style.paddingTop = plugin.container?.padding?.top ?? '10px';
      chart.canvas.parentNode.insertBefore(container, chart.canvas);
      container.appendChild(chart.canvas);

      const buttonAsc = document.createElement('button');
      buttonAsc.classList = plugin.asc?.button?.class ?? 'btn-success rounded';
      buttonAsc.innerText = plugin.asc?.button?.label ?? 'Возрастание';
      buttonAsc.style.display = plugin.asc?.button?.display ?? true;
      buttonAsc.style.position = 'absolute';
      buttonAsc.style.top = (typeof plugin.asc?.button?.topPosition !== 'undefined') ? `${plugin.asc.button.topPosition}px` : '10px';
      buttonAsc.style.right = (typeof plugin.asc?.button?.rightPosition !== 'undefined') ? `${plugin.asc.button.rightPosition}px` : '19%';

      container.appendChild(buttonAsc);

      const buttonDesc = document.createElement('button');
      buttonDesc.classList = plugin.desc?.button?.class ?? 'btn-success rounded';
      buttonDesc.innerText = plugin.desc?.button?.label ?? 'Убывание';
      buttonDesc.style.display = plugin.desc?.button?.display ?? true;
      buttonDesc.style.position = 'absolute';
      buttonDesc.style.top = (typeof plugin.desc?.button?.topPosition !== 'undefined') ? `${plugin.desc.button.topPosition}px` : '10px';
      buttonDesc.style.right = (typeof plugin.desc?.button?.rightPosition !== 'undefined') ? `${plugin.desc.button.rightPosition}px` : '8%';
      container.appendChild(buttonDesc);

      const buttonReset = document.createElement('button');
      buttonReset.classList = plugin.reset?.button?.class ?? 'btn-success rounded';
      buttonReset.innerText = plugin.reset?.button?.label ?? 'Сброс';
      buttonReset.style.display = plugin.reset?.button?.display ?? true;
      buttonReset.style.position = 'absolute';
      buttonReset.style.top = (typeof plugin.reset?.button?.topPosition !== 'undefined') ? `${plugin.reset.button.topPosition}px` : '10px';
      buttonReset.style.right = (typeof plugin.reset?.button?.rightPosition !== 'undefined') ? `${plugin.reset.button.rightPosition}px` : '0%';

      container.appendChild(buttonReset);

      // Add a click event listener to the button
      buttonAsc.addEventListener('click', () => {
        sortChartData(chart, (a, b) => a.data - b.data);
      });

      // Add a click event listener to the button
      buttonDesc.addEventListener('click', () => {
        sortChartData(chart, (a, b) => b.data - a.data);
      });

      // Add a click event listener to the reset button
      buttonReset.addEventListener('click', () => {
        resetChartData(chart);
      });

      // Save a copy of the original data for resetting later
      chart.originalData = []
      
      for (var i=0; i<chart.data.datasets.length; i++)
      {
        chart.originalData[i] = {
          datasets: [{ data: [...chart.data.datasets[i].data], borderColor: [...chart.data.datasets[i].borderColor], backgroundColor: [...chart.data.datasets[i].backgroundColor] }],
          labels: [...chart.data.labels]
        };
      }
     
    }

    const sortChartData = (chart, sortFunc) => {
      
      resetChartData(chart);
      
      var dataIndexVis = []
      for (var i=0; i<chart.data.datasets.length; i++)
      {
        if (chart.getDatasetMeta(i).visible)
        {
          dataIndexVis.push(i)
        }
      }

      var chartData = []

      for (var i=0; i<dataIndexVis.length; i++)
      {
        for (var j=0; j<chart.data.datasets[0].data.length; j++)
        {   
          if(i==0){
             chartData[j] = chart.data.datasets[dataIndexVis[i]].data[j]
          } else {
            chartData[j] += chart.data.datasets[dataIndexVis[i]].data[j]
          }
         
        }
      }

      var chartLabels = chart.data.labels;

      var chartDataArray = chartData.map((dataPoint, index) => ({
        data: dataPoint,
        label: chartLabels[index],
      }));


      chartDataArray.sort(sortFunc);


      const sortedChartData = chartDataArray.map(dataObj => dataObj.data);
      const sortedChartLabels = chartDataArray.map(dataObj => dataObj.label);


      
      var originalLabels = chart.data.labels;
      var count_datasets = chart.data.datasets.length;
    
      var datasets = []
      //Датасеты должны быть равны по размеру!!!!

      //Проходим по каждамоу из датасетов
      for (var i=0; i<count_datasets; i++)
      {
        var datasets = []
        //Проходим по всем объектам датасетов
        for (var j=0; j<originalLabels.length; j++)
        {
          // суть такая, берем значение из отсортированного датасета, и ищем индекс такого же элемента в оригинальном
          var index = originalLabels.indexOf(sortedChartLabels[j])

          // заполняем значение датасета, значением из оригинального, то есть значения те же, а последовательность индексов разная
          datasets.push(chart.data.datasets[i].data[index])
        }
        chart.data.datasets[i].data = datasets
      }
        
       
     
      chart.data.labels = sortedChartLabels;

      chart.update();
      chart.resize();
    }

    const resetChartData = (chart) => {

      for (var i=0; i<chart.data.datasets.length; i++)
      {
        const originalChartData = chart.originalData[i].datasets[0].data;
        const originalChartLabels = chart.originalData[i].labels;
  
        // Update the chart with the original data, labels, and colors
        chart.data.datasets[i].data = originalChartData;
        chart.data.labels = originalChartLabels;
      }

     
      
      chart.update();
      chart.resize();
    };
  })
};
