# imdb-data-viz
Playing with movie data and D3. The data is gotten from IMDB with [this code](https://github.com/andreykurenkov/data-movies),
and then further post-processed with [D3](https://d3js.org/) and visualized with
[dimple.js](http://dimplejs.org/).

## To Run
Execute 'python -m SimpleHTTPServer' in root directory, and navigate to 'http://localhost:8000/index3.html'
to see chart, or index2.html or index1.html for previous versions.

## Summary
This chart visualizes the number of genre movie releases between 1915 and 2013, as either
their absolute counts or percentage of releases, as well as the total number of movies in those years.
The clear conclusion from this visualization is that there has been an explosion in film
production from the 90s onward, and beyond that there are a multitude of possible smaller
conclusions regarding the relative popularity of genres and movies overall.  
The total number of genre movie releases may not be equal to the number of movie releases,
since a single movie may be tagged with multiple genres or no genre (for instance a movie can be both a Comedy and Romance),
and the data does not include incredibly obscure movies almost no one ever sees by filtering out movies with less than 10 IMDB votes.

## Design
My original inspiration to work with movie data came from [an article](
http://flavorwire.com/492985/how-the-death-of-mid-budget-cinema-left-a-generation-of-iconic-filmmakers-mia)
about how it was harder to finance mid-budget movies at present. However, as
I explored the IMDB data I found there were far fewer movies tagged with budget
information than genre information, so I decided to create a visualization that
conveyed the relative quantity of each genre of movie produced in the young history
of cinema. I wanted to convey the quantities as both a count and a percentage,
since counts convey the total number of movies produced and percentages make it
easier to compare relative numbers of each genre in periods in which fewer movies
were released. It was clear that a stacked area chart would best serve my intentions,
since it is designed for communicating the progression of multiple quantities over
a length of time and can elegantly transition between percentages and counts. From
there I just made sure to position, size, and color elements of the chart so it was clear.

The feedback I received from the first iteration of the chart was helpful in letting
me know several areas to focus on. Multiple people had a problem with the legend title
being wrongly positioned, so I adjusted the code to use entirely percent-based rather
than pixel-based sizing and positioning so as to make it more robust for different
people. The most significant critical feedback was that the stacked quality of the
chart made it difficult to compare the popularities of genres, and that it was not
obvious how many movies were produced in a given year since I visualized number of
genre tags without including a movie count. To address these concerns, I added a second
series ('Total Movies') to the chart to show the number of actual movie releases per year and made
the legend interactive so that different elements could be enabled or disabled. Drawing
the total number of movies as a line on top of the stacked area chart made a lot of sense
and worked well, and using the legend to add the interactive element likewise worked well.

The second set of iterations came after the first set of review comments on Udacity.
I agreed with most of these criticisms and so addressed them - it is clarified in the
code and text why 1915 and 2013 are chosen as cutoff years, the legend title is changed and
interactive components are explained in the text, the 'Total Movies' legend entry
dissapears entirely in percentage view, and the tick mark text is lessened. I could not
recolor the 'Total Movies' line to entirely black, but increased the size of it and felt
it is clear enough.

The feedback also helped me clarify the 'main conclusion' from the visualization,
which is that there has been a huge rise in the number of overall movies being made
since the 90s. I very much like that this aspect of the data is obvious, and yet with
further exploration different people are able to find additional interesting findings from
the data such as the dip in movie production during WW2, the increasing number of documentaries
being produced, how more comedy growing in volume, and more. Therefore this is a more open-ended
visualization with a big finding (that the number of movies being produced since the 90s has seemingly risen by a lot,
according to IMDB data) as well as many more smaller findings for the user to find
through exploration and interaction.

## Feedback
For data collection, a link to the first version of this visualization was sent
out over social media. The HTMl then included both the visualization and the
explanation of it as well as the feedback questions, since I would have had to
include the explanation and feedback in the request anyway.
These are the responses I got:

________
"Data is gotten" is poor phrasing. The "Legend" label appears inside the legend for me rather than above it.
I notice there was a movie-splosion at around 1995. Why? Has this increased the number of good movies per year or just decreased the portion of movies that are good?
Looks like animation was most popular in the old days. Disney?
Looks like documentaries have gotten more popular. Good to see us thinking.
Lol. Action was most popular in the 80s.
Oh, you covered some of this in the description.
Hmm. I don't get much of a main takeaway, instead a few little ones.
No, it's perfectly understandable.

_________
First - the words underneath (the explanatory paragraph) needs to be indented since it appears VERY near the left  portion of the screen.  Makes it hard to read.  Also - you left out a word  - movie may tagged  - should be "movie may be tagged."

As for what I notice - that there is a HUGE shift upward in volume starting in the 90's - but this may be due to your data source and the overlay with the internet and fresh movie reactions.  I think people are less inclined to go back and annotate older films to rate them - resulting in missing your graph due to the 10 vote threshold?  I wonder if that is the right threshold?  If you removed it, how different might the results appear?

It APPEARS a lot more movies are being made now, but the voting may be partly to blame?
I was surprised by the upswing in drama.  Pleased to see comedy continuing to grow in volume. 🙂
Animation/Legend label needs to be tweaked visually (wraps)
It makes sense to me.  Easy to understand WITH your explanatory text.  Now - why do we care?  Are you attempting to have us draw conclusions?

_________
I notice a dip at WW2. There's also a dip of 2006 - don't know why this would be the case. I notice Animation decreasing in  popularity from the 60s onwards, and Romance seems to generally decrease slightly.

I notice that the overall number of films increases a lot from 2000, and wonder whether this is related to the popularity of IMDB in that time. Perhaps the actual increase in film releases is exaggerated by the data, because films are more likely to be listed in IMDB if released after 2000. Alternatively could the recent increase be related to greater international coverage in recent years? Perhaps there are fewer non-English films listed pre-2000? It would be interesting to see a by-country breakdown.

I wonder whether the way we describe film genres over the years affects the data. For example in the early 20th century, did we describe films as "action films" or "documentaries"? I would be interested to see other genres too, like horror.

It would be interesting to see a visualization which shows information about films with multiple genre tags, or the overlap between genres. Currently the percentage visualization isn't "percentage of movies", it's "percentage of tags", a less intuitive quantity.

Main takeaway: that number of film releases has increased over time, especially since 2000, with a fairly consistent percentage breakdown by genre since the 70s.

The main problem with this graphic is that it's hard to assess the popularity of any one genre over time, unless it happens to be Drama which is at the bottom of the visualization. For example it's hard to accurately see the decline in action after the 80s or the rise of documentary from the 60s because you're trying to judge the varying distance between two . It would be useful to be able to click and drag the ordering of the genres for this reason.

## Resources
Various stackoverflow pages
[This guide to making a Toggle button with CSS](http://thestizmedia.com/radio-buttons-as-toggle-buttons-with-css/)
[This dimple.js example (as well as the docs)](http://dimplejs.org/examples_viewer.html?id=areas_horizontal_stacked)
[The dimple.js interactive legend example](http://dimplejs.org/advanced_examples_viewer.html?id=advanced_interactive_legends)
[Text with arrow discussion](http://stackoverflow.com/questions/21276642/d3-bar-chart-needs-to-add-arrow-and-text-in-particular-bar)
