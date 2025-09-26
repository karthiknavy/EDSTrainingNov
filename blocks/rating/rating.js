window.onload = function () {
    const ratingBlock = document.querySelector(".rating.block");
  
    // Get the <code> elements inside <p>
    const codeBlocks = ratingBlock?.querySelectorAll("p code");
    const starCode = codeBlocks?.[0];
    const ratingText = codeBlocks?.[1];
  
    if (starCode && ratingText) {
      const stars = starCode.textContent.trim().split(" ");
      let selectedRating = 0;
  
      // Replace text with span elements
      starCode.innerHTML = stars.map((_, i) => `<span class="star" data-value="${i + 1}">&#9733;</span>`).join(" ");
  
      const starElements = starCode.querySelectorAll(".star");
  
      starElements.forEach(star => {
        star.addEventListener("mouseover", () => {
          const val = parseInt(star.dataset.value);
          updateClasses(val, true);
        });
  
        star.addEventListener("mouseout", () => {
          updateClasses(selectedRating, false);
        });
  
        star.addEventListener("click", () => {
          selectedRating = parseInt(star.dataset.value);
          ratingText.textContent = `Rating: ${selectedRating}`;
          updateClasses(selectedRating, false);
        });
      });
  
      function updateClasses(rating, isHovering) {
        starElements.forEach(star => {
          const val = parseInt(star.dataset.value);
          star.classList.remove("hover", "selected");
          if (val <= rating) {
            star.classList.add("selected");
            if (isHovering) {
              star.classList.add("hover");
            }
          }
        });
      }
    }
  };
  