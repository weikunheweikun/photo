(function () {
  const track = document.querySelector('.gallery-track');
  const prevBtn = document.querySelector('.gallery-btn.prev');
  const nextBtn = document.querySelector('.gallery-btn.next');
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const container = document.querySelector('.gallery-container');

  let currentIndex = 0;

  function updateGallery() {
    const style = getComputedStyle(items[0]);
    const marginLeft = parseFloat(style.marginLeft);
    const marginRight = parseFloat(style.marginRight);
    const itemWidth = items[0].getBoundingClientRect().width + marginLeft + marginRight;

    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.floor(containerWidth / itemWidth);

    // 最大索引 = 总图片数 - 可见图片数
    const maxIndex = Math.max(0, items.length - visibleCount);

    // 限制 currentIndex
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    // 平滑移动
    const offset = -currentIndex * itemWidth;
    track.style.transform = `translateX(${offset}px)`;

    // 按钮状态
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    currentIndex--;
    updateGallery();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex++;
    updateGallery();
  });

  window.addEventListener('resize', updateGallery);
  window.addEventListener('load', updateGallery);

  updateGallery();
})();


 (function () {
  const track = document.querySelector('.gallery-track');
  const prevBtn = document.querySelector('.gallery-btn.prev');
  const nextBtn = document.querySelector('.gallery-btn.next');
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const container = document.querySelector('.gallery-container');

  let currentTranslate = 0;   // 当前位移
  let prevTranslate = 0;      // 上一次位移
  let startX = 0;             // touchstart 初始位置
  let isDragging = false;
  let animationID;

  // 获取每张图片宽度 + 间距
  function getItemWidth() {
    const style = getComputedStyle(items[0]);
    const marginLeft = parseFloat(style.marginLeft);
    const marginRight = parseFloat(style.marginRight);
    return items[0].getBoundingClientRect().width + marginLeft + marginRight;
  }

  // 最大可移动距离
  function getMaxTranslate() {
    const itemWidth = getItemWidth();
    const containerWidth = container.getBoundingClientRect().width;
    const totalWidth = itemWidth * items.length;
    return Math.max(0, totalWidth - containerWidth);
  }

  // 设置 transform
  function setSliderPosition() {
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  // touch 开始
  function touchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = 'none';
    animationID = requestAnimationFrame(animation);
  }

  // touch 移动
  function touchMove(e) {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    let diff = currentX - startX;
    let nextTranslate = prevTranslate + diff;

    // 阻尼处理：超出左边界或右边界时减半移动距离
    const maxTranslate = getMaxTranslate();
    if (nextTranslate > 0) {
      nextTranslate *= 0.3;  // 左边界阻尼
    } else if (Math.abs(nextTranslate) > maxTranslate) {
      nextTranslate = -maxTranslate + (nextTranslate + maxTranslate) * 0.3; // 右边界阻尼
    }

    currentTranslate = nextTranslate;
  }

  // touch 结束
 function touchEnd() {
  isDragging = false;
  cancelAnimationFrame(animationID);

  const maxTranslate = getMaxTranslate();

  // 超出左边界
  if (currentTranslate > 0) {
    currentTranslate = 0;
  } 
  // 超出右边界
  else if (Math.abs(currentTranslate) > maxTranslate) {
    currentTranslate = -maxTranslate;
  }

  prevTranslate = currentTranslate;

  track.style.transition = 'transform 0.3s ease'; // 平滑回弹
  setSliderPosition();
}


  // 桌面端按钮滑动（可选）
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const itemWidth = getItemWidth();
      currentTranslate = Math.min(prevTranslate + itemWidth, 0); // 不超左边界
      prevTranslate = currentTranslate;
      track.style.transition = 'transform 0.5s ease';
      setSliderPosition();
    });

    nextBtn.addEventListener('click', () => {
      const itemWidth = getItemWidth();
      const maxTranslate = getMaxTranslate();
      currentTranslate = Math.max(prevTranslate - itemWidth, -maxTranslate); // 不超右边界
      prevTranslate = currentTranslate;
      track.style.transition = 'transform 0.5s ease';
      setSliderPosition();
    });
  }

  // 事件绑定
  container.addEventListener('touchstart', touchStart);
  container.addEventListener('touchmove', touchMove);
  container.addEventListener('touchend', touchEnd);

  window.addEventListener('resize', () => {
    // resize 后确保不超边界
    const maxTranslate = getMaxTranslate();
    if (Math.abs(currentTranslate) > maxTranslate) {
      currentTranslate = -maxTranslate;
      prevTranslate = currentTranslate;
      track.style.transition = 'transform 0.5s ease';
      setSliderPosition();
    }
  });

  // 初始化
  currentTranslate = 0;
  prevTranslate = 0;
  setSliderPosition();
})();

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = lightbox.querySelector('.close');
  const lbOverlay = lightbox.querySelector('.lb-overlay');
  const btnPrev = lightbox.querySelector('.lb-prev');
  const btnNext = lightbox.querySelector('.lb-next');

  let currentGroup = [];
  let currentIndex = 0;

  function bindSelector(selector) {
    const nodes = Array.from(document.querySelectorAll(selector));
    nodes.forEach((imgEl, i) => {
      imgEl.style.cursor = 'zoom-in';
      imgEl.addEventListener('click', () => openLightbox(i, nodes));
    });
  }

  bindSelector('.gallery-item img');
  bindSelector('.portfolio-item img');
  bindSelector('.series-gallery img');
