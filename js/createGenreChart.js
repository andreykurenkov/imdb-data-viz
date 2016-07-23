var genres = ["Action","Animation","Comedy","Drama","Documentary","Romance"];
var svg = dimple.newSvg("#chartContainer", 740, 430);

d3.tsv("./data/movies.tsv", function (data) {
  //Create year-aggregated data
  var year_data= d3.nest()
  .key(function(d) { return parseInt(d.year);}).sortKeys(d3.ascending)//group by year
  .rollup(function(d) { return genres.reduce(//rollup sums of genre per year
    function(store,genre){//create dictionary with count and each genre for each year
      store[genre] = d3.sum(d, function(line) {
        return line[genre];
      });
      return store;
    },{'count':d.length});
  })
  .entries(data)//compute from .tsv data
  .filter(function(entry){return entry['key']>=1915 && entry['key']<2014;});//filter out certain year ranges

  //Compute number of movies per year
  var count_data = year_data.map(function(entry){
      return {'Year':entry.key,
              'Count':entry.values['count']};
    });

  //Compute flattened genre representations per year
  var genre_data = year_data.map(function(entry){//Trasform into flattened representation for dimple.js
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
console.log(count_data);
window.genre_data = genre_data;
window.count_data = count_data;
//Create dimple chart
var chart = new dimple.chart(svg);
window.chart = chart;//Make global for display toggling
chart.setBounds(60, 50, 525, 325);

var x_axis = chart.addTimeAxis("x", "Year");
x_axis.timePeriod = d3.time.years;
x_axis.timeInterval = 5;
x_axis.tickFormat = "%Y";
window.x_axis = x_axis;
var y_axis = chart.addMeasureAxis("y", "Count");
window.y_axis = y_axis;//Make global for display toggling
var genreSeries = chart.addSeries("Genre", dimple.plot.area, [x_axis, y_axis]);
genreSeries.data = genre_data;
genreSeries.interpolation = "cardinal";

var c_axis = chart.addColorAxis(null, "black");
var countSeries = chart.addSeries(null, dimple.plot.line, [x_axis, y_axis, c_axis]);
countSeries.data = count_data;
countSeries.interpolation = "cardinal";
countSeries.lineWeight = 5;

window.countSeries = countSeries;//Make global for display toggling

//Add legend
var legend = chart.addLegend(605, 100, 100, 200, "Right");
legend.verticalPadding = 15;

//Reverse legend listing to match chart order
legend._getEntries_old = legend._getEntries;
legend._getEntries = function()
{
// but call the original version,
// then sort the returned array before returning it.
  entries = legend._getEntries_old.apply(this, arguments).reverse();
  if(window.displayingCounts){
    entries[0].stroke = '#405869';
    entries[0].fill = '#405869';
    entries[0].key = 'Total Movies';
  } else{
    entries.remove(0);
  }
  return entries;
}
/*var story = chart.setStoryboard("Decade");
story.addOrderRule("Year");*/
chart.draw();

//Add title to legend
svg.selectAll("title_text")
  .data(["Legend"])
  .enter()
  .append("text")
    .attr("x", 625)
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
    window.countSeries.data = [];
  }else{
    window.y_axis.title = "Percent";
    window.countSeries.data = window.count_data;
  }
  window.displayingCounts = !window.displayingCounts;
  window.chart.draw(4000);
}
