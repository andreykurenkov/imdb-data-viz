var createChart = function(container,data_source,chart_name,data_name,
                           x_log=false,binned=false,smooth=true, average=false) {
  var svg = dimple.newSvg(container, "100%", "100%");
  d3.tsv(data_source, function (data) {
    if(binned){
      var min_data = [];
      var key = 0;
      data.forEach(function(d) {
          var dataStr = d[data_name].substring(1,d[data_name].length-1);
          var minVal = +dataStr.split(", ")[0];

          var min = {};
          if(x_log)
            min[data_name] = Math.pow(minVal,10);
          else
            min[data_name] = minVal;
          min.percent = +d.count;
          min.key = key;
          if(!smooth)
            min_data.push(min);
          key+=1;

          var maxVal = +dataStr.split(", ")[1];
          if(average){
              if(x_log)
                d[data_name] = (Math.pow(minVal,10)+Math.pow(maxVal,10))/2;
              else
                d[data_name] = (minVal+maxVal)/2;
          } else {
              if(x_log)
                d[data_name] = Math.pow(maxVal,10);
              else
                d[data_name] = maxVal;
          }
          d.percent = +d.count;
          d.key = key;
          key+=1;
      });
      data=data.concat(min_data);
    } else {
      data.forEach(function(d) {
          d[data_name] = +d[data_name];
          d.percent = +d.count;
      });
    }
    console.log(data);

    //Create dimple chart
    var chart = new dimple.chart(svg);
    chart.setMargins("8%", "12%", "16%", "14%");

    //Make x axis
    var x_axis = chart.addMeasureAxis("x", data_name);
    if(x_log){
      x_axis.useLog = true;
      x_axis.overrideMin = 1;
    } else{
      x_axis.ticks = 20;
    }
    x_axis.overrideMin = data[0][data_name];
    //Make y axis
    var y_axis = chart.addMeasureAxis("y", "percent");
    y_axis.tickFormat = ".1%";
    y_axis.showPercent = true;

    var key_name = data_name;
    if(binned){
        key_name = "key";
    } else {
        //x_axis.showGridlines = false;
        //y_axis.showGridlines = false;
    }

    var series = chart.addSeries(key_name, dimple.plot.line);
    //series.lineMarkers = true;
    series.data = data;

    if(smooth)
      series.interpolation = "cardinal";
    else if(binned)
      series.interpolation = "step";

    series.lineWeight = 3;
    series.addOrderRule(key_name);
    if(binned){
      if(!smooth){
        series.getTooltipText = function (e) {
          if(e.aggField[0]%2==0)
            return [
                "bin lower bound: " + e.xValue,
                "Percent in this bin: %" + (e.y*100).toFixed(2)
            ];
          else
            return [
                "bin upper bound: " + e.xValue,
                "Percent in this bin: %" + (e.y*100).toFixed(2)
            ];
        };
      } else {
        series.oldTooltipText = series.getTooltipText;
        series.getTooltipText = function (e) {
          return series.oldTooltipText(e).slice(1,3);
        };
      }
    }

    //DRAW THE CHART!
    chart.draw();

    //Add title to chart
    svg.append("text")
     .attr("x", "50%")
     .attr("y", "5%")
     .style("text-anchor", "middle")
     .style("font-family", "sans-serif")
     .text(chart_name);
  });
};

var createBinChart = function(container,data_source,chart_name,data_name,
                              x_log=false,smooth=true, average=false){
    createChart(container,data_source,chart_name,data_name,x_log,true,smooth,average);
};

var createLineChart = function(container,data_source,chart_name,data_name,
                              x_log=false,smooth=true, average=false){
    createChart(container,data_source,chart_name,data_name,x_log,false,smooth,average);
};
