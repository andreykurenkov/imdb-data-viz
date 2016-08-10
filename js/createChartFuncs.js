function numberShortener (value) {
    if(value==0)
        return value.toPrecision(1);
    var suffixes = ["", "K", "M", "B"];
    var suffixNum = Math.floor(Math.log(value)/Math.log(1000));
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
}

//Handles creating a variety of charts that are based on displaying counts of something - see data_transform.py
var createCountsChart = function(container, //html div to put this in
                           data_source, //tsv or csv file to read from
                           is_data_binned, //whether data is in pandas binned-form
                           chart_name, //what to name the chart
                           data_name, //what the x field is called (y is assumed to be 'count')
                           x_log=false, //whether x axis should
                           x_name=null,//name for x_axis
                           chart_type='line', //type of chart. Can be line, step, or hist,
                           bin_handling=null, //if line chart what to do with bin bounds
                           interpolate_line=false) //whether to smooth out line data
                            {
  var svg = dimple.newSvg(container, "100%", "100%");
  d3.tsv(data_source, function (data) {
    console.log(data);
    var data_sum = 0;
    var count_dict = {};
    if(is_data_binned){
      var min_data = [];
      var key = 0;
      data.forEach(function(d) {//account for binned data format and various options
          var dataStr = d[data_name].substring(1,d[data_name].length-1);
          var minVal = +dataStr.split(", ")[0];
          var min = {};
          if(x_log)
            minVal = Math.pow(10,minVal);
          min[data_name] = minVal;
          min.percent = +d.count;
          min.key = key;
          if(chart_type==='step')
            min_data.push(min);
          key+=1;

          var maxVal = +dataStr.split(", ")[1];
          if(x_log)
            maxVal = Math.pow(10,maxVal);
          if(bin_handling==='average'){
              maxVal = (minVal+maxVal)/2;
          } else if (bin_handling==='max'){
              d[data_name] = maxVal;
          }
          d[data_name] = maxVal;
          if(chart_type==='hist'){
            minVal = numberShortener(minVal);
            maxVal = numberShortener(maxVal);
            d[data_name] = minVal+' - '+maxVal;
          }
          d.percent = +d.count;
          data_sum+=d.percent;
          d.key = key;
          key+=1;
          count_dict[d[data_name]]=d.count;
      });
      if(chart_type==='step')
        data = data.concat(min_data);
    } else {
      data.forEach(function(d) {//convert strings to numbers and get sum
          d[data_name] = +d[data_name];
          d.percent = +d.count;
          data_sum += d.percent;
          count_dict[d[data_name]]=d.count;
      });
    }


    if (chart_type==='hist'){//for inane reasons, change to percent for hist
      data.forEach(function(d) {
          d.percent = d.percent/data_sum;
      });
    }
    console.log(data);

    //Create dimple chart
    var chart = new dimple.chart(svg);
    chart.setMargins("8%", "12%", "16%", "16%");

    //Make x axis
    var x_axis;
    if(chart_type==='line')
      x_axis = chart.addMeasureAxis("x", data_name);
    else if(chart_type==='hist')
      x_axis = chart.addCategoryAxis("x", data_name);

    if(x_name)
      x_axis.title = x_name;

    if(x_log && chart_type!='hist'){
      x_axis.useLog = true;
      x_axis.overrideMin = 1;
    } else{
      x_axis.ticks = 20;
    }
    x_axis.addOrderRule("key");
    x_axis.overrideMin = data[0][data_name];
    //Make y axis
    var y_axis;
    if (chart_type==='hist')
      y_axis = chart.addMeasureAxis("y", "percent");
    else
      y_axis = chart.addPctAxis("y", "percent");
    y_axis.tickFormat = ".1%";

    var key_name = data_name;
    if(is_data_binned)
        key_name = "key";

    var series;
    if(chart_type==='line')
      series = chart.addSeries(key_name, dimple.plot.line);
    else if (chart_type==='hist')
      series = chart.addSeries(null, dimple.plot.bar);
    //series.lineMarkers = true;
    series.data = data;

    if(chart_type==='line' && interpolate_line)
      series.interpolation = "cardinal";
    else if(chart_type==='step')
      series.interpolation = "step";

    series.lineWeight = 3;
    series.addOrderRule(key_name);

    series.oldTooltipText = series.getTooltipText;
    if(is_data_binned){
      if(chart_type==='step'){
        series.getTooltipText = function (e) {
          if(e.aggField[0]%2==0)
            return [
                "bin lower bound - " + series.oldTooltipText(e)[1],
                "Percent in this bin: %" + (e.y*100).toFixed(2)
            ];
          else
            return [
                "bin upper bound - " + series.oldTooltipText(e)[1],
                "Percent in this bin: %" + (e.y*100).toFixed(2)
            ];
        };
      } else {
        series.getTooltipText = function (e) {
          var countKey = e.xValue;
          if(e.xValue===null)
            countKey = e.x;
          return series.oldTooltipText(e).slice(1,3).concat(["count: "+count_dict[countKey]]);
        };
      }
    } else {
      series.getTooltipText = function (e) {
        var countKey = e.xValue;
        if(e.xValue===null)
          countKey = e.x;
        return series.oldTooltipText(e).concat(["count: "+count_dict[countKey]]);
      };
    }

    if(chart_type==='hist'){
      series.afterDraw = function (shape, data) {
        // Get the shape as a d3 selection
        var s = d3.select(shape),
          rect = {
            x: parseFloat(s.attr("x")),
            y: parseFloat(s.attr("y")),
            width: parseFloat(s.attr("width")),
            height: parseFloat(s.attr("height"))
          };
        // Only label bars where the text can fit
        if (rect.height >= 20) {
          // Add a text label for the value
          svg.append("text")
            // Position in the centre of the shape (vertical position is
            // manually set due to cross-browser problems with baseline)
            .attr("x", rect.x + rect.width / 2)
            .attr("y", rect.y + 15)
            // Centre align
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-family", "sans-serif")
            .text(count_dict[data.xField[0]]);
        }
      };
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

var createLineChart = function(container,data_source,is_data_binned,chart_name,data_name,
                              x_log=false, x_name=null, bin_handling='average', interpolate_line=true){
    createCountsChart(container,data_source,is_data_binned,chart_name,data_name,x_log,x_name,'line',bin_handling,interpolate_line);
};

var createStepChart = function(container,data_source,is_data_binned,chart_name,data_name,
                              x_log=false,x_name=null){
    createCountsChart(container,data_source,is_data_binnedchart_name,data_name,x_log,x_name,'step');
};

var createHistChart = function(container,data_source,is_data_binned,chart_name,data_name,
                              x_log=false,x_name=null){
    createCountsChart(container,data_source,is_data_binned,chart_name,data_name,x_log,x_name,'hist');
};

var createGenreChart = function(container,data_source,chart_name, start_year,end_year){
    var genres = ["Action","Animation","Comedy","Drama","Documentary","Romance"];
    //Insert SVG before the toggle switch, make it fill container
    var genre_svg = dimple.newSvg(container, "100%", "100%");
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
      genre_chart.setMargins("10%", "12%", "16%", "14%");

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
       .text(chart_name);

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
  }
