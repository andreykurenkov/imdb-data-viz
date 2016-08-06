var rating_svg = dimple.newSvg("#ratingChartContainer", "100%", "100%");

var data_source = "http://localhost:8000/data/rating_data.tsv";
var rating_chart_title = "IMDB Recent Movie Rating Distribution";

d3.tsv(data_source, function (rating_data) {
  rating_data.forEach(function(d) {
    d.rating = +d.rating;
    d.count = +d.count;
  });
  rating_data.unshift({'rating':0,'count':0});
  console.log(rating_data)

  //Create dimple chart
  var rating_chart = new dimple.chart(rating_svg);
  rating_chart.setMargins("8%", "12%", "16%", "14%");

  //Make x axis
  var x_axis = rating_chart.addMeasureAxis("x", "rating");
  x_axis.ticks = 20;
  //Make y axis
  var y_axis = rating_chart.addMeasureAxis("y", "count");
  y_axis.title = "percent";
  y_axis.tickFormat = ".1%";
  y_axis.showPercent = true;

  var series = rating_chart.addSeries("rating", dimple.plot.line);
  series.data = rating_data;
  series.interpolation = "step";
  series.lineWeight = 3;

  //DRAW THE CHART!
  rating_chart.draw();

  //Add title to chart
  rating_svg.append("text")
   .attr("x", "50%")
   .attr("y", "5%")
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .text(rating_chart_title);
});
