function loadTicker() {     
    screen = 1;
    fetch('./data/ticker.txt')
        .then(response => response.text())
        .then(text => {
            tickerDisplay = text.split('\n');
            sideTitle.innerText = "Announcements";
            sideInfo.innerHTML = "";
            for (let i = 0; i < tickerDisplay.length; i++) {
                sideInfo.innerHTML += `
                  <li class="flex justify-between mb-4 text-[30px]"><span>${tickerDisplay[i]}</span></li>
                `
            }
            setTimeout(scrollToBottom, 2500);
        })
        .catch(error => console.error('Error:', error));
}
// Function to fetch new images from the /images folder
async function fetchImages() {
    try {
        const response = await fetch('./images/');
        if (response.ok) {
            const text = await response.text();

            // Parse the HTML content of the folder listing
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));

            // Extract valid .jpeg or .jpg image URLs
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.endsWith('.jpeg') || href.endsWith('.jpg'))) {
                    const imagePath = `./images/${href}`;
                    if (!images.includes(imagePath)) {
                        images.push(imagePath);
                    }
                }
            });
        } else {
            console.error('Failed to fetch image directory');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function updateSlideshow() {
    if (images.length === 0) return;

    // Remove the active class from the current image
    const currentImage = slideshowElement.querySelector('img.active');
    if (currentImage) {
        currentImage.classList.remove('active');
    }

    // Get the next image
    currentIndex = (currentIndex + 1) % images.length;
    let nextImage = slideshowElement.querySelector(`img[data-src="${images[currentIndex]}"]`);

    // If the image doesn't exist, create it
    if (!nextImage) {
        nextImage = document.createElement('img');
        nextImage.dataset.src = images[currentIndex];
        nextImage.src = images[currentIndex];
        slideshowElement.appendChild(nextImage);
    }

    // Add the active class to the next image
    nextImage.classList.add('active');
}




