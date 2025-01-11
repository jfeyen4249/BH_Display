const express = require("express");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const bodyParser = require('body-parser');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const app = express();
const xlsx = require('xlsx');
const { get } = require("express/lib/response");
const { info } = require("console");
const workbook = xlsx.readFile('public/data/sports.xlsx');
const meals = xlsx.readFile('public/data/meals.xlsx');

const port = 8080;

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.set("view engine", "hbs");

app.get("/", (req, res) => {

let imageArray = [];
let infoArray = [];
let birthdayArray = [];
let pageData = [];

const imagePath = path.join(__dirname, 'public', 'img');

fs.readdir(imagePath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Filter files and push matching ones to the array
    files.forEach(file => {
        const filePath = path.join(imagePath, file);

        // Check if it's a file and has a valid extension
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error('Error reading file stats:', err);
                return;
            }

            if (stats.isFile() && !file.startsWith("._")) {
                const ext = path.extname(file).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.mov', '.mp4'].includes(ext)) {
                    imageArray.push(file);
                }
            }
        });
    });
});


async function readBirthday(filePath) {
    const linesArray = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // Recognize all instances of CR LF as a single line break
    });

    for await (const line of rl) {
        linesArray.push(line.trim()); // Add each line to the array, trimming whitespace
    }

    return linesArray;
}


const filePath = 'public/data/announcements.txt'; // Replace with your file path
readBirthday(filePath)
    .then(lines => {
        infoArray = lines;
    })
    .catch(err => {
        console.error('Error reading file:', err);
    });

    async function readFileLineByLine(filePath) {
        const linesArray = [];
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity, // Recognize all instances of CR LF as a single line break
        });
    
        for await (const line of rl) {
            linesArray.push(line.trim()); // Add each line to the array, trimming whitespace
        }
    
        return linesArray;
    }
    
    readFileLineByLine('public/data/birthdays.txt')
        .then(lines => {
            birthdayArray = lines;
        })
        .catch(err => {
            console.error('Error reading file:', err);
        });





   
    setTimeout(() => {
        pageData = {
            images: imageArray,
            info: infoArray,
            birthdays: birthdayArray
        };
        console.log(pageData)
        res.render("index", pageData);
    }, 100);




});

app.get("/lunch", (req, res) => {
    let data = [];
    const sheet = meals.Sheets[meals.SheetNames[0]];
    const today = new Date();

    for (let i = 2; i < 100; i++) { // Start from row 2 since row 1 contains headers
        const dateStr = sheet[`A${i}`]?.v;
        const line1 = sheet[`B${i}`]?.v; 
        const line2 = sheet[`C${i}`]?.v;
        const line3 = sheet[`D${i}`]?.v;
        const line4 = sheet[`E${i}`]?.v;
        const line5 = sheet[`F${i}`]?.v;
        const line6 = sheet[`G${i}`]?.v;

        if (dateStr) {
            // Parse the date string into a Date object
            const gameDate = new Date(dateStr);

            // Ensure the row is valid and date is today or in the future
            if (!isNaN(gameDate) && gameDate >= today - 1000 * 60 * 60 * 24) {
                data.push({
                    date: dateStr,
                    line1: line1 || `&nbsp;`,
                    line2: line2 || `&nbsp;`,
                    line3: line3 || `&nbsp;`,
                    line4: line4 || `&nbsp;`,
                    line5: line5 || `&nbsp;`,
                    line6: line6 || `&nbsp;`,
                });
            }
        }
        // Break the loop if we already have 5 results
        if (data.length === 6) {
            break;
        }
    }
    console.log(data);
    res.render("lunch", { lunchData: JSON.stringify(data) });
//    res.render("lunch", { data });
});

app.get("/birthdays", (req, res) => {
    fetch('http://127.0.0.1:8080/data/birthdays.txt')
        .then(response => response.text())
        .then(text => {

            let birthdayList = text.split('\n');
            // Send the array of lines as JSON
            res.json(birthdayList);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Failed to fetch birthdays' });
        });
});

app.get("/images", (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'img');;

    fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    const fileArray = files.filter(file => fs.statSync(path.join(folderPath, file)).isFile());

    let data = [];
    fileArray.forEach(file => {
        if (file.includes(".jpg") || file.includes(".jpeg") || file.includes(".png") || file.includes(".mov") || file.includes(".mp4") || file.includes(".gif")) {
            if (file.includes("._")) {
            return;
            }
            data.push(file);
        }

    });
    res.json(data);
    });
});

app.get("/info", (req, res) => {
    fetch('http://127.0.0.1:8080/data/announcements.txt')
        .then(response => response.text())
        .then(text => {
            tickerDisplay = text.split('\n');
            res.json(tickerDisplay);
        })
        .catch(error => console.error('Error:', error));
});

app.get("/weather", (req, res) => {
        function getIcon(code)  {
            let iconCat = String(code);
            iconCat = iconCat.slice(0, 1);
            switch (iconCat) {
                case "2":
                    retun = "./images/icons/2.png";
                    break;
                case "3":
                    retun = "./images/icons/3.png";
                    break;
                case "5":
                    retun = "./images/icons/5.png";
                    break;
                case "6":
                    retun = "./images/icons/6.png";
                    break;
                case "8":
                    retun = "./images/icons/8.png";
                    break;
                }
        }
        fetch('https://api.openweathermap.org/data/2.5/weather?lat=42.5689088&lon=-89.8695168&units=imperial&appid=96bc0887f92e1ea1e9e579e6e6941d1d')
            .then(response => response.json())  
            .then(data => {
                // console.log(data);
                let weatherData = {
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    wind_speed: Math.round(data.wind.speed),
                    icon : getIcon(data.weather[0].id)
                }
                //console.log(weatherData);
                res.send(JSON.stringify(weatherData));
            })
    
});


