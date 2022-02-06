# PubHub

A web app for generating the most efficient pub crawl routes, using the Valhalla routing engine, written in React and Django, hosted on GCP & Netlify. 

![PubHub screenshot](https://user-images.githubusercontent.com/25514836/152678126-3d4e8c52-420b-403a-a191-fae21564854c.png)


## Inspiration
We were inspired by the wealth of open data provided by OpenStreetMap, and decided we wanted to create a web application that utilized this tool.

## What it does
The web app displays the shortest path between a series of pub and bars within a given area. This may be the currently viewed area or a polygon drawn out by the user. 

## How we built it
* Frontend built using React, Mapbox-GL and Bootstrap, hosted on Netlify, behind a domain.com domain name
* Overpass for querying OSM
* Self-hosted Valhalla instance for efficient OSM-based routing
* Django API for handling the complexities of parsing Valhalla query results

## Challenges we ran into
* Team members had minimal previous use of React, so had to learn during the hackathon
* Overpass has a very \*interesting\* query language that took some time to adopt and understand

## Accomplishments that we're proud of
* We were able to create a intuitive UI using React
* That we able to utilize a wide variety of tools & technologies to create a functioning application

## What we learned
* Learnt how to create a component-based UI using React
* How to make use of Reacts Context API to manage global state

## Team:

* Sean Escreet
* George Honeywood
* Samuel Sandoval
