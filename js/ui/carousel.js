/**
 * startCarousel - Inicia o carrossel de imagens para um local.
 */
export function startCarousel(locationName) {
  const images = getImagesForLocation(locationName);
  if (!images || images.length === 0) {
    alert('Nenhuma imagem disponível para o carrossel.');
    return;
  }
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  swiperWrapper.innerHTML = '';
  images.forEach((src) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `<img src="${src}" alt="${locationName}" style="width: 100%; height: 100%;">`;
    swiperWrapper.appendChild(slide);
  });
  showModal('carousel-modal');
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  swiperInstance = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
  console.log('startCarousel: Carrossel iniciado para', locationName);
}
