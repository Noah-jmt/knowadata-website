// KNOWADATA brand intro

const brand = document.querySelector(".brand-animation");

const sequence = [
    "Hi, I'm Noah",
    "Know",
    "     Data",
    "KnowaData"
];

let step = 0;

function nextBrandStep() {

    brand.classList.remove("show");

    setTimeout(() => {

        step++;

        if (step < sequence.length) {
            brand.textContent = sequence[step];
            brand.classList.add("show");
        }

    }, 180);
}


// Start with DATA
brand.textContent = sequence[0];
brand.classList.add("show");


// Run the sequence
setTimeout(nextBrandStep, 2000);  // Hi, I'm Noah → For Data Now
setTimeout(nextBrandStep, 3500);  // → Know Data
setTimeout(nextBrandStep, 5000);  // → KnowaData