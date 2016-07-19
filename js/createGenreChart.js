var genres = ["Action","Animation","Comedy","Drama","Documentary","Romance"];
var svg = dimple.newSvg("#chartContainer", 700, 430);

d3.tsv("./data/movies.tsv", function (data) {
  //Create dimple.js-compatible data representation
  var genre_data= d3.nest()
  .key(function(d) { return parseInt(d.year);}).sortKeys(d3.ascending)//gooup by year
  .rollup(function(d) { return genres.reduce(//rollup sums of genre per year
    function(store,genre){
      store[genre] = d3.sum(d, function(line) {
        return line[genre];
      });
      return store;
    },{});
  })
  .entries(data)//compute from .tsv data
  .filter(function(entry){return entry['key']>=1915 && entry['key']<2014;})//filter out certain year ranges
  .map(function(entry){//Trabsfirn into flattened representation for dimple.js
    return genres.map(function(genre){
      return {'Year':entry.key,
              'Genre':genre,
              'Count':entry.values[genre]};
      });
    })
  .reduce(function(all_data,year_data){//Concat seperate list into a single list
    return all_data.concat(year_data);
   },[]);

//Debugging log
console.log(genre_data);
window.genre_data = genre_data;
//Create dimple chart
var chart = new dimple.chart(svg, genre_data);
window.chart = chart;//Make global for display toggling
chart.setBounds(60, 50, 525, 325);

var x_axis = chart.addTimeAxis("x", "Year");
x_axis.timePeriod = d3.time.years;
x_axis.timeInterval = 5;
x_axis.tickFormat = "%Y";
window.x_axis = x_axis;
var y_axis = chart.addMeasureAxis("y", "Count");
window.y_axis = y_axis;//Make global for display toggling
var series = chart.addSeries("Genre", dimple.plot.area);
series.interpolation = "cardinal";

//Add legend
var legend = chart.addLegend(600, 100, 100, 200, "Right");
legend.verticalPadding = 20;


//Reverse legend listing to match chart order
legend._getEntries_old = legend._getEntries;
legend._getEntries = function()
{
// but call the original version,
// then sort the returned array before returning it.
  return legend._getEntries_old.apply(this, arguments).reverse();
}
/*var story = chart.setStoryboard("Decade");
story.addOrderRule("Year");*/
chart.draw();

//Add title to legend
svg.selectAll("title_text")
  .data(["Legend"])
  .enter()
  .append("text")
    .attr("x", 610)
    .attr("y", 115)
    .style("font-family", "sans-serif")
    .style("font-size", "10px")
    .style("color", "Black")
    .text(function (d) { return d; });

svg.append("text")
 .attr("x", 325)
 .attr("y", 25)
 .style("text-anchor", "middle")
 .style("font-family", "sans-serif")
 .text("Movie Releases By Genre Over Time");
});

window.displayingCounts = true;//Make global for display toggling

//Simple display toggle function!
function toggleChartDisplay(){
  /*window.x_axis.overrideMin = d3.time.format("%Y").parse("1920");*/
  window.y_axis.showPercent = window.displayingCounts;
  if(window.displayingCounts){
    window.y_axis.title = "Counts";
  }else{
    window.y_axis.title = "Percent";
  }
  window.displayingCounts = !window.displayingCounts;
  window.chart.draw(4000);
}
