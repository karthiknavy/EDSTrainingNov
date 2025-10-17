const paragraphs = document.querySelectorAll('.skill-bar-arrows p');
paragraphs.forEach(function(p) {
    console.log(p.textContent);
    if (p.textContent.trim() === "+") {
        p.classList.add('increse');
    } else {
        p.classList.add('decrese');
    }
});


let increseArrows = document.querySelectorAll('.skill-bar-arrows p.increse');
let decreseArrows = document.querySelectorAll('.skill-bar-arrows p.decrese');
increseArrows.forEach(function(arrow) {
    arrow.addEventListener('click', function() {
        const element = document.querySelector('.skill-bar div');
        const parent = element.parentElement;

        const elementWidth = element.offsetWidth;
        const parentWidth = parent.offsetWidth;

        const widthPercentage = (elementWidth / parentWidth) * 100;
        let newWidthPercentage = widthPercentage + 10;
        document.querySelector(".skill-bar div").style.width = newWidthPercentage + "%";
    });
});

decreseArrows.forEach(function(arrow) {
    arrow.addEventListener('click', function() {
        const element = document.querySelector('.skill-bar div');
        const parent = element.parentElement;

        const elementWidth = element.offsetWidth;
        const parentWidth = parent.offsetWidth;

        const widthPercentage = (elementWidth / parentWidth) * 100;
        let newWidthPercentage = widthPercentage - 10;
        document.querySelector(".skill-bar div").style.width = newWidthPercentage + "%";
    });
});