function preventScroll(e) {
  e.preventDefault();
}


  function openLightbox(index, group) {
    currentGroup = group;
    currentIndex = index;
    showImage();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 阻止背景滑动
    document.addEventListener('touchmove', preventScroll, { passive: false });
  }

function closeLightbox() {
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
  
  // 恢复背景滑动
  document.removeEventListener('touchmove', preventScroll, { passive: false });
  
  lbImg.src = '';
}

function showImage() {
  lbImg.src = currentGroup[currentIndex].dataset.full || currentGroup[currentIndex].src;

  // 根据当前语言选择标题
  const title = currentLang === "zh" 
      ? currentGroup[currentIndex].dataset.title || "" 
      : currentGroup[currentIndex].dataset.enTitle || "";

  // 使用 innerHTML 支持斜体等 HTML 标签
  document.getElementById("lightbox-title").innerHTML = title;
}



  function changeSlide(step) {
    if (!currentGroup.length) return;
    const newIndex = currentIndex + step;
    if (newIndex < 0 || newIndex >= currentGroup.length) return;

    const img = lbImg;
    img.style.transform = `translateX(${-step * 80}px)`;
    img.style.opacity = "0";

    setTimeout(() => {
      currentIndex = newIndex;
      
      showImage();
      img.src = currentGroup[currentIndex].dataset.full || currentGroup[currentIndex].src;

      img.style.transition = "none";
      img.style.transform = `translateX(${step * 80}px)`;
      img.style.opacity = "0";

      setTimeout(() => {
        img.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        img.style.transform = "translateX(0)";
        img.style.opacity = "1";
      }, 50);
    }, 300);
  }

  btnPrev.addEventListener("click", () => changeSlide(-1));
  btnNext.addEventListener("click", () => changeSlide(1));
  lbClose.addEventListener("click", closeLightbox);
  lbOverlay.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", e => {
    if (lightbox.style.display !== 'flex') return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
  });

  // 手机滑动
  let startX = 0;
  lightbox.addEventListener("touchstart", e => startX = e.touches[0].clientX);
  lightbox.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) changeSlide(diff > 0 ? -1 : 1);
  });
});


const langBtn = document.getElementById("english-link");
let currentLang = "zh"; // 默认中文

langBtn.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";

  document.querySelectorAll("[data-zh][data-en]").forEach(el => {
    if (currentLang === "zh") {
      el.textContent = el.dataset.zh; // 中文用 textContent
    } else {
      el.innerHTML = el.dataset.en;   // 英文可以用 HTML
    }
  });

  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg.src) {
    const imgEl = document.querySelector(`img[src="${lightboxImg.src}"]`);
    if (imgEl) {
      if (currentLang === "zh") {
        document.getElementById("lightbox-title").textContent = imgEl.dataset.title;
      } else {
        document.getElementById("lightbox-title").innerHTML = imgEl.dataset.enTitle;
      }
    }
  }
});

