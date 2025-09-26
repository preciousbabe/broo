const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute(
    "class",
    isOpen ? "ri-close-line" : "ri-menu-3-line"
  );
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-3-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
});
ScrollReveal().reveal("header form", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".service__card", {
  ...scrollRevealOption,
  interval: 500,
});

ScrollReveal().reveal(".experience__content .section__header", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".experience__content p", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".experience__btn", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".experience__stats", {
  ...scrollRevealOption,
  delay: 1500,
});

const swiper = new Swiper(".swiper", {
  slidesPerView: 2,
  spaceBetween: 20,
  loop: true,
});

ScrollReveal().reveal(".subscribe .section__header", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".subscribe form", {
  ...scrollRevealOption,
  delay: 500,
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const propertySection = document.getElementById('property');
  const swiperWrapper = document.querySelector('.swiper-wrapper');

  // Ensure there's a Swiper instance available as window.propertySwiper
  if (!window.propertySwiper && typeof Swiper !== 'undefined') {
    window.propertySwiper = new Swiper('.swiper', {
      slidesPerView: 1.1,
      spaceBetween: 16,
      loop: false,
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      },
    });
  }

  // Utility: clear scheduled auto-advance timeouts
  function clearAdvanceTimeouts() {
    if (window._propSearchTimeouts && window._propSearchTimeouts.length) {
      window._propSearchTimeouts.forEach(id => clearTimeout(id));
    }
    window._propSearchTimeouts = [];
  }

  // Main search handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAdvanceTimeouts();

    const rawLocation = document.getElementById('location').value.trim();
    const rawType = document.getElementById('propertyType').value.trim();
    const rawPrice = document.getElementById('price').value.trim();

    const locationInput = rawLocation.toLowerCase();
    const typeInput = rawType.toLowerCase();
    const priceInput = rawPrice === '' ? Infinity : parseFloat(rawPrice.replace(/[^0-9.]/g, ''));

    // Collect current slides (make an array copy)
    const slides = Array.from(document.querySelectorAll('.swiper-slide'));

    // Store original innerHTML for title/location (only once per slide)
    slides.forEach(slide => {
      const card = slide.querySelector('.property__card');
      if (!card) return;
      const titleEl = card.querySelector('h4');
      const locEl = card.querySelector('.property__location');
      if (titleEl && !slide.dataset.origTitle) slide.dataset.origTitle = titleEl.innerHTML;
      if (locEl && !slide.dataset.origLoc) slide.dataset.origLoc = locEl.innerHTML;
    });

    // Arrays to reorder
    const exactMatches = [];
    const similarMatches = [];
    const otherMatches = [];

    // Clear any previous inline search message
    const oldMsg = document.getElementById('searchMessage');
    if (oldMsg) oldMsg.remove();

    // Evaluate slides and categorize
    slides.forEach(slide => {
      const card = slide.querySelector('.property__card');
      if (!card) {
        otherMatches.push(slide);
        return;
      }

      const titleEl = card.querySelector('h4');
      const locEl = card.querySelector('.property__location');
      const priceEl = card.querySelector('.property__details__header h5');

      // Restore original markup before processing (removes prior highlights)
      if (slide.dataset.origTitle) titleEl.innerHTML = slide.dataset.origTitle;
      if (slide.dataset.origLoc) locEl.innerHTML = slide.dataset.origLoc;

      // Extract text for matching
      const titleText = titleEl.textContent.trim().toLowerCase();

      // For location, try to preserve icon HTML while getting just the textual part
      let origLocHTML = slide.dataset.origLoc || locEl.innerHTML;
      const iconMatch = origLocHTML.match(/^(\s*<span[^>]*>[\s\S]*?<\/span>)/i);
      const iconHTML = iconMatch ? iconMatch[1] : '';
      const locVisibleText = (origLocHTML.replace(iconHTML, '')).trim().toLowerCase();

      const priceText = (priceEl ? priceEl.textContent : '').replace(/[^0-9.]/g, '');
      const price = priceText ? parseFloat(priceText) : NaN;

      // Determine exact match
      let isExact = true;
      if (locationInput && !locVisibleText.includes(locationInput)) isExact = false;
      if (typeInput && !titleText.includes(typeInput)) isExact = false;
      if (priceInput !== Infinity && !isNaN(price) && price > priceInput) isExact = false;

      // Determine similar match criteria
      let isSimilar = false;
      if (!isExact) {
        if (locationInput) {
          const partial = locationInput.length >= 3 ? locationInput.slice(0, 3) : locationInput;
          if (locVisibleText.includes(partial)) isSimilar = true;
        }
        if (!isSimilar && typeInput) {
          const partialType = typeInput.length >= 3 ? typeInput.slice(0, 3) : typeInput;
          if (titleText.includes(partialType)) isSimilar = true;
        }
        if (!isSimilar && priceInput !== Infinity && !isNaN(price)) {
          if (priceInput > 0 && Math.abs(price - priceInput) / priceInput <= 0.3) isSimilar = true;
        }
      }

      if (isExact) {
        // Highlight location
        if (locationInput) {
          const highlightedLoc = locVisibleText.replace(
            new RegExp(locationInput.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'),
            (m) => `<span style="color:red;font-weight:bold;">${m}</span>`
          );
          locEl.innerHTML = iconHTML + ' ' + highlightedLoc;
        }

        // Highlight type
        if (typeInput) {
          const newTitleHTML = titleEl.textContent.replace(
            new RegExp(typeInput.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'),
            (m) => `<span style="color:red;font-weight:bold;">${m}</span>`
          );
          titleEl.innerHTML = newTitleHTML;
        }

        // Highlight price
        if (priceInput !== Infinity) {
          const priceTextRaw = priceEl.textContent;
          const priceRegex = new RegExp("\\$?\\s*[0-9,]+", "gi");
          const highlightedPrice = priceTextRaw.replace(
            priceRegex,
            (m) => `<span style="color:red;font-weight:bold;">${m}</span>`
          );
          priceEl.innerHTML = highlightedPrice;
        }

        exactMatches.push(slide);
      } else if (isSimilar) {
        similarMatches.push(slide);
      } else {
        otherMatches.push(slide);
      }
    });

    // 🚨 NEW: handle "no matches at all"
    if (exactMatches.length === 0 && similarMatches.length === 0) {
      const message = document.createElement('div');
      message.id = 'searchMessage';
      message.style.margin = '15px 0';
      message.style.padding = '10px';
      message.style.background = '#f8d7da';
      message.style.color = '#721c24';
      message.style.border = '1px solid #f5c6cb';
      message.style.borderRadius = '6px';
      message.textContent = 'No properties found matching your search. Please try different filters.';

      const swiperContainer = document.querySelector('.swiper');
      if (swiperContainer && swiperContainer.parentNode) {
        swiperContainer.parentNode.insertBefore(message, swiperContainer);
      }
    }

    // Build new ordered slide list
    const newOrder = [];
    const pushed = new Set();
    const pushSlide = (s) => { if (!pushed.has(s)) { newOrder.push(s); pushed.add(s); } };

    exactMatches.forEach(pushSlide);

    // Inline yellow message if only similar
    if (exactMatches.length === 0 && similarMatches.length > 0) {
      const message = document.createElement('div');
      message.id = 'searchMessage';
      message.style.margin = '15px 0';
      message.style.padding = '10px';
      message.style.background = '#fff3cd';
      message.style.color = '#856404';
      message.style.border = '1px solid #ffeeba';
      message.style.borderRadius = '6px';
      message.textContent = 'No exact matches found. Showing similar properties instead.';
      const swiperContainer = document.querySelector('.swiper');
      if (swiperContainer && swiperContainer.parentNode) {
        swiperContainer.parentNode.insertBefore(message, swiperContainer);
      }
    }

    if (similarMatches.length > 0) {
      const headingSlide = document.createElement('div');
      headingSlide.className = 'swiper-slide';
      headingSlide.dataset._searchHeading = '1';
      headingSlide.innerHTML = `<div style="padding:20px; text-align:center; font-weight:700; color:#444; background:#f7f7f7; border-radius:8px;">Similar Properties</div>`;
      pushSlide(headingSlide);

      similarMatches.forEach(pushSlide);
    }

    otherMatches.forEach(pushSlide);

    // Rebuild wrapper
    swiperWrapper.innerHTML = '';
    newOrder.forEach(node => swiperWrapper.appendChild(node));

    if (window.propertySwiper && typeof window.propertySwiper.update === 'function') {
      window.propertySwiper.update();
      window.propertySwiper.slideTo(0, 400);
    }

    if (propertySection) {
      propertySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Auto-scroll through slides
    clearAdvanceTimeouts();
    window._propSearchTimeouts = [];

    const totalSlides = newOrder.length;
    const advanceDelay = 1800;
    const initialDelay = 700;

    for (let i = 0; i < totalSlides; i++) {
      const timeoutId = setTimeout(() => {
        if (window.propertySwiper && typeof window.propertySwiper.slideTo === 'function') {
          window.propertySwiper.slideTo(i, 600);
        }
      }, initialDelay + i * advanceDelay);
      window._propSearchTimeouts.push(timeoutId);
    }

    const stopAutoAdvance = () => {
      clearAdvanceTimeouts();
      if (window.propertySwiper && window.propertySwiper.el) {
        window.propertySwiper.el.removeEventListener('pointerdown', stopAutoAdvance);
        try { window.propertySwiper.off('touchStart', stopAutoAdvance); } catch (e) {}
      }
    };

    if (window.propertySwiper && window.propertySwiper.el) {
      window.propertySwiper.el.addEventListener('pointerdown', stopAutoAdvance);
      try { window.propertySwiper.on('touchStart', stopAutoAdvance); } catch (e) {}
    }
  });
});




