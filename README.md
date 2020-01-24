# Intro: The 'stack'

A website is made available 'online' by a computer called a server, through the use of a software application called a server (confusing, I know). When building a web app, we need the server (computer) to run additional software.

A 'stack' is the selection of software and frameworks a web app relies on to run, usually these include:
  * The server computer's operating system, Windows, Mac, or (almost always) Linux
  * An HTTP server like Apache or NGINX (the software that makes the web site/app available to browsers)
  * A server-side language like PHP, Node.js, Python, Ruby, Java, or C#
  * A web-app framework for the specific language like Express for Node.js, or Laravel for PHP
  * A database system like MySQL/MariaDB, PostgreSQL, MongoDB, or SQLite
  * A front-end JavaScript framework like React, Vue, or Angular
  * Possibly a CSS framework like Bootstrap, Bulma, or MaterializeCSS

If we are just beginning the transition from web sites to web apps, I will recommend the following because they require the least setup and configuration while still being fully production-ready (useable on a professional-level website) choices:
  * Node.js: JavaScript that runs on the server rather than in the browser. Very popular and lots of high-quality related tools and libraries. Serves as HTTP server (at least until it's time to put the app on a real server online).
  * Express framework: The most popular web-app framework for Node.js.
  * MariaDB database: A free and open-source version of MySQL, a very popular choice while still being fairly simple to install/configure.

We won't cover front-end JavaScript frameworks or CSS frameworks. This guide assumes you have an existing website, and re-working it in a modern front-end framework, while likely marginally beneficial, would take time and introduces an additional layer of complexity we don't need to deal with at present. Use of code version control systems such as git will also not be covered.

This guide assumes use of Microsoft Windows. All of the stack technologies are cross-platform, but some of the installation methods will vary greatly between operating systems. Also, HeidiSQL (referenced later in this guide), is a Windows-only tool. For other systems, try DBeaver or MySQL Workbench. The concepts are the same, but HeidiSQL is the simplest. 

# Step 1: Define data schema

If you aren't familiar with database software, a database is similar to a spreadsheet (like Excel), with one major difference. Once you define the columns of a database, they are difficult to change and they control what kind of data can be placed within. The definition of these columns and the type of data they can hold is known as schema.

Before we get into the technical implementations, let's take a look at data. Web apps have no form or purpose without data. The more clearly defined the data is, the easier the app is to build. Schema is a word used to mean the defined type and structure of data to be stored.

It can be helpful to start with a 'user story', a description of what the user will do with the app. Let's take a simple blogging app for example:
> The blog owner logs in, creates a post, writes the content, then publishes it.

Let's try to identify the 'objects' in this app. Objects will be people who use the app and things they interact with, but not actions they take. So:
  * _The blog owner_: a person -- object
  * _logs in, creates_: actions -- not objects
  * _a post_: object
  * _writes_: action -- not object
  * _the content_: This one is tricky, usually if two things relate exactly one-to-one they are not separate objects. So if each post must have exactly one content item (in this case, some HTML), then content is a property of post. We'll get to that later.
    > A property is a named data value that is part of an object. For example, a person is an object with properties like 'hair color', 'eye color', and 'height'. These properties have values like 'black', 'brown', and '5 feet, 9 inches'. HTML elements have properties we often refer to as 'attributes'.
  * _then publishes it_: action -- not object

Next we explore whether any of our objects can be combined into a more abstract concept and still be useful. For example, if this blog were to allow comments, then those users would need to log in just like the blog owner, but they would have different permissions. You could combine a commenter and a blog owner into a more abstract 'user' because they share similar information like name, email, password, and probably more.

So we have two objects (in a relational database these are called tables):
  * user (tables should be lower case and singular, not plural)
  * post

Now we can flesh out what information (properties, also called 'fields', or 'columns') belongs to each object:
  * user
    * first_name (fields should not be capitalized or contain spaces or punctuation)
    * last_name
    * email
    * password
  * post
    * title (blog posts need titles)
    * content

In addition, every table should always include these three fields:
  * _id_: a unique number to identify the specific object (e.g. post #36)
  * _created_at_: a timestamp of when the specific object was created (e.g. user was created '2020-01-17 11:13:24')
  * _updated_at_: a timestamp of when any of the fields for this object were edited

Your database software will set values for each of these fields automatically. You may never use the timestamp fields, but they are extremely easy to add and, speaking from experience, you will most likely use them at some point.

We'll be using the database software MariaDB. MariaDB is a modified version of another software called MySQL. The two are so similar, many of the tools that work with one also work with the other. Anywhere in this guide that you see 'MySQL', know that it's a tool that also works with MariaDB.

MariaDB is a 'relational' database which means that objects stored in different tables can contain references to each other, making it possible to easily find related data. For example, I may want to find `all posts published by user #1`. Relational databases use a 'query' language. That is, a special set of words and function to search for and retrieve data stored in the database.

The language used by MariaDB is SQL (Structured Query Language). SQL is fairly easy to begin learning, and its use is incredibly widespread. It includes many functions for formatting and transforming data. If you are a spreadsheets power-user, you may be familiar with many similar or identical functions. Even for beginners, SQL is approachable and fun.

Finally, because we are using a relational database, we will describe how objects are related to each other. In this case, a post belongs to the user who wrote it, so:
  * user
    * id
    * created_at
    * updated_at
    * first_name
    * last_name
    * email
    * password
  * post
    * id
    * created_at
    * updated_at
    * content
    * __user_id__: (this will store the value of 'id' for the user that created this post)

This kind of relationship is called one-to-many. One user can have many posts, each of the many posts belongs to only one user. In this kind of relationship, the many reference the one. That's why _post_ holds a reference to _user_id_, but not the other way around.

# Step #3: Implement data schema

Now that you have the structure of your app's data (schema) defined and organized, it's time to create an actual database to accommodate and enforce that structure.

Summary:
  * Open the browser and go to `https://mariadb.org/download/`
  * Follow the link `Download MariaDb Server`
  * Choose the `Stable` version.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (8).png">
  * Click the download link for the MSI (Windows Installer) package that matches your Windows system, save the file, then run it when download completes.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (10).png">
  * Click next until you reach the page for `Default Instance Properties`
  * Set a password, and check the box next to `Use UTF8 as default server's character set`, then continue to click next and install.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (21).png">
    > 'UTF-8' or 'UTF8' is a way of storing text content. It is capable of representing every character in 'Unicode' (basically every character ever, including emoji).
  * Open `MySQL Client` from the start menu and enter your password.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (32).png">
  * If your password is correct and you get a prompt like `MariaDB [(none)]>`, then everything is working. Run the `exit` command twice.
  * Open `HeidiSQL`. Create a new session, and name it `local` so you know it connects to the database server on your own (local) computer. Enter the password in the corresponding field, then save and open the session.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (45).png">
  * Create a new database named for your web app, and select the collation `utf8mb4_unicode_ci`.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (49).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (54).png">
  * Select the new database and create a new table for your first object. Name the table with the lowercase singular form of your object (like 'user' for a table that holds users).
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (61).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (63).png">
  * Add an `id` column that is an non-null unsigned integer which defaults to `auto_increment`. Create a primary index on the `id` column.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (64).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (77).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (80).png">
    > 'Null' is used in computer fields to mean 'no value', so non-null means there must be a value. 'Unsigned' means a number with no negative sign or positive sign, which basically means the number can only be positive. 'Increment' means adding to a number, so auto-increment automatically adds 1 to the number from the previous record in the table (first user's id is 1, next is 2, and so on).
  * Add a `created_at` column that is a non-null timestamp which defaults to `current_timestamp()`
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (94).png">
    > A timestamp is common in programming. It includes the date and time to the second, and it doesn't depend on a specific timezone.
  * Add a `updated_at` column which is a duplicate of `created_at`, but additionally has an 'on update' value of `current_timestamp()`
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (100).png">
  * Save the table and duplicate it for as many objects as you have, naming each according to its object.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (102).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (107).png">
  * Continue to add the columns particular to each object, considering the best datatype for each.
    > You can [read more about data types here](https://dev.mysql.com/doc/refman/8.0/en/data-types.html).
  * Remember to define `unique` indexes on columns that should have no duplicate values.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (188).png">
  * Add foreign keys on tables for objects that should be related. I recommend setting the 'on update' of foreign keys to `cascade`.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (162).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (164).png">
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (177).png">
  * With your tables saved, open `MySQL Client` and enter your password.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (201).png">
  * Run command: `show databases;` to list your databases. Make sure your new database is listed.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (203).png">
  * Run command: `use [database name];` to select your new database.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (205).png">
  * Run command: `describe [table name];` to confirm the structure of your tables.
    <img src="./03-CreatingTheDatabase/images/CreatingTheDatabase (209).png">
    > These commands are SQL statements. [Learn SQL here](https://sqlzoo.net/).

# Step #4: Install Node.js and related tools

Node.js will act as our development HTTP server and our server-side programming language. If you know some in-browser JavaScript already, then Node.js will be familiar. Node.js is something of an ecosystem, with tools and packages being extremely simple to install using commands that come with your Node.js installation.

Summary:
  * Open your browser and go to `https://nodejs.org`
  * Choose the `LTS` version, save and run the installer.
    > LTS stands for Long-Term Support. This means that the version will continue to be in use for a longer period of time and will continue to get updates and fixes.
  * Click next until you reach the page for `Tools for Native Modules`
  * Check the box next to `Automatically install the necessary tools.`
    <img src="./04-InstallingNodeJS/images/InstallingNodeJS (10).png">
  * Continue to click next, install, finish. When prompted to, press enter, authorize changes, wait (a fairly long time) for the process to complete, then press enter again when asked.
      <img src="./04-InstallingNodeJS/images/InstallingNodeJS (15).png">
      <img src="./04-InstallingNodeJS/images/InstallingNodeJS (16).png">
      <img src="./04-InstallingNodeJS/images/InstallingNodeJS (18).png">
  * Restart your computer.
    <img src="./04-InstallingNodeJS/images/InstallingNodeJS (21).png">
  * Open `Command Prompt`
    <img src="./04-InstallingNodeJS/images/InstallingNodeJS (22).png">
  * Run the command: `npm install -g npm`
    <img src="./04-InstallingNodeJS/images/InstallingNodeJS (25).png">
    > This makes sure that the Node Package Manager (NPM) is updated to the newest version. Node Package Manager lets you install other people's code as 'packages' that allow you to make use of their code without having to copy it into your project manually.
  * Exit `Command Prompt`

# Step #5: Set up IDE, Create your back-end app with Express framework

The 'back-end' of a web app is the layer of the stack that handles data input, output, and processing. This is in contrast to the front-end, which is responsible for presentation (how the app looks) and user interaction. In this step we'll use a framework to get us ready to start making the features of the database available online.

Summary:
  * Run command prompt as administrator.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (1).png">
  * Run the command: `cinst vscode`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (5).png">
    > This will install Microsoft Visual Studio Code, a free code editor. I strongly recommend using it for all your coding tasks. `cinst` is short for 'chocolatey install'. Chocolatey is a command-line program that makes installing, updating, and removing programs on your system fast and simple. It is one of the 'necessary tools' installed along with Node.js.
  * Create a new folder for your back-end app.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (8).png">
    <img src="./05-CreateBackEnd/images/CreateBackEnd (10).png">
  * Open the folder in VS Code.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (12).png">
  * Open the terminal in VS Code.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (13).png">
  * Run the command: `npm express-generator --no-view ./`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (15).png">
    > This will generate the default files and structure for your new Express back-end. `--no-view` means that your app will not handle the presentation of pages, only the output of data.
  * Run the command: `npm install`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (17).png">
    > Express builds functionality on top of many publicly available 'packages', this command installed the required packages into your project.
  * Run the command: `npm start`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (18).png">
    > This command starts the server so you can see your app in a browser.
  * Allow the server through the firewall if asked.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (20).png">
  * Open browser and go to: `http://localhost:3000`
    > Express runs on port `3000` by default. This is useful because many front-end frameworks run at port `8080` so they don't conflict. `localhost` is what your computer calls itself, so it knows the server isn't 'somewhere else' on the internet.
  * You should see the default home page for an Express app.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (24).png">
  * In the VS Code terminal, press `ctrl+c`, type `y`, then press `enter` to stop the server.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (28).png">
    > In most terminals, `ctrl+c` is the key combination to cancel a running process. I think of it as 'C is for cancel'. `ctrl+c` usually copies text, so if you need to copy something out of the terminal, select it, then right-click.
  * Delete the file `public/index.html`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (32).png">
    > This file is just a place-holder, and it will get in the way of what we need to do.
  * Open `routes/index.js`
    <img src="./05-CreateBackEnd/images/CreateBackEnd (44).png">
    > Routes are sort of like the pages of a website. With back-end frameworks, though, you don't need to create a separate page for each URL. You just create route that matches the URL, then the route function will handle what output to produce.
  * Change line 6 to `res.json({ title: 'Express' });` and save.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (47).png">
    > Instead of trying to 'render' a presentation template, we output a simple JavaScript object in JSON format. JSON stands for JavaScript Object Notation. It serves as a standardized format for data that is readable by both humans and computers.
  * Run command `npm start` to restart the server.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (49).png">
  * Refresh `http://localhost:3000` in your browser.
    <img src="./05-CreateBackEnd/images/CreateBackEnd (51).png">
    > You should see the simple object we passed to `res.json()` with some minor differences. In JSON, property names are quoted, and all quotes are double quotes.

# Step #6: Database module

In Node.js, a module is a piece of code in a single file that describes some data or functionality. A module can be 'required' in another file so the code does not need to be re-written everywhere it is to be used. We will write a module that includes some simple functionality to query the database and return the results.

Summary:
  * In VS Code terminal, run the command: `npm install --save mysql2`
    <img src="./06-DatabaseModule/images/DatabaseModule (2).png">
    > this installs the package required to communicate with your database. `--save` lets your project remember that it depends on this new package.
  * In the root folder of your project, create a new file `db.js`
    <img src="./06-DatabaseModule/images/DatabaseModule (3).png">
    <img src="./06-DatabaseModule/images/DatabaseModule (4).png">
  * In the new file, type: `module.exports = 'just a test string';`
    <img src="./06-DatabaseModule/images/DatabaseModule (5).png">
    > `db.js` is now a 'module', and it represents a simple string value.
  * Save `db.js`, open the `extensions` toolbar, search for `path intellisense`, and click the `install` button next to it.
    <img src="./06-DatabaseModule/images/DatabaseModule (7).png">
    <img src="./06-DatabaseModule/images/DatabaseModule (9).png">
    > Path intellisense will help us type file paths in our project by offering auto-complete suggestions based on file paths that exist currently. When we `require` a module, we need to type its correct file path.
  * Open `routes/index.js`
    <img src="./06-DatabaseModule/images/DatabaseModule (11).png">
  * On line 3, type `var db = require('../` then path intellisense will recommend `../db`. Choose it. The line should now read: `var db = require('../db');`
    <img src="./06-DatabaseModule/images/DatabaseModule (14).png">
    > Even though the actual file name of the db module is `db.js`, the `require` function does not use file extensions. The new variable `db` will contain a reference to `module.exports` from the `db.js` file, so at this point, `var db = 'just a test string';`
  * Change line 7 to read: `res.json({ title: db });`
    <img src="./06-DatabaseModule/images/DatabaseModule (17).png">
    > This should result in setting the `title` property of our JSON object to the value of the `db` variable, which is drawn from our `db.js` module.
  * Restart the server in the terminal.
    <img src="./06-DatabaseModule/images/DatabaseModule (19).png">
  * Refresh `http://localhost:3000` in your browser.
    <img src="./06-DatabaseModule/images/DatabaseModule (21).png">
    > You should see `{"title":"just a test string"}` to prove that our module export/require is working.
  * Kill the server in the VS Code terminal. Open `db.js` and insert the following:
    ```javascript
    const db = require('mysql2/promise');
    const connection = db.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'blog',
      password: 'secret'
    });

    const getResults = async function (sql, values) {
      const connectedDb = await connection;
      const [rows, fields] = await connectedDb.execute(sql, values);
      return rows;
    };

    module.exports = { getResults }
    ```
    <img src="./06-DatabaseModule/images/DatabaseModule (32).png">

    Okay, that's a lot to explain so lets go line-by-line. If you aren't familiar with modern JavaScript, `const` is similar to `var` except that it can't be reassigned (set to a new value). It's short for 'constant'. It is good practice to always use `const` unless you know you will intentionally reassign the variable later. It will help you avoid an entire class of hard-to debug errors. If you use const where you didn't mean to, you'll get a clear error about attempting to reassign a constant, and you can fix it easily.

    Moving on, we assign the constant `db` by requiring the package we installed earlier, `mysql2`, but we are requiring a specific part of the package called `promise`. This will let us use JavaScript promises instead of callbacks (callbacks make for messy code that's hard to understand, promises solve that).

    If you are not familiar with modern JavaScript, a promise is a construct that allows our code to continue executing while waiting for some 'promised' data to be returned from a long-running function. In this case, we will be waiting for communication from the database, but we don't want our whole app to freeze and wait for the database server to respond, so the database server makes a promise, and we write some code to be executed when the promise is fulfilled. This kind of programming where we wait for some things while continuing to execute others is called 'asynchronous'. More on that later.

    On line 2, we assign another constant called `connection`. `createConnection()` is a function that is exported by the `mysql2` package, so since we stored all the exports of the package in the `db` constant, we can use `db.createConnection()`.

    The `createConnection` function will return a promise. The promise of a connection to the database. When we execute the `createConnection` function, we pass an object as input. The object contains properties to allow us to specify the connection settings. The database server's host name property (`host`) is `localhost` in this case, because the server is on our own computer, (which calls itself `localhost`). The username we use to connect to the database server is `root`, so `user: 'root'`. The next two should be fairly obvious. The name of the database and the user's password. Change these to match your setup.

    Next, on line 9, we assign another constant, but we are storing a function in it, so we are creating the function `getResults()`. The function takes two arguments, `sql` and `values`. `sql` will be a string of SQL that we want to send to the database. `values` will be an array of values that belong in the SQL query. That's not important right now. We'll get to a more complete example in the future. You may notice the word `async` before the `function` keyword. That means that the function is asynchronous, and returns a promise.

    > Arguments, sometimes called parameters, are the variables declared as input for a function. When you call/execute the function, you specify values for each of the arguments/parameters.

    Line 10 sets a constant called `connectedDb`. You may remember that `connection` represents the promise returned by `createConnection`. In order to assign the resulting connection, we need to wait for the promise to be fulfilled. That's what the `await` keyword does.

    `const connectedDb = await connection;` basically means 'Wait for the promised database connection. Once it is available, assign it to `connectedDb`.' We can only use the `await` keyword inside a function declare with the `async` keyword, so this concept is usually called 'async/await'. Now `connectedDb` can be treated in our code as if the promise has already been fulfilled, and our code will know to hold off until it actually has been.

    On line 11, `connectedDb.execute` returns a promise. The promise will be resolved to return an array. In the array, the first value represents all the rows/records returned by the SQL query, and the second value represents information on the columns/fields involved in the query. We want to break up the array to assign the rows to a variable called `rows`, and the fields to a variable called `fields`. JavaScript lets us do that with a syntax called 'array destructuring assignment'. Basically you assign an array of values to an array of variable names and you end up with a variable that holds each value. So,
      ```javascript
      const [rows, fields] = await connectedDb.execute(sql, values);
      ```

    waits for the `execute` function to return a promise that resolves to an array, then assigns the first value of that array to a constant named `rows`, and the second value to a constant named `fields`.

    Line 12 ends the `getResults` function by returning the rows/records that were retrieved from the database using the SQL query. Remember that an `async` function _always_ returns a promise, so when the `getResults` function is called, the actual row data will need to be `await`-ed.

    Finally, we have `module.exports = { getResults }`. The curly brackets ('{' and '}') form a JavaScript object, so this module exports a simple object with one property, `getResults`, which is a function.

  * Now open `routes/index.js`
    <img src="./06-DatabaseModule/images/DatabaseModule (34).png">
  * we have already `require`-d the `db` module, so now we will use it to query the database.
  * On line 6, add `async` before `function` to make the route function asynchronous.
  * On line 7, remove `{ title: db }` and replace it with:
    ```javascript
    await db.getResults('SELECT * FROM user;')
    ```
    <img src="./06-DatabaseModule/images/DatabaseModule (36).png">
    > Replace `user` with the name of the table you want to query.
  * Save the file
  * Restart the server
  * In your browser, refresh `http://localhost:3000`
  * You should see an empty array `[]`
    > This is because there are currently no records in the database.
  * Open HeidiSQL, then open the `local` session.
    <img src="./06-DatabaseModule/images/DatabaseModule (44).png">
  * Select the table you want to query, then choose the `Data` tab in the right-hand panel.
    <img src="./06-DatabaseModule/images/DatabaseModule (46).png">
  * Click the green plus sign button on the top toolbar to add a record to the table.
    <img src="./06-DatabaseModule/images/DatabaseModule (47).png">
  * Enter a value for each filed, then click away from the active row being edited. The record will be saved.
    <img src="./06-DatabaseModule/images/DatabaseModule (53).png">
  * In your browser, refresh `http://localhost:3000`, you should see JSON output to represent the new record you just inserted into your database.
    <img src="./06-DatabaseModule/images/DatabaseModule (55).png">

# Step #7: Fetch

Now that you have pulled some basic data from the database and displayed it in JSON format at a web-accessible location, you can have your website fetch that data using JavaScript (running in the user's browser). Once you fetch some JSON into your webpage, you can use it as a regular JavaScript object, and insert it into the structure of your page to be displayed.

Let's start out with a completely new minimal UI (user interface, front-end) so you can understand the concepts of how to fetch and display data from the back-end without worrying about how to implement that in your current design.

Summary:
  * Create a folder for the new UI. Mine is called `blog-ui`.
    <img src="./07-Fetch/images/Fetch (2).png">
  * Open the folder in VS Code
    <img src="./07-Fetch/images/Fetch (3).png">
  * Create a new file named `index.html`
    <img src="./07-Fetch/images/Fetch (4).png">
  * Create a new file named `script.js`
    <img src="./07-Fetch/images/Fetch (5).png">
  * Open `index.html`, type `!`, wait for the autocomplete pop-up, then press `enter`.
  * In the `<body>` tag, type:
    ```html
    <script src="script.js"></script>
    ```
    <img src="./07-Fetch/images/Fetch (7).png">
  * Open `script.js`, type:
    ```javascript
    const getUsers = async function(){
      const response = await fetch('http://localhost:3000')
      const data = await response.json()
      console.log(data)
    }
    ```
    <img src="./07-Fetch/images/Fetch (9).png">
    > Some of this may look familiar, we're creating an asynchronous function. The `fetch` function is built into JavaScript. We are directing it to retrieve the content at the URL `http://localhost:3000`. It returns a promise that represents a `Response` object. The `Response` can be read as JSON using the `.json()` function, which also returns a promise. The promise will result in a JavaScript object created from the JSON text that is fetched. To summarize the code: Wait for a response from the URL, assume the response is JSON and read it into a JavaScript object, print the object out in the JavaScript console.
  * Open `index.html`
  * After the existing `<script>` tag, add:
    ```html
    <script>
      getUsers()
    </script>
    ```
    <img src="./07-Fetch/images/Fetch (11).png">
  * Re-open your back-end folder in VS Code.
    <img src="./07-Fetch/images/Fetch (12).png">
  * Run `npm start` from the terminal to start the server.
  * Open Command Prompt as administrator, run the command `cinst googlechrome` to install Google Chrome
    <img src="./07-Fetch/images/Fetch (14).png">
    <img src="./07-Fetch/images/Fetch (15).png">
    > If you already have Chrome or Firefox, you can skip this. However, at the time of writing, Microsoft Edge has a bug that makes working with `localhost` a bit of an issue.
  * Open your new UI folder in File Explorer. Right-click index.html, then choose `Open with > Google Chrome`
    <img src="./07-Fetch/images/Fetch (19).png">
  * The page will be blank. Right-click the page, and choose `Inspect`
    <img src="./07-Fetch/images/Fetch (20).png">
  * The DevTools panel should open.
    > I find it easiest to use when docked to the bottom of the window. To do this, click the three-dot icon near the top right of the panel, and click the second-from-the-right icon at the top of the pop-up menu.
  * You should currently be seeing the `Elements` tab. Click on the `Console` tab to open the JavaScript console.
    <img src="./07-Fetch/images/Fetch (21).png">
  * You should see an error that says something like `Access to fetch at 'http://localhost:3000/' from origin 'null' has been blocked by CORS policy`...
    <img src="./07-Fetch/images/Fetch (22).png">
    > CORS stands for Cross-Origin Resource Sharing. A security feature of browsers prevents a page on one domain from loading content from another domain unless said domain allows it (has enabled Cross-Origin Resource Sharing). Because `index.html` is not being served and is simply opened from out local filesystem, it has no domain (null). When our page then requests data from `localhost:3000`, that is a cross-origin request, and must be allowed by our back-end.
  * Re-open the back-end folder in VS Code. Stop the server if it is running in the terminal.
  * Run the command: `npm install --save cors`
    <img src="./07-Fetch/images/Fetch (25).png">
    > This installs a package called cors, which will cause Express to send a special message (called a 'header') with every request that indicates which origins/domains are allowed access.
  * Open `app.js`
    <img src="./07-Fetch/images/Fetch (26).png">
  * After line 4, create a new line with:
    ```javascript
    const cors = require('cors');
    ```
    <img src="./07-Fetch/images/Fetch (27).png">
    > Stores the exported function from the `cors` package we installed in a constant called `cors`.
  * After line 16, create a new line with:
    ```javascript
    app.use(cors());
    ```
    <img src="./07-Fetch/images/Fetch (29).png">
  * Save the file. In the terminal run: `npm start`
  * Open your new UI's `index.html` with Chrome (if it's already open, refresh), then open the JavaScript console.
  * You should see the object representing the database records we retrieved. Use the little triangle/arrow icons to expand and collapse the object's properties.
    <img src="./07-Fetch/images/Fetch (36).png">
  * Now we'll add the ability to actually display some of the data on the page.
  * Open your UI folder in VS Code, then open `script.js`.
    <img src="./07-Fetch/images/Fetch (37).png">
  * Delete line 4 (the `console.log` statement)
  * Change line 3 to `return response.json()`
    > Now `getUsers` will return the data directly instead of logging it to the console. We don't need `await` in the return statement because the output of async functions is always an unresolved promise.
  * After the `getUsers` function, create a new line and type:
    ```javascript
    const showUsers = async function(){
      const users = await getUsers()
      user.forEach(user => {
        document.body.insertAdjacentHTML('beforeend', `<div>${user.first_name}</div>`)
      })
    }
    ```
    <img src="./07-Fetch/images/Fetch (38).png">

    In this function, we are waiting for the user data from `getUsers` and assigning it to the constant `users` (which is an array). JavaScript arrays have a built-in method called `forEach`, which allows us to specify a function that will execute on every value in the array. You may be confused by `user => {`. In this case, it's a shorthand that means `function(user){`. The function specifies a parameter called `user`. The `forEach` loop runs the function for each value of the `users` array, passing in that value as `user`.

    `document.body` is the `<body>` element of the page. `insertAdjacentHTML` is a function that allows us to add HTML to the page in relation to a specific element (`body` in this case). The first argument is a string that indicates where the HTML will be inserted. `'beforeend'` means the new HTML will be inserted just before the closing `</body>` tag. The next argument is the HTML to be inserted.

    I'm using a 'template literal' here. It's a special string that allows variables and expressions to be inserted if formatted like `${[variable or expression]}`. So the HTML will be a `<div>` with `user.first_name` as content.

    In your case, if you aren't querying a `user` table, the names of your functions, variables, and properties will all be different, so be sure to change them appropriately.

  * Open `index.html`
  * Change ~~`getUsers`~~ to `showUsers`
    <img src="./07-Fetch/images/Fetch (41).png">
  * In Chrome, refresh `index.html`
    <img src="./07-Fetch/images/Fetch (42).png">
    > You should see some of the data on the page.
  * Open the `Elements` tab in DevTools to confirm the HTML that was inserted.
    <img src="./07-Fetch/images/Fetch (45).png">
  * Open HeidiSQL, then open your `local` session.
  * Go to the `Data` tab for the table you are querying.
  * Add another row/record.
    <img src="./07-Fetch/images/Fetch (50).png">
  * In Chrome, refresh `index.html`
    <img src="./07-Fetch/images/Fetch (53).png">
    > You should see both records now.
  * In VS Code, open `script.js`
  * Add another property to the inserted HTML like: `${user.last_name}`
    <img src="./07-Fetch/images/Fetch (56).png">
  * Save, then refresh the page in Chrome.
    <img src="./07-Fetch/images/Fetch (58).png">
    > You should now have the basic gist of how to fetch and display data from the database in your UI.

# Step #8: Routes

A route in Express is a function to be run when a certain URL is requested. We can create similar routes to fetch different data from the database.

Summary:
  * Open your back-end folder in VS Code
  * Open `routes/index.js`
  * On line 6, change `'/'` to `'/users'`
  * On line 7, I'm going to list the fields I want to select so I don't select the user's password.
    <img src="./08-Routes/images/Routes (9).png">
    > A user's password should never be displayed. A password should also never be stored in plain text like this example. [Learn more about 'password hashing'](https://owasp.org/www-project-cheat-sheets/cheatsheets/Password_Storage_Cheat_Sheet.html) before implementing an app with users that can log in.
  * Start the server (`npm start`)
  * Open your UI folder in VS Code
    <img src="./08-Routes/images/Routes (12).png">
  * Open `script.js`
    <img src="./08-Routes/images/Routes (14).png">
  * Change `'http://localhost:3000'` to `'http://localhost:3000/users'`.
    <img src="./08-Routes/images/Routes (15).png">
  * Save.
  * Open `index.html` in Chrome or refresh if already open.
    > Everything should be working identically to before, even though (in my case) I excluded a field from the query and renamed the route. This works because we changed the route to match `/users`, and we changed `script.js` to fetch `/users`
  * Open the back-end folder in VS Code, then open `routes/index.js`.
  * Copy lines 6-8 (The entire `/users` route).
    <img src="./08-Routes/images/Routes (18).png">
  * Make a new line after the route and paste a duplicate.
    <img src="./08-Routes/images/Routes (19).png">
  * In the duplicate, change `'/users'` to `'/posts'`
  * Change the SQL query to `SELECT id, created_at, updated_at, title FROM post`
    <img src="./08-Routes/images/Routes (20).png">
    > Notice I'm not selecting the `content` field. For a route that just lists the posts that exist in the database, I don't need to include the extra payload of including every post's content.
  * Copy the route you just created and duplicate it.
  * In the new route, change `'/posts'` to `'/posts/:postId'`
    > A URL section that begins with `:` is a named wildcard. Any url that matches `/posts/[anything that doesn't include a slash here]` will match the new route, and the portion that matches the position of the wildcard will be available using the name `postId`. A request for `/posts/1` will result in `postId` equal to `1`.
  * Change the SQL query to `'SELECT * FROM post WHERE id = ?'`
    > The question mark will be replaced with a value from an array. You may remember that the `getResults` function takes two arguments. The second argument is an array of values to replace question mark placeholders.
  * Add a comma `,` after the SQL string to indicate you are adding another argument.
  * After the comma type: `[req.params.postId]`
    <img src="./08-Routes/images/Routes (25).png">
    > `req` is the request object, you might notice it's an argument to the route function. The request object holds information about the user's request. `req.params` is an object that holds the named wildcards for the route, so `req.params.postId` is the value the user put in the URL that matches the position of the `:postId` wildcard. We place the whole thing in square brackets (`[` and `]`) to make it the first value of an array. The `values` argument of `getResults` expects an array.
  * In the terminal, stop the server, then start it again.
  * In HeidiSQL, insert a few records for the tables referenced in the new routes.
    <img src="./08-Routes/images/Routes (29).png">
  * In Chrome, go to `http://localhost:3000/users`
    <img src="./08-Routes/images/Routes (34).png">
  * Go to `http://localhost:3000/posts`
    <img src="./08-Routes/images/Routes (35).png">
  * Go to `http://localhost:3000/posts/1`
    <img src="./08-Routes/images/Routes (36).png">

You can see how routes give you convenient, named access to specific queries from the database.

# Step #9: Post

HTTP stands for HyperText Transfer Protocol. A protocol is just a system for doing things. In this case, the system describes how a browser communicates with a server. The browser sends a 'request' to the server, the server sends a 'response' back. Part of the request is the 'request method'.

The request method is a word that is sent with every request the browser makes to a server. When the browser is asking the server for some data, the request method is `GET`. When the browser is sending some data to the server to be processed or stored, the request method is usually `POST`. There are several other request methods, but these two are the ones that matter to us.

So far, we have only asked for data from the different routes on the back-end, so we have been using the `GET` request method. If we want to send data (like a blog post to be stored), we need to use the `POST` method. In this step, we'll be creating an HTML form that uses the `POST` method to publish a blog post. We'll also create a back-end route to process and store the post.

## Follow the slideshow _09-Post.odp_

Summary:
  * Open the back-end folder in VS Code, and start the server in the terminal.
    <img src="./09-Post/images/Post (2).png">
    <img src="./09-Post/images/Post (4).png">
  * Open the front-end folder in another window of VS Code.
    <img src="./09-Post/images/Post (6).png">
  * Create a new file called `post.html`.
    <img src="./09-Post/images/Post (8).png">
  * Type `!`, wait for the autocomplete pop-up, then press enter.
    <img src="./09-Post/images/Post (9).png">
    <img src="./09-Post/images/Post (10).png">
  * Inside the `<body>` tag type `form`, from the pop-up choose `form:post`
    <img src="./09-Post/images/Post (11).png">
    <img src="./09-Post/images/Post (12).png">
  * Set the `action` attribute to `http://localhost:3000/posts`, the `method` attribute should be `post`
    > This tells the browser to send the form data to the server with the `POST` request method when the form is submitted.
  * In the new form, add inputs for your database fields and a submit button.
    <img src="./09-Post/images/Post (13).png">
    > Specify the `name` attribute on each form input. The Express back-end will access the submitted data using the name you enter for each input field.
  * Open `post.html` in Chrome. Fill out the form and submit it.
    <img src="./09-Post/images/Post (17).png">
  * You should see an error. That's because we haven't create a route for accepting the form post.
    <img src="./09-Post/images/Post (18).png">
  * Open the back-end in VS Code, then open the `routes/index.js` file.
    <img src="./09-Post/images/Post (21).png">
  * Copy the route for `/posts` and paste it after the final existing route.
    <img src="./09-Post/images/Post (22).png">
    <img src="./09-Post/images/Post (23).png">
  * In the new route, change `router.get` to `router.post`
    <img src="./09-Post/images/Post (24).png">
  * Change the line that starts with `res.json` to:
    ```javascript
    res.json(req.body);
    ```
    <img src="./09-Post/images/Post (28).png">
    > `req.body` is the data that was submitted by the browser in the request.
  * Restart the back-end server.
    <img src="./09-Post/images/Post (30).png">
  * Re-submit the form at `post.html`
  * You should see JSON output listing the names of the form fields and the values you entered.
    <img src="./09-Post/images/Post (34).png">
    > Now that we know `req.body` has all of the form data, we can use that data to create records in the database.
  * Change the new route function to:
    ```javascript
    router.post('/posts', async function(req, res, next) {
      res.json(await db.getResults('INSERT INTO post (title, content, user_id) VALUES(?, ?, 1)', [req.body.title, req.body.content]));
    });
    ```
    <img src="./09-Post/images/Post (35).png">
    > My fields are `title`, and `content`. Change yours accordingly. My `post` table requires a `user_id`, so I am manually specifying user `1` instead of using a question mark placeholder.
  * Restart the server.
  * Re-submit the form
  * You should see a summary of the outcome of running the SQL query. We aren't selecting anything, so we don't see the actual database records.
    <img src="./09-Post/images/Post (41).png">
  * Pay special attention to `affectedRows`, and `insertId`. `affectedRows` is how many records were created/modified in the database. `insertId` tells us the value of the `auto_increment` field (the `id` column)
  * Copy the `insertId` number, and use it in the URL to access the route for that object. Mine is `http://localhost:3000/posts/[post id here]`
    <img src="./09-Post/images/Post (43).png">
  * You should see the data for the record you just created by submitting the form.
  * Open your route and change it again to:
    ```javascript
    router.post('/posts', async function(req, res, next) {
      const outcome = await db.getResults('INSERT INTO post (title, content, user_id) VALUES(?, ?, 1)', [req.body.title, req.body.content]);
      if(outcome.affectedRows)
      {
        const formUrl = new URL(req.get('referrer'));
        return res.redirect(formUrl.origin);
      }
      res.json(outcome);
    });
    ```
    <img src="./09-Post/images/Post (44).png">
    > We store the outcome of the same query as before, but this time we check to make sure that the query affected some rows (`if(outcome.affectedRows)`). If no rows were affected, we just show the outcome as JSON. All the interesting stuff is happening in those two lines within the `if` block.

    The first line uses `req.get('referrer')`. When your browser navigates to a new page, it tells the new page the URL of the page it came from previously. This is sent to the server of the new page using the `referer` field (spelling intentional). We get the value of that field in Express using `req.get('referrer')` (Express fixes the spelling for us). So, if our form is served at `http://localhost:80/post.html`, when the browser submits the form and navigates to `http://localhost:3000/posts`, it tells the server the page that sent us to it (the referrer) was `http://localhost:80/post.html`.

    In the same line we have `new URL()` which receives the referrer URL as input. `URL` is an object built into Node.js. We create a new URL object from a URL string, then we can use the functions of the URL object, which we do in the next line.
    
    So `formUrl` is a variable that contains a `URL` object, which contains the URL of the page with our form on it. Then we access `formUrl.origin`. The `origin` property of a `URL` object returns the domain name portion from the URL, so if the form was at `http://localhost:80/post.html`, then the origin is `http://localhost:80`. Since we have an `index.html` in the UI folder, that origin will load it because `index.html` is the default page. You may have guessed, we are redirecting the browser back to the index page after we publish a post.

    We use `return res.redirect()` to avoid displaying any output and instead send the user's browser to the UI index page. We have to use the `return` keyword because it immediately ends the function. Otherwise, the function would continue before the redirect has completed, executing `res.json` as well, which is an error that would crash the app.
  * Save the routes file and restart the server.
  * Re-submit the form at `post.html`
  * You should see an error like `Cannot GET /null`
    <img src="./09-Post/images/Post (48).png">
    > This is because the referrer field did not exist so the server ended up with `null`. The referrer wasn't sent to the server because our form isn't actually being served from a domain, so there's no origin and therefore no referrer. We fix this by running the front-end UI on a server, just like we do with the back-end.
  * Open your UI folder in VS Code, then open the `post.html` file.
    <img src="./09-Post/images/Post (49).png">
  * Open the extensions menu from the toolbar on the left.
    <img src="./09-Post/images/Post (51).png">
  * Search for `Live server`, then install it.
    <img src="./09-Post/images/Post (53).png">
  * There should be a new button in the bottom status bar to the right that says `Go Live`. Click it.
    <img src="./09-Post/images/Post (56).png">
  * Your form should open in your default browser. Fill it out and submit it.
    <img src="./09-Post/images/Post (58).png">
  * If the redirect worked, you should see the page from `index.html`.
    <img src="./09-Post/images/Post (59).png">

Now you have the basics of a web app!

The basic functions of a database-connected web app are known as CRUD (Create, Read, Update, Delete). We have covered creating records and reading/retrieving them. Update and delete are very similar to what we have covered, simply using different SQL queries.
