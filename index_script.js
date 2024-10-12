/*---------------------------------------------------------*/
/* Duration beállítása */
/*---------------------------------------------------------*/

//A beállítandó időtartamot jelző input:
const durationInput = document.querySelector(".duration");

//Az időtartamot beállító gombok tömbje:
const durationButtons = document.querySelectorAll(".js-dur-buttons");

//Az időtartamot beállító gombok eeménykezelői:
durationButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    //Az időtartam input értékének konvertálása [perc, másodperc] formátumba:
    let duration = convertInput(durationInput);
    switch (button.dataset.change) {
      //A perc növelő nyíl gomb beállítása:
      case "minup":
        duration[0]++;
        break;
      //A másodperc növelő nyíl gomb beállítása:
      case "secup":
        if (duration[1] >= 59) {
          duration[0]++;
          duration[1] = 0;
        } else {
          duration[1]++;
        }
        break;
      //A perc csökkentő nyíl gomb beállítása:
      case "mindown":
        if (duration[0] > 0) duration[0]--;
        break;
      //A másodperc csökkentő nyíl gomb beállítása:
      case "secdown":
        if (duration[1] === 0 && duration[0] > 0) {
          duration[0]--;
          duration[1] = 59;
        } else if (duration[1] > 0) {
          duration[1]--;
        }
        break;
      //A +5 perc gomb beállítása:
      case "min5":
        duration[0] += 5;
        break;
      //A +10 perc gomb beállítása:
      case "min10":
        duration[0] += 10;
        break;
      //A +10 másodperc gomb beállítása:
      case "sec10":
        if (duration[1] >= 49) {
          duration[0]++;
          duration[1] = duration[1] + 10 - 60;
        } else {
          duration[1] += 10;
        }
        break;
      //A +30 másodperc gomb beállítása:
      case "sec30":
        if (duration[1] >= 30) {
          duration[0]++;
          duration[1] = duration[1] + 30 - 60;
        } else {
          duration[1] += 30;
        }
        break;
    }
    //Az időtartam input értékének frissítése
    durationInput.value = createDuration(duration);
  });
});

/*---------------------------------------------------------*/
/* Timer beállítása */
/*---------------------------------------------------------*/

//Plusz egy visszaszámláló létrehozását végző gomb:
const addButton = document.querySelector(".add");

//A visszaszámlálókat tároló div elem:
const timercontainer = document.querySelector(".timercontainer");

//A visszaszámláló objektum példányokat tároló tömb:
let timerArray = [];

//A visszaszámlálókat azonosító számláló:
let timerCounter = 1;

//A visszaszámláló létrehozását végző gomb eseménykezelője:
addButton.addEventListener("click", (event) => {
  event.preventDefault();
  timerArray.push(new Timer(convertInput(durationInput)));
  upgradeTimerContainer(timerArray, timercontainer);
});

//A visszaszámláló sablon osztály:
class Timer {
  constructor(duration) {
    this.serialNumber = timerCounter;
    timerCounter++;
    this.duration = [...duration];
    this.initialDuration = [...duration];
    this.intervalId = null;
    this.content = `
      <form class="timer timer-${this.serialNumber}">
        <button class="timer-close" data-change="close">
        X
        </button>
        <h2>Timer #${this.serialNumber}</h2>
        <input type="text" class="timer-duration" value=${createDuration(
          this.duration
        )} readonly />
        <div>
        <button class="timerbuttons js-timer-buttons" data-change="start">
        Start
        </button>
        <button class="timerbuttons js-timer-buttons" data-change="stop">
        Stop
        </button>
        <button class="timerbuttons js-timer-buttons" data-change="reset">
        Reset
        </button>
        </div>
        </form>`;
  }

  //A visszaszámláló gombjainak és azok eseménykezelőinek regisztrálása:
  register() {
    this.closeButton = document.querySelector(
      ".timer-" + this.serialNumber + " .timer-close"
    );
    this.timerActionButtons = document.querySelectorAll(
      ".timer-" + this.serialNumber + " .js-timer-buttons"
    );
    this.timerInput = document.querySelector(
      ".timer-" + this.serialNumber + " .timer-duration"
    );
    this.closeButton.addEventListener("click", (event) => {
      this.handleClick(event);
    });
    this.timerActionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        this.handleClick(event);
      });
    });
  }

  //A visszaszámláló gombjai eseménykezelőinek beállítása:
  handleClick(event) {
    event.preventDefault();
    switch (event.target.dataset.change) {
      //A visszaszámlálót bezáró gombj beállítása:
      case "close":
        timerArray = timerArray.filter((item) => item !== this);
        upgradeTimerContainer(timerArray, timercontainer);
        break;
      //A visszaszámlálót elindító gombj beállítása:
      case "start":
        this.timerDecrement();
        break;
      //A visszaszámlálót leállító gombj beállítása:
      case "stop":
        clearInterval(this.intervalId);
        this.intervalId = null;
        break;
      //A visszaszámlálót eredti értékre állító gombj beállítása:
      case "reset":
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.duration = [...this.initialDuration];
        this.timerInput.value = createDuration(this.duration);
        break;
    }
  }

  //A visszaszámlálás beállítása:
  timerDecrement() {
    if (
      !(this.duration[0] === 0 && this.duration[1] === 0) &&
      this.intervalId === null
    ) {
      this.intervalId = setInterval(() => {
        if (this.duration[0] > 0 && this.duration[1] === 0) {
          this.duration[0]--;
          this.duration[1] = 59;
        } else {
          this.duration[1]--;
        }
        this.timerInput.value = createDuration(this.duration);
        if (this.duration[0] === 0 && this.duration[1] < 10) {
          this.timerInput.classList.add("flashing");
        }
        if (this.duration[0] === 0 && this.duration[1] === 0) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.timerInput.classList.remove("flashing");
        }
      }, 1000);
    }
  }
}

/*---------------------------------------------------------*/
/* Segédfüggvények beállítása */
/*---------------------------------------------------------*/

//A visszaszámlálókat tároló div elem tartalmának frissítése:
const upgradeTimerContainer = (timerArray, timercontainer) => {
  timercontainer.innerHTML = "";
  timerArray.forEach((timer) => {
    timercontainer.innerHTML += timer.content;
  });
  timerArray.forEach((timer) => {
    timer.register();
  });
};

//Az időtartam input értékének konvertálása [perc, másodperc] formátumba:
const convertInput = (input) => {
  let min = parseInt(input.value.split(":")[0], 10);
  let sec = parseInt(input.value.split(":")[1], 10);
  return [min, sec];
};

//A [perc, másodperc] formátum konvertálása "perc:másodperc" formátumba:
const createDuration = (array) => {
  let newArray = array.map((item) => {
    if (item < 10) {
      return "0" + item.toString();
    } else {
      return item.toString();
    }
  });
  return newArray.join(":");
};
