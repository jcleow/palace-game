<!-- @format -->

# palace-game
Deployed on: https://palace-card-game.herokuapp.com/  
Portfolio: https://jcleow.github.io/portfolio/palace.html

Palace is a fun card game for 2 players. Players must play cards in a discard pile using ascending order, and the first player to run out of cards wins.

![](https://jcleow.github.io/portfolio/img/projects/palace/gameplay.png)

## Game Rules ## 
Refer to https://www.wikihow.com/Play-the-Palace-Card-Game

## Features ##
* Players can create game rooms and allows another player to join.
* Game state is almost constantly updated to reflect the moves of each player based on their turns.
* Invalid cards selected to play in-game will be labeled with a flashing red border.

## Technologies Used ##
* Frontend: HTML, CSS, Vanilla JS with DOM Manipulation
* Backend: Sequelize, PostgresQL,Express
* Version Control: Git

## Technical Features ##
* Implemented Sequelize ORM to manipulate and retrieve data from a PSQL database
* Integrated with Webpack to bundle and precompile front-end assets for faster performance
* Structured the app around the MVC framework to logically segregate visual, business and database components
