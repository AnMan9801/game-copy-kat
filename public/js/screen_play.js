// > create container to hold the screen with blocks
import { Container, Loader, Sprite } from '/js/pixi.mjs';
import { app, setCanvasSize } from "/js/app.js";
import { createScreen_incorrect, showIncorretInputScreen } from "/js/screen_incorrect.js";

export let screen_play = new Container();

const PINK = 0,
    BLUE = 1,
    YELLOW = 2,
    GREEN = 3,
    totalBlocks = 4;
let boxColor = [];
let boxClick = [];
let boxSuccess = [];

let bW = app.view.width / 4;

// ? load sprites from single image with spritesheet
Loader.shared.add("./images/itemcopyKat.json").add("./images/copyKat.json").add("./images/items.json").load(createScreen);

function createScreen() {
    let sheet1 = Loader.shared.resources["./images/itemcopyKat.json"].spritesheet;
    let sheet2 = Loader.shared.resources["./images/copyKat.json"].spritesheet;
    createBoxes(sheet1.textures, sheet2.textures);
    
    // ? create svreen Incorrect
    createScreen_incorrect();

}

function createBoxes(boxTextures, glowTextures) {
    // sprites

    createSprite(boxTextures.pink, PINK, app.view.width / 2 - bW / 2, app.view.height / 2 - bW / 2, glowTextures);
    createSprite(boxTextures.blue, BLUE, app.view.width / 2 - bW / 2, app.view.height / 2 + bW / 2, glowTextures);
    createSprite(boxTextures.yellow, YELLOW, app.view.width / 2 + bW / 2, app.view.height / 2 + bW / 2, glowTextures);
    createSprite(boxTextures.green, GREEN, app.view.width / 2 + bW / 2, app.view.height / 2 - bW / 2, glowTextures);

    updateSizes();
    for (let index = 0; index < boxColor.length; index++) {
        screen_play.addChild(boxColor[index]);
        screen_play.addChild(boxClick[index]);
        screen_play.addChild(boxSuccess[index]);
    }
    showPattern();
}

function createSprite(imgUrl, index, x, y, glowTextures) {

    // Create colores boxes
    let bColour = new Sprite.from(imgUrl);
    bColour.anchor.set(0.5);
    bColour.tint = 0xeeeeee;
    bColour._zindex = 2;

    // Create sprites for interactions
    let bClick = new Sprite.from(glowTextures.clickBox);
    bClick.anchor.set(0.5);
    bClick._zindex = 1;
    bClick.alpha = 0;


    let bSuccess = new Sprite.from(glowTextures.successBox);
    bSuccess.anchor.set(0.5);
    bSuccess._zindex = 0;
    bSuccess.alpha = 0;
    bSuccess.interactive = true;
    bSuccess.buttonmode = true;

    bSuccess.on("pointerdown", (e) => glowBoxPlayed(index));
    boxColor[index] = bColour;

    boxClick[index] = bClick;
    boxSuccess[index] = bSuccess;
}
// * make app resizble
function updateSizes(e) {
    setCanvasSize();
    bW = app.view.width / 2.4;

    for (let index = 0; index < boxColor.length; index++) {
        boxColor[index].height = boxColor[index].width = bW;
        boxClick[index].height = boxClick[index].width = bW;
        boxSuccess[index].height = boxSuccess[index].width = bW;
    }
    let x = [];
    let y = [];
    x[PINK] = x[BLUE] = app.view.width / 2 - bW / 1.9 ;
    x[YELLOW] = x[GREEN] = app.view.width / 2 + bW / 1.9;
    y[YELLOW] = y[BLUE] = app.view.height / 2 + bW / 2 + bW/2.6;
    y[PINK] = y[GREEN] = app.view.height / 2 - bW / 2 + bW/3;

    for (let index = 0; index < boxColor.length; index++) {
        boxColor[index].x = x[index];
        boxClick[index].x = x[index];
        boxSuccess[index].x = x[index];
        
        boxColor[index].y = y[index];
        boxClick[index].y = y[index];
        boxSuccess[index].y = y[index];
    }
}

const sleep = m => new Promise(r => setTimeout(r, m));

// Async function to glow box
async function glowClickBox(index) {
    boxClick[index].alpha = 0.45;
    await sleep(400);
    boxClick[index].alpha = 0;
}
async function glowSuccessBox(index) {
    boxSuccess[index].alpha = 0.45;
    await sleep(400);
    boxSuccess[index].alpha = 0;
}


// ! logic for game starts from here

let roundCount = 0;
let roundScore = [0, 0, 0];
let totalScore = 0;
let playerInputCount = 0;

let questionArray = [];
nextQuestion();

// * to manage player input
function glowBoxPlayed(index) {
    if (playerInputCount < questionArray.length - 1) {
        if (index == questionArray[playerInputCount]) {
            glowClickBox(index);
            playerInputCount++;
        } else {
            // ? THROW ERROR FOR WRONG INPUT
            playerInputCount = 0;
            const call = async () => {
                await showIncorretInputScreen();
                await sleep(150);
                showPattern();
            };
            call();
        }
    } else {
        if (index == questionArray[playerInputCount]) {
            playerInputCount = 0;
            roundScore[roundCount]++;
            const run = async () => {
                await glowSuccessBox(index);
                nextQuestion();
            }
            run();
        } else {
            // ? THROW ERROR FOR WRONG INPUT
            playerInputCount = 0;
            const call = async () => {
                await showIncorretInputScreen();
                await sleep(150);
                showPattern();
            };
            call();
            
        }
    }
}
// * function to generate question
async function nextQuestion() {
    await sleep(400); // ! check the interacaivity here 
    questionArray = [...questionArray, getRandomColor()];
    showPattern();
}

// * function to show pattern of questions
async function showPattern() {
    changeInteractivity(false);
    for (const color of questionArray) {
        await sleep(200);
        await (glowClickBox(color));
    }
    changeInteractivity(true);
}

// * util to change interactive mode of boxes
function changeInteractivity(flag) {
    for (const box of boxSuccess) {
        box.interactive = flag;
        box.buttonmode = flag;
    }
}
// * util to generate random color
function getRandomColor() {
    return Math.floor(Math.random() * Math.floor(totalBlocks));
}

export const createScreenPlay = createScreen;
export const updateScreenPlay = updateSizes;