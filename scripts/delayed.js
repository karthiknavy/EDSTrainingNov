// add delayed functionality here

// tab carousel script starts here
const divs = document.querySelectorAll('.main-image.has-it-all-cont .tab-carousel-2-cols > div');
divs.forEach((div, index) => {
    if (index !== 0) {
        div.classList.add('hidden');
    }
});

const li = document.querySelectorAll('.tab-section.has-it-all .default-content-wrapper ul li');
li.forEach((listItem, index) => {
    if (index === 0) {
        listItem.classList.add('active');
    }
});

const imgLists = document.querySelectorAll('.has-it-all-cont .default-content-wrapper > ul > li picture');
imgLists.forEach((picture, index) => {
    if (index === 0 || index === imgLists.length-1) {
        picture.classList.add('active');
    }
});

const contentDivs = document.querySelectorAll('.has-it-all-cont');
contentDivs.forEach((div, index) => {
    if (index === 0) {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }
});

document.querySelectorAll('.main-image.has-it-all-cont li picture').forEach((image, index) => {
    image.addEventListener('click', function() {
        const currentActivePicture = document.querySelector('.main-image.has-it-all-cont li picture.active');
        if (currentActivePicture) {
            currentActivePicture.classList.remove('active');
        }
        this.classList.add('active');

        const section = image.closest('.main-image.has-it-all-cont');

        const divsToToggle = section.querySelectorAll(' .tab-carousel-2-cols > div');

        divsToToggle.forEach((div, i) => {
            if (i === index) {
                div.classList.remove('hidden');
            } else {
                div.classList.add('hidden');
            }
        });
    });
});

document.querySelectorAll('.tab-section.has-it-all .default-content-wrapper ul li').forEach((tab, index) => {
    tab.addEventListener('click', function() {
        const clickedTab = this;

        if (window.innerWidth < 992) {
            if (clickedTab.classList.contains('active')) {
                document.querySelectorAll('.tab-section.has-it-all .default-content-wrapper ul li').forEach((t) => {
                    t.style.display = t.style.display === 'block' ? 'block' : 'block';
                });
                return;
            } else {
                document.querySelectorAll('.tab-section.has-it-all .default-content-wrapper ul li').forEach((t) => {
                    t.style.display = 'none';
                });
                clickedTab.style.display = 'block';
            }
        }

        if (!clickedTab.classList.contains('active')) {
            const currentActiveTab = document.querySelector('.tab-section.has-it-all .default-content-wrapper ul li.active');
            if (currentActiveTab) {
                currentActiveTab.classList.remove('active');
            }
            clickedTab.classList.add('active');
        }

        const content = tab.textContent.toLowerCase().replace(/\s/g, '-');

        document.querySelectorAll('.has-it-all-cont').forEach((panel) => {
            panel.style.display = 'none';
        });

        const targetPanel = document.querySelector('.has-it-all-cont.' + content);
        if (targetPanel) {
            targetPanel.style.display = 'block';
        }
    });
}); 

// tab carousel script ends here