app.get("/bb-girls", (req, res) => {
    let data = [];
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const today = new Date();

    for (let i = 2; i < 100; i++) { // Start from row 2 since row 1 contains headers
        const dateStr = sheet[`A${i}`]?.v; // Get the date string from the cell
        const gameTime = sheet[`B${i}`]?.v;
        const location = sheet[`C${i}`]?.v;
        const team = sheet[`D${i}`]?.v;

        if (dateStr) {
            // Parse the date string into a Date object
            const gameDate = new Date(dateStr);

            // Ensure the row is valid and date is today or in the future
            if (!isNaN(gameDate) && gameDate >= today - 1000 * 60 * 60 * 24) {
                data.push({
                    date: dateStr,
                    time: gameTime || null,
                    location: location || null,
                    team: team || null,
                });
            }
        }
        // Break the loop if we already have 5 results
        if (data.length === 5) {
            break;
        }
    }

    let gamesdata = JSON.stringify(data);
    let pageData = {
            title: "Girls Basketball",
            data: gamesdata,
            image: "./img/sports/bbgirls.jpg",
            nextpage: "/bb-boys"
        };
        res.render("sports" , {data: pageData}
    );
});
 
app.get("/bb-boys", (req, res) => {
    let data = [];
    const sheet = workbook.Sheets[workbook.SheetNames[1]];
    const today = new Date();

    for (let i = 2; i < 100; i++) { // Start from row 2 since row 1 contains headers
        const dateStr = sheet[`A${i}`]?.v; // Get the date string from the cell
        const gameTime = sheet[`B${i}`]?.v;
        const location = sheet[`C${i}`]?.v;
        const team = sheet[`D${i}`]?.v;

        if (dateStr) {
            // Parse the date string into a Date object
            const gameDate = new Date(dateStr);

            // Ensure the row is valid and date is today or in the future
            if (!isNaN(gameDate) && gameDate >= today - 1000 * 60 * 60 * 24) {
                data.push({
                    date: dateStr,
                    time: gameTime || null,
                    location: location || null,
                    team: team || null,
                });
            }
        }
        // Break the loop if we already have 5 results
        if (data.length === 5) {
            break;
        }
    }

    let gamesdata = JSON.stringify(data);


    let pageData = {
            title: "Boys Basketball",
            data: gamesdata,
            image: "/img/sports/bb-boys.jpg",
            nextpage: "/wrestling"
        };
        res.render("sports" , {data: pageData}
            
    );
});

app.get("/wrestling", (req, res) => {
    let data = [];
    const sheet = workbook.Sheets[workbook.SheetNames[2]];
    const today = new Date();

    for (let i = 2; i < 100; i++) { // Start from row 2 since row 1 contains headers
        const dateStr = sheet[`A${i}`]?.v; // Get the date string from the cell
        const gameTime = sheet[`B${i}`]?.v;
        const location = sheet[`C${i}`]?.v;
        const team = sheet[`D${i}`]?.v;

        if (dateStr) {
            // Parse the date string into a Date object
            const gameDate = new Date(dateStr);

            // Ensure the row is valid and date is today or in the future
            if (!isNaN(gameDate) && gameDate >= today - 1000 * 60 * 60 * 24) {
                data.push({
                    date: dateStr,
                    time: gameTime || null,
                    location: location || null,
                    team: team || null,
                });
            }
        }
        // Break the loop if we already have 5 results
        if (data.length === 5) {
            break;
        }
    }
    let gamesdata = JSON.stringify(data);


    let pageData = {
            title: "High School Wrestling",
            data: gamesdata,
            image: "/img/sports/wrestling.jpg",
            nextpage: "/ms-wrestling"
        };
        res.render("sports" , {data: pageData}
            
    );
});

app.get("/ms-wrestling", (req, res) => {
    let data = [];
    const sheet = workbook.Sheets[workbook.SheetNames[3]];
    const today = new Date();

    for (let i = 2; i < 100; i++) { // Start from row 2 since row 1 contains headers
        const dateStr = sheet[`A${i}`]?.v; // Get the date string from the cell
        const gameTime = sheet[`B${i}`]?.v;
        const location = sheet[`C${i}`]?.v;
        const team = sheet[`D${i}`]?.v;

        if (dateStr) {
            // Parse the date string into a Date object
            const gameDate = new Date(dateStr);

            // Ensure the row is valid and date is today or in the future
            if (!isNaN(gameDate) && gameDate >= today - 1000 * 60 * 60 * 24) {
                data.push({
                    date: dateStr,
                    time: gameTime || null,
                    location: location || null,
                    team: team || null,
                });
            }
        }
        // Break the loop if we already have 5 results
        if (data.length === 5) {
            break;
        }
    }
    let gamesdata = JSON.stringify(data);
    let pageData = {
            title: "Middle School Wrestling",
            data: gamesdata,
            image: "/img/sports/wrestling.jpg",
            nextpage: "/"
        };
        //res.json(pageData);
        res.render("sports" , {data: pageData});
});
 
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});