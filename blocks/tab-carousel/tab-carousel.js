export default function decorate(block) {
    const cols = [...block.firstElementChild.children];
    block.classList.add(`tab-carousel-${cols.length}-cols`);
  
    // setup image tab-carousel
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const pic = col.querySelector('picture');
        if (pic) {
          const picWrapper = pic.closest('div');
          if (picWrapper && picWrapper.children.length === 1) {
            // picture is only content in column
            picWrapper.classList.add('tab-carousel-img-col');
          }
        }
      });
    });
}