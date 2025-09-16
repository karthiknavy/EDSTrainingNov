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
}

document.addEventListener("DOMContentLoaded", function () {
    const accordionContainer = document.querySelector(".mg-motors-accordion");
    if (!accordionContainer) return;

    const accordionItems = accordionContainer.querySelectorAll(".accordion-item");

    // Close all accordion items except the first one
    accordionItems.forEach((item, index) => {
        if (index !== 0) {
            item.removeAttribute("open");
        }
    });

    // Add click event listener to each accordion item
    accordionItems.forEach(item => {
        item.addEventListener("click", function () {
            // Close all accordion items except the clicked one
            accordionItems.forEach(i => {
                if (i !== this) {
                    i.removeAttribute("open");
                }
            });

            // Toggle the open state of the clicked accordion item
            if (!this.hasAttribute("open")) {
                this.setAttribute("open", "");
            } else {
                this.removeAttribute("open");
            }
        });
    });
});