const qaPairs = {
  "What types of properties do you offer?": [
    "🏡 We’ve got everything from cozy apartments to luxury villas, cabins, and penthouses.",
    "✨ From apartments to villas, cabins, and even penthouses — we’ve got options for every lifestyle.",
    "Apartments, villas, cabins, penthouses… name it, and we probably have it available!"
  ],
  "How can I book a property?": [
    "📅 Simply select your desired property, choose your dates, and hit 'Reserve'.",
    "Booking is easy: pick your property, select your dates, and tap Reserve ✔️."
  ],
  "Is payment secure?": [
    "✅ Absolutely! Your payments are encrypted and fully secure.",
    "💳 Yes, all transactions are protected with top-level encryption."
  ],
  "Do you verify your listings?": [
    "🔍 Of course! Every property goes through a strict verification process for safety and authenticity.",
    "👍 Yes, we carefully verify each listing before it goes live."
  ],
  "Can I list my property here?": [
    "🏠 Definitely! Just click the 'Host' tab to start listing your property.",
    "Yes! Tap on the 'Host' section to begin listing your property today."
  ],
  "Do you offer support?": [
    "📞 Our support team is available 24/7 to help you anytime.",
    "🤝 Yes, we’re always here to support you, day or night."
  ],
  "Where are you located?": [
    "🌍 We’re a global platform, but our HQ is in Miami.",
    "Our team is worldwide, though our main office is in Miami."
  ],
  "What is the cancellation policy?": [
    "📌 Cancellation policies vary by property — check the listing page for details.",
    "It depends on the property. Each listing has its own cancellation rules."
  ],
  "Do you offer property management?": [
    "🛠️ Yes, we also provide property management services for hosts.",
    "We sure do! Property management is part of our services for hosts."
  ],
  "Is there a mobile app?": [
    "📱 Our mobile app is launching soon for both iOS and Android!",
    "🚀 We’re working on an app — it’ll be live soon on iOS & Android."
  ]
};

