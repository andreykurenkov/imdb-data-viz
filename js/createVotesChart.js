var votes_svg = dimple.newSvg("#votesChartContainer", "100%", "100%");

var data_source = "http://localhost:8000/data/votes_data.tsv";
var votes_chart_title = "IMDB Recent Movie Vote # Distribution";

d3.tsv(data_source, function (votes_data) {
  var first=true;
  var firstMin = {};
  votes_data.forEach(function(d) {
  var votesStr = d.votes.substring(1,d.votes.length-1);
    if(first){
      firstMin.votes = Math.pow(+votesStr.split(", ")[0],10);
      firstMin.count = +d.count;
      first = false;
    }
    d.votes = Math.pow(+votesStr.split(", ")[1],10);
    d.count = +d.count;
  });
  votes_data.unshift(firstMin);
  console.log(votes_data)

  //Create dimple chart
  var votes_chart = new dimple.chart(votes_svg);
  votes_chart.setMargins("8%", "12%", "16%", "14%");

  //Make x axis
  var x_axis = votes_chart.addMeasureAxis("x", "votes");
  x_axis.useLog = true;
  x_axis.overrideMin = 1;
  //Make y axis
  var y_axis = votes_chart.addMeasureAxis("y", "count");
  y_axis.title = "percent";
  y_axis.tickFormat = ".1%";
  y_axis.showPercent = true;

  var series = votes_chart.addSeries("votes", dimple.plot.line);
  series.data = votes_data;
  series.interpolation = "step";
  series.lineWeight = 3;

  //DRAW THE CHART!
  votes_chart.draw();

  //Add title to chart
  votes_svg.append("text")
   .attr("x", "50%")
   .attr("y", "5%")
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .text(votes_chart_title);
});
