const getId = (function getId() {
    const ids = {};
    return (name) => {
        ids[name] = ids[name] || 0;
        const idSuffix = ids[name] ? `-${ids[name]}` : '';
        ids[name] += 1;
        return `${name}${idSuffix}`;
    };
}());

async function fetchData(url) {
    const resp = await fetch(url);
    const json = await resp.json();
    return json.data.map((fd) => ({
        ...fd,
        Id: fd.Id || getId(fd.Name),
        Value: fd.Value || '',
    }));
}

async function fetchForm(pathname) {
    const jsonData = await fetchData(pathname);
    return jsonData;
}

let dataItems;
let currentPage = 1;
const itemsPerPage = 10;
const container = document.querySelector(".load-more");
const btnContainer = document.querySelector(".load-more-container");


async function createForm(formURL) {
    const { pathname } = new URL(formURL);
    dataItems = await fetchForm(pathname);
    return dataItems;
}

function loadListItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToLoad = dataItems.slice(startIndex, endIndex);
    itemsToLoad.forEach((fd) => {
        container.innerHTML += `<div class="field-wrapper"><a href="${fd.Value}" target="_blank">${fd.Label}</a></div>`;
    });
    currentPage++;

    if (endIndex >= dataItems.length) {
        document.querySelector("#loadMoreBtn").style.display = "none"
    }
}

// Load initial items
setTimeout(() => {
    loadListItems();
    let loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Load More';
    loadMoreButton.id = "loadMoreBtn";
    btnContainer.appendChild(loadMoreButton);
    document.addEventListener("click", function (e) {
        const target = e.target.closest("#loadMoreBtn");
        if (target) {
            loadListItems();
        }
    });
}, 4000);

// Initial load on page load
export default async function decorate(block) {
    const formLink = block.querySelector('a[href$=".json"]');
    if (formLink) {
        const form = await createForm(formLink.href);
        formLink.replaceWith(form);
    }
}