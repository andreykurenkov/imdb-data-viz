var length_svg = dimple.newSvg("#lengthChartContainer", "100%", "100%");

var data_source = "http://localhost:8000/data/length_data.tsv";
var length_chart_title = "IMDB Recent Movie Length Distribution";

d3.tsv(data_source, function (length_data) {
  length_data.forEach(function(d) {
    var lengthStr = d.length.substring(0,d.length.length-1);
    d.length = +lengthStr.split(", ")[1];
    d.count = +d.count;
  });
  length_data.unshift({'length':0,'count':0});
  console.log(length_data)

  //Create dimple chart
  var length_chart = new dimple.chart(length_svg);
  length_chart.setMargins("8%", "12%", "16%", "14%");

  //Make x axis
  var x_axis = length_chart.addMeasureAxis("x", "length");
  x_axis.ticks = 40;
  //Make y axis
  var y_axis = length_chart.addMeasureAxis("y", "count");
  y_axis.title = "percent";
  y_axis.tickFormat = ".1%";
  y_axis.showPercent = true;

  var series = length_chart.addSeries("length", dimple.plot.line);
  series.data = length_data;
  series.interpolation = "step";
  series.lineWeight = 3;

  //DRAW THE CHART!
  length_chart.draw();

  //Add title to chart
  length_svg.append("text")
   .attr("x", "50%")
   .attr("y", "5%")
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .text(length_chart_title);
});