const suggestionsBox = document.getElementById("suggestions");
const input = document.getElementById("user-input");
const messages = document.getElementById("chat-messages");

// Helper: Add message
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Typing indicator
function addTypingIndicator() {
  const div = document.createElement("div");
  div.classList.add("message", "bot", "typing");
  div.innerHTML = "<span></span><span></span><span></span>";
  div.id = "typing-indicator";
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

// Send message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  suggestionsBox.style.display = "none";

  const normalize = str => str.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  const userNormalized = normalize(text);

  let reply = null;

  // Partial matching
  for (let question of Object.keys(qaPairs)) {
    const qNorm = normalize(question);
    if (userNormalized.includes(qNorm) || qNorm.includes(userNormalized)) {
      const answers = qaPairs[question];
      reply = Array.isArray(answers)
        ? answers[Math.floor(Math.random() * answers.length)]
        : answers;
      break;
    }
  }

  // Bot reply with typing effect
  addTypingIndicator();
  if (!reply) {
    setTimeout(() => {
      removeTypingIndicator();
      addMessage("🤔 Sorry, I don’t have an answer for that yet.", "bot");

      // WhatsApp button
      const btn = document.createElement("a");
      btn.href = "https://wa.me/2348144435485?text=Hello%20Real%20EstateX";
      btn.target = "_blank";
      btn.className = "whatsapp-btn";
      btn.innerHTML = "💬 Chat with Real EstateX on WhatsApp";
      const wrapper = document.createElement("div");
      wrapper.classList.add("message", "bot");
      wrapper.appendChild(btn);
      messages.appendChild(wrapper);
      messages.scrollTop = messages.scrollHeight;
    }, 1500);
  } else {
    setTimeout(() => {
      removeTypingIndicator();
      addMessage(reply, "bot");
    }, 1200);
  }
}

// Suggestions on typing
input.addEventListener("input", () => {
  const query = input.value.toLowerCase();
  suggestionsBox.innerHTML = "";
  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = Object.keys(qaPairs).filter(q =>
    q.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach(match => {
    const div = document.createElement("div");
    div.innerText = match;
    div.onclick = () => {
      input.value = match;
      suggestionsBox.style.display = "none";
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
});

// Enter key to send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});