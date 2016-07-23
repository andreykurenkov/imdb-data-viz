# imdb-data-viz
Playing with movie data and D3

## Summary
This chart visualizes the number of movies genre releases from 1915 to 2014, as either
their absolute counts or percentage of releases. The data is gotten from IMDB
with [this code](https://github.com/andreykurenkov/data-movies), and then
further post-processed with [D3](https://d3js.org/) and visualized with 
[dimple.js](http://dimplejs.org/). These are total counts of genre tags rather 
than movies, since a single movie may tagged as both a Comedy and Romance,
and some filtering is done to avoid counting incredibely obscure movies by not 
counting movies with less than  10 IMDB user votes. The visualization conveys an 
intentionally broad story about the relative popularity of genres and movies 
overall over the last 90 years, with various interesting patterns such as the 
rise of the documentary starting from the 60s and the decrease of the popularity 
of action movies pastthe 80s.  

## Design
https://newrepublic.com/article/107212/has-hollywood-murdered-the-movies
http://flavorwire.com/492985/how-the-death-of-mid-budget-cinema-left-a-generation-of-iconic-filmmakers-mia

## Feedback
Need to collect feedback, some questions:
    What do you notice in the visualization?
    What questions do you have about the data?
    What relationships do you notice?
    What do you think is the main takeaway from this visualization?
    Is there something you don’t understand in the graphic?

## Resources
