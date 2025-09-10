/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
    [...block.children].forEach((row) => {
      // decorate accordion item label
      const label = row.children[0];
      const summary = document.createElement('summary');
      summary.className = 'accordion-item-label';
      summary.append(...label.childNodes);
      // decorate accordion item body
      const body = row.children[1];
      body.className = 'accordion-item-body';
      // decorate accordion item
      const details = document.createElement('details');
      details.className = 'accordion-item';
      details.append(summary, body);
      row.replaceWith(details);
    });

  // Function to initialize tabs for a given accordion item
  function initializeTabs(accordionBody, accordionIndex) {
    const paragraphs = accordionBody.querySelectorAll('p');
    const brochure = accordionBody.querySelectorAll('h3');
    const lists = accordionBody.querySelectorAll('ul');
  
    const tabTitlesContainer = document.createElement('div');
    tabTitlesContainer.classList.add('tab-titles');
  
    const tabContentsContainer = document.createElement('div');

    const tabButtonContainer = document.createElement('div');
    tabButtonContainer.classList.add('tab-button');
  
    paragraphs.forEach((p, index) => {
      // Create tab titles
      const tabTitle = document.createElement('p');
      tabTitle.classList.add('tab-title');
      tabTitle.textContent = p.textContent;
  
      // Generate a unique tab id using accordionIndex
      const uniqueTabId = `tab${accordionIndex}-${index}`;
  
      tabTitle.setAttribute('data-tab', uniqueTabId);
      tabTitlesContainer.appendChild(tabTitle);
  
      // Create tab content
      const tabContent = document.createElement('div');
      tabContent.classList.add('tab-content');
      tabContent.setAttribute('id', uniqueTabId);
      tabContent.appendChild(lists[index].cloneNode(true));
      tabContentsContainer.appendChild(tabContent);
    });

    brochure.forEach((h3, index) => {
      tabButtonContainer.appendChild(brochure[index].cloneNode(true));
    });
  
    // Clear existing content and append new tabs
    accordionBody.innerHTML = '';
    accordionBody.appendChild(tabTitlesContainer);
    accordionBody.appendChild(tabContentsContainer);
    accordionBody.appendChild(tabButtonContainer);
  
    // Set the first tab as active by default
    const firstTabTitle = tabTitlesContainer.querySelector('.tab-title');
    const firstTabContent = tabContentsContainer.querySelector('.tab-content');
    if (firstTabTitle && firstTabContent) {
      firstTabTitle.classList.add('active');
      firstTabContent.classList.add('active');
    }
  
    // Add click event listener for switching tabs
    tabTitlesContainer.addEventListener('click', function (event) {
      const clickedTab = event.target;
      if (clickedTab.classList.contains('tab-title')) {
        const selectedTabId = clickedTab.getAttribute('data-tab');
  
        // Remove active class from all titles and contents
        tabTitlesContainer.querySelectorAll('.tab-title').forEach(tab => tab.classList.remove('active'));
        tabContentsContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
        // Add active class to the clicked tab and corresponding content
        clickedTab.classList.add('active');
        document.getElementById(selectedTabId).classList.add('active');
      }
    });
  }
  
  // Initialize all accordion items
  document.querySelectorAll('.mg-motors-accordion .accordion-item').forEach((accordionItem, index) => {
    const accordionBody = accordionItem.querySelector('.mg-motors-accordion .accordion-item .accordion-item-body');
    initializeTabs(accordionBody, index);
  });

  var techSpecHdng = document.querySelector(".mg-motors-keytitle div[data-align]");
  var accordionWrap = document.querySelector('.mg-motors-spec-accordion .accordion-wrapper');
  if (window.innerWidth < 900) {
    accordionWrap.insertBefore(techSpecHdng, accordionWrap.firstChild);
  }

}


