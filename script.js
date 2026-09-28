// --------------------------------------------------
// KNOWADATA BRAND INTRO
// --------------------------------------------------

const brand = document.querySelector(".brand-animation");

const sequence = [
    "Hi, I'm Noah",
    "Know Data",
    "Data Now",
    "KnowaData"
];

let step = 0;


// --------------------------------------------------
// SHOW BRAND STEP
// --------------------------------------------------

function showBrandStep() {

    brand.classList.remove("show");

    setTimeout(() => {

        brand.textContent = sequence[step];
        brand.classList.add("show");

        step++;

    }, 300);
}


// --------------------------------------------------
// START ANIMATION
// --------------------------------------------------

showBrandStep();

setTimeout(showBrandStep, 2500);  // Know Data
setTimeout(showBrandStep, 5000);  // Data Now
setTimeout(showBrandStep, 7500);  // KnowaData