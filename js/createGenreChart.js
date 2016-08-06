var genres = ["Action","Animation","Comedy","Drama","Documentary","Romance"];
//Insert SVG before the toggle switch, make it fill container
var genre_svg = dimple.newSvg("#genreChartContainer", "100%", "100%");

/*Start on 1915 because prior too few movies are listed to make them a fair
comparison to modern times*/
var start_year = 1915;
/*End on 2013 due to a strange dive towards zero in 2014 and 2015 I cannot explain or
guarantee is not due to flawed data. At first I included the dip but received feedback it
is best to remove it to avoid confusion, and then removed it.*/
var end_year = 2013;
//Get from localhost, perhaps change to github later
var data_source = "http://localhost:8000/data/yearly_data.tsv";
var genre_chart_title = "IMDB Yearly Movie And Genre Counts (1915-2013)";
var legend_title = "Legend";

d3.tsv(data_source, function (year_data) {
  console.log(year_data)
  //filter out certain year ranges; explain at top
  year_data = year_data.filter(function(entry){return entry.year>=start_year
                                                      && entry.year<=end_year;});

  //Compute number of movies per year
  var count_data = year_data.map(function(entry){
    return {'Year':entry.year,
            'Count':entry.count};
  });

  //Compute flattened genre representations per year
  var genre_data = year_data.map(function(entry){//Trasform into flattened representation for dimple.js
    return genres.map(function(genre){
      return {'Year':entry.year,
              'Genre':genre,
              'Count':entry[genre]};
      });
    })
  .reduce(function(all_data,year_data){//Concat seperate list into a single list
    return all_data.concat(year_data);
   },[]);

  //Debugging log
  console.log(genre_data);
  console.log(count_data);

  //Create dimple chart
  var genre_chart = new dimple.chart(genre_svg);
  genre_chart.setMargins("8%", "12%", "16%", "14%");

  //Make x axis
  var x_axis = genre_chart.addTimeAxis("x", "Year");
  x_axis.timePeriod = d3.time.years;
  x_axis.timeInterval = 5;

  x_axis.tickFormat = "%Y";

  //Make y axis
  var y_axis = genre_chart.addMeasureAxis("y", "Count");
  y_axis.oldFormat = y_axis.tickFormat;
  y_axis.tickFormat = 'd';

  //Add first series, stacked genre area chart
  var genreSeries = genre_chart.addSeries("Genre", dimple.plot.area, [x_axis, y_axis]);
  genreSeries.data = genre_data;
  genreSeries.interpolation = "cardinal";

  //Add second series - black line for actual number of movies
  var c_axis = genre_chart.addColorAxis(null, "#000000");
  var countSeries = genre_chart.addSeries(null, dimple.plot.line, [x_axis, y_axis, c_axis]);
  countSeries.data = count_data;
  countSeries.interpolation = "cardinal";
  countSeries.lineWeight = 6;

  //Add legend to the right using negative values
  var legend = genre_chart.addLegend("-16%", "25%", "10%", "50%", "Right");
  legend.verticalPadding = 20;
  //Reverse legend listing to match chart order
  legend._getEntries_old = legend._getEntries;
  legend._getEntries = function()
  {
    entries = legend._getEntries_old.apply(this, arguments).reverse();
    //Rename the 'All' legend element to Total Movies
    entries[0].stroke = '#405869';
    entries[0].fill = '#405869';
    entries[0].key = 'Total Movies';
    return entries;
  }

  //DRAW THE CHART!
  genre_chart.draw();

  //Tried making total movies look dashed, did not like it
  //svg.selectAll("path.dimple-all").style("stroke-dasharray", "3");

  //Add title to chart
  genre_svg.append("text")
   .attr("x", "50%")
   .attr("y", "5%")
   .style("text-anchor", "middle")
   .style("font-family", "sans-serif")
   .text(length_chart_title);

  //Add title to legend
  genre_svg.selectAll("title_text")
    .data([legend_title])
    .enter()
    .append("text")
      .attr("x", "88%")
      .attr("y", "25%")
      .style("font-family", "sans-serif")
      .style("color", "Black")
      .text(function (d) { return d; });

  //Remove xxx5 years to make x axis less crowded
  var tickCounter = 1;
  x_axis.shapes.selectAll("text").each(function (d) {
    // Remove all but the nth label
    if (tickCounter % 2 !== 0) {
        this.remove();
    }
    tickCounter += 1;
  });

  //Setup interactivity in chart
  genre_chart.legends = [];//'Orphan' legend from chart
  var filterValues = genres;
  var displayingTotal = true;
  // Get all the rectangles from our now orphaned legend - based on dimple.js example code
  legend.shapes.selectAll("rect")
    .attr("cursor","pointer")
    .on("click", function (e) {
      var clickedOnText=e.aggField.slice(-1)[0];
      console.log('Clicked on '+clickedOnText);
      if('All'===clickedOnText){
        if(displayingCounts){
          if(displayingTotal){
            d3.select(this).style("opacity", 0.2);
            countSeries.data = [];
            genre_chart.draw(800);
            displayingTotal = false;
          } else {
            d3.select(this).style("opacity", 0.8);
            countSeries.data = count_data;
            genre_chart.draw(800);
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
        genre_chart.draw(800);
      }
  });

  //Setup toggling between counts and percents
  var displayingCounts = true;
  var form = document.querySelector("#genreToggleForm");
  form.addEventListener("change", function(event) {
    console.log("Toggling chart display!");
    y_axis.showPercent = displayingCounts;
    if(displayingCounts){
      y_axis.title = "Percent";
      y_axis.tickFormat = y_axis.oldFormat;
      countSeries.data = [];
      legend.shapes.select("rect")
        .filter(function (d, i) { return i === 0;})
        .style("opacity", 0)
        .attr("cursor", "pointer");
      legend.shapes[0][0].firstChild.textContent = "";
      console.log(legend);
    }else{
      y_axis.title = "Counts";
      y_axis.tickFormat = 'd';
      countSeries.data = count_data;
      legend.shapes.select("rect")
        .filter(function (d, i) { return i === 0;})
        .style("opacity", 0.8)
        .attr("cursor", "pointer");
      legend.shapes[0][0].firstChild.textContent = "Total Movies";
      console.log(legend);
    }
    displayingCounts = !displayingCounts;
    genre_chart.draw(2000);
  });

  /*Reset selection*/
  form.reset();

});
