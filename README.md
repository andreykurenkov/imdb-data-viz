# imdb-data-viz
This chart visualizes the number of genre movie releases between 1915 to 2014, as either
their absolute counts or percentage of releases, as well as the total number of movies in those years.
The data is gotten from IMDB with [this code](https://github.com/andreykurenkov/data-movies), and then
further post-processed with [D3](https://d3js.org/) and visualized with
[dimple.js](http://dimplejs.org/). The total number of genre movie releases may not be equal to
the number of movie releases, since a single movie may tagged with multiple genres or no genre
(for instance a movie can be both a Comedy and Romance), and the data does not include
incredibly obscure movies almost no one ever sees by filtering out movies with less than 10 IMDB votes.
The clear conclusion from this visualization is that there has been an explosion on film
production from the 90s onward, and beyond that there are a multitude of possible smaller
conclusions regarding the relative popularity of genres and movies overall over the last 90 years
with various interesting patterns such as the rise of the documentary starting from the 60s and
the decrease of the popularity of action movies past the 80s.  

