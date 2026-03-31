let dataItems;
async function fetchData(url) {
  const resp = await fetch(url);
  const json = await resp.json();
  return json.data;
}

async function fetchForm(pathname) {
  const jsonData = await fetchData(pathname);
  return jsonData;
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  dataItems = await fetchForm(pathname);
  return dataItems;
}

// Initial load on page load
export default async function decorate(block) {
  const formLink = block.querySelector('a[href$=".json"]');
  if (formLink) {
      const form = await createForm(formLink.href);
      formLink.replaceWith(form);
  }
}

function loadDropDown() {
  let listVal = [];
  if (dataItems.length > 0) {
    for(let product of dataItems) {
      let category = product.category;
      if(category) {
        let categoryVal = category.split(',');
        
        for (let color of categoryVal) {
          console.log(color);
          if(listVal.indexOf(color) === -1) {
            listVal.push(color);
          }
        }       
      }
    }
    console.log(listVal);
    for (let value of listVal) {
      $('body #filter-select').append('<option value="' + value + '"> ' + value + '</option>');
    }
  }
}

function LoadProducts() {
  if (dataItems.length > 0) {
    for(let product of dataItems) {
      console.log(product);
      let productTitle = product.productname;
      let productLink = product.url;
      let ProductImg = product.image;
      $('body #filter-results .row').append(`<div class="product-list">
      <a href="${productLink}" target="_blank">
      <div class="product-image"><img src="${ProductImg}" alt="product image" /></div>
      <div class="product-body"><h3 class="product-title">${productTitle}</h3></div>
      </a>
      </div>`);
    }
  }
}
// Load initial items
setTimeout(() => {
  let $filterEle = $('.filter-tags');
  $filterEle.append('<select name="colors" id="filter-select"><option>select Color</option></select>');
 loadDropDown();
 $filterEle.append('<div id="tags"></div>');
 $filterEle.append('<div id="filter-results"><div class="row"></div></div>');
 LoadProducts();
 localStorage.removeItem('myList');
}, 2000);

function addTags(selectedVal) {
  let currentList = JSON.parse(localStorage.getItem("myList")) || [];
  if (currentList.indexOf(selectedVal) === -1) {
    currentList.push(selectedVal);
    localStorage.setItem("myList", JSON.stringify(currentList));
    console.log(currentList)
    $('body #tags').append('<button type="button" class="tag-list">' + selectedVal + '<span class="close"></span></button>');
  }
  
}

function filterProduct() {
  let currentList = JSON.parse(localStorage.getItem("myList"));
  $('body #filter-results .row').empty();
  if (currentList.length > 0) {
    for(let product of dataItems) {
      console.log(product);
      let productTitle = product.productname;
      let productLink = product.url;
      let ProductImg = product.image;
      let category = product.category;
      if(category) {
        let categoryVal = category.split(',');
        for (let color of categoryVal) {
          if(currentList.includes(color)) {
            $('body #filter-results .row').append(`<div class="product-list">
            <a href="${productLink}" target="_blank">
            <div class="product-image"><img src="${ProductImg}" alt="product image" /></div>
            <div class="product-body"><h3 class="product-title">${productTitle}</h3></div>
            </a>
            </div>`);
            break;
          }
        }
      }
    }
  } else {
    LoadProducts();
  }
}

$(document).on('change', '#filter-select', function() {
  let selectedVal = $(this).val();
  console.log(selectedVal);
  addTags(selectedVal);
  setTimeout(function() {
    filterProduct();
  }, 100);
});

$(document).on('click', '.tag-list .close', function() {
  let tagValue = $(this).parent().text();
  let currentList = JSON.parse(localStorage.getItem("myList"));
  var index = $.inArray(tagValue, currentList);
  if (index !== -1) {
    currentList.splice(index, 1);
  }
  localStorage.setItem("myList", JSON.stringify(currentList));
  $(this).parent().remove();
  setTimeout(function() {
    filterProduct();
  }, 100);
});