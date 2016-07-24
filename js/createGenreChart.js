var genres = ["Action","Animation","Comedy","Drama","Documentary","Romance"];
var svg = d3.select("#chartContainer")
            .insert("svg",":first-child")
            .attr("width", "100%")
            .attr("height", "100%");

d3.tsv("http://localhost:8000/data/movies.tsv", function (data) {
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

//Create dimple chart
var chart = new dimple.chart(svg);
chart.setMargins("8%", "12%", "15%", "12%");

//Make x axis
var x_axis = chart.addTimeAxis("x", "Year");
x_axis.timePeriod = d3.time.years;
x_axis.timeInterval = 5;
x_axis.tickFormat = "%Y";

//Make y axis
var y_axis = chart.addMeasureAxis("y", "Count");
y_axis.oldFormat = y_axis.tickFormat;
y_axis.tickFormat = 'd';

//Add first series, stacked genre area chart
var genreSeries = chart.addSeries("Genre", dimple.plot.area, [x_axis, y_axis]);
genreSeries.data = genre_data;
genreSeries.interpolation = "cardinal";

//Add second series - black line for actual number of movies
var c_axis = chart.addColorAxis(null, "black");
var countSeries = chart.addSeries(null, dimple.plot.line, [x_axis, y_axis, c_axis]);
countSeries.data = count_data;
countSeries.interpolation = "cardinal";
countSeries.lineWeight = 5;

//Add legend to the right using negative values
var legend = chart.addLegend("-8%", "25%", "10%", "40%", "Right");
legend.verticalPadding = 10;
//Reverse legend listing to match chart order
legend._getEntries_old = legend._getEntries;
legend._getEntries = function()
{
  entries = legend._getEntries_old.apply(this, arguments).reverse();
  entries[0].stroke = '#405869';
  entries[0].fill = '#405869';
  entries[0].key = 'Total Movies';
  return entries;
}

//DRAW THE CHART!
chart.draw();

//Add title to chart
svg.append("text")
 .attr("x", "50%")
 .attr("y", "5%")
 .style("text-anchor", "middle")
 .style("font-family", "sans-serif")
 .text("Movie Releases Between 1915 And 2014");

//Add title to legend
svg.selectAll("title_text")
  .data(["Interactive Legend"])
  .enter()
  .append("text")
    .attr("x", "86.5%")
    .attr("y", "27%")
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .style("color", "Black")
    .text(function (d) { return d; });

//Setup interactivity in chart
chart.legends = [];//'Orphan' legend from chart
var filterValues = genres;
var displayingTotal = true;
// Get all the rectangles from our now orphaned legend
legend.shapes.selectAll("rect").on("click", function (e) {
  var clickedOnText=e.aggField.slice(-1)[0];
  console.log('Clicked on '+clickedOnText);
  if('All'===clickedOnText){
    if(displayingCounts){
      if(displayingTotal){
        d3.select(this).style("opacity", 0.2);
        countSeries.data = [];
        chart.draw(800);
        displayingTotal = false;
      } else {
        d3.select(this).style("opacity", 0.8);
        countSeries.data = count_data;
        chart.draw(800);
        displayingTotal = true;
      }
    }
  } else {
    // This indicates whether the item is already visible or not
    var hide = false;
    var newFilters = [];
    // If the filters contain the clicked shape hide it
    filterValues.forEach(function (f) {
      if (f === e.aggField.slice(-1)[0]) {
        hide = true;
      } else {
        newFilters.push(f);
      }
    });
    // Hide the shape or show it
    if (hide) {
      d3.select(this).style("opacity", 0.2);
    } else {
      newFilters.push(e.aggField.slice(-1)[0]);
      d3.select(this).style("opacity", 0.8);
    }
    // Update the filters
    filterValues = newFilters;
    // Filter the data
    genreSeries.data = dimple.filterData(genre_data, "Genre", filterValues);
    chart.draw(800);
  }
});

//Setup toggling between counts and percents
var displayingCounts = true;
var form = document.querySelector("form");
form.addEventListener("change", function(event) {
  console.log("Toggling chart display!");
  y_axis.showPercent = displayingCounts;
  if(displayingCounts){
    y_axis.title = "Percent";
    y_axis.tickFormat = y_axis.oldFormat;
    countSeries.data = [];
    legend.shapes.select("rect")
      .filter(function (d, i) { return i === 0;})
      .style("opacity", 0.2);
  }else{
    y_axis.title = "Counts";
    y_axis.tickFormat = 'd';
    countSeries.data = count_data;
    legend.shapes.select("rect")
      .filter(function (d, i) { return i === 0;})
      .style("opacity", 0.8);
  }
  displayingCounts = !displayingCounts;
  chart.draw(2000);
});

/*Reset selection*/
form.reset();

});
