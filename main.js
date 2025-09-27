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
  // 🏠 About Properties
  "Do you have houses for sale?": [
    "🏡 Yes! We regularly list houses for sale in different sizes and budgets.",
    "Absolutely — we’ve got houses for sale across multiple locations."
  ],
  "Do you have apartments for rent?": [
    "🏢 Yes, we have apartments available for both short-term and long-term rent.",
    "✔️ You’ll find a wide selection of rental apartments on our platform."
  ],
  "What kind of properties do you deal with?": [
    "From apartments, houses, and land to luxury villas — we cover all property types.",
    "✨ We handle sales and rentals for apartments, homes, land, and even commercial spaces."
  ],
  "Do you handle commercial properties?": [
    "🏢 Yes, we list offices, shops, and warehouses available for sale and rent.",
    "Absolutely — commercial spaces are part of our portfolio."
  ],
  "Do you offer luxury properties?": [
    "🌟 Yes, we have premium listings including villas, penthouses, and luxury estates.",
    "From high-end apartments to beachfront villas — we’ve got luxury options too."
  ],

  // 📅 Viewings & Tours
  "How can I schedule a viewing?": [
    "📅 Simply pick a property you like and request a viewing directly from the listing.",
    "You can book a viewing by contacting the agent on the property details page."
  ],
  "Do you offer virtual tours?": [
    "🖥️ Yes, many of our listings include 3D virtual tours.",
    "Some properties come with virtual tours — look for the 🎥 icon on the listing."
  ],
  "Can I visit multiple properties in one day?": [
    "Yes, our agents can arrange back-to-back viewings for your convenience.",
    "Of course — just let us know which properties interest you and we’ll schedule accordingly."
  ],

  // 💰 Pricing & Costs
  "What’s the price range of your listings?": [
    "💰 Our listings range from affordable starter homes to luxury estates.",
    "We have properties for every budget — from entry-level to high-end."
  ],
  "Do you charge commission?": [
    "Our commission depends on the property type and agreement — details are shared upfront.",
    "✔️ Yes, but all fees are transparent and explained before you proceed."
  ],
  "What are your agent fees?": [
    "Agent fees vary, but they’re always stated clearly before any deal is closed.",
    "Our agent fees are competitive and disclosed upfront."
  ],
  "Do you help with mortgages or financing?": [
    "🏦 Yes, we connect clients with trusted mortgage and financing partners.",
    "We can guide you through financing options and mortgage assistance."
  ],
  "Are there hidden charges?": [
    "❌ No hidden charges — we believe in transparent pricing.",
    "Everything is disclosed upfront; there are no surprise fees."
  ],

  // 📍 Location & Availability
  "Which areas do you cover?": [
    "🌍 We cover multiple neighborhoods and cities — check our listings to see available areas.",
    "Our network spans across different regions — you can filter by your preferred location."
  ],
  "Do you have properties in [city/area]?": [
    "🏠 Yes, we often list properties in that area. Try searching by city name.",
    "We do! Use the search bar and filter by location to find properties in your area of interest."
  ],
  "Can I buy land through your company?": [
    "🌱 Absolutely — we also list lands available for purchase.",
    "Yes, land sales are part of our services."
  ],
  "Do you deal with new developments?": [
    "🏗️ Yes, we feature brand new builds and off-plan projects.",
    "We partner with developers to bring you the latest new projects."
  ],

  // 📱 Services & Apps
  "Is there a mobile app?": [
    "📱 Our mobile app is launching soon for iOS & Android!",
    "🚀 We’re working on a user-friendly app — stay tuned!"
  ],
  "How do I sign up on your platform?": [
    "📝 Click the Sign Up button at the top right and follow the steps.",
    "Just tap ‘Sign Up’, fill in your details, and you’re good to go!"
  ],
  "Can I search properties online?": [
    "🔎 Yes, you can search and filter properties directly on our website.",
    "✔️ Absolutely! Use the search tool to find exactly what you’re looking for."
  ],

  // 📞 Support & Contact
  "How do I contact an agent?": [
    "📞 Each property page has agent contact details — you can call or message directly.",
    "Simply go to the property listing and click ‘Contact Agent’."
  ],
  "Do you offer 24/7 support?": [
    "🕑 Yes, our support team is available around the clock.",
    "✔️ We provide 24/7 support for all your inquiries."
  ],
  "Can I talk to someone directly?": [
    "🤝 Of course! You can call us anytime or use our live chat.",
    "Yes, our agents are just a phone call away."
  ],

  // 📑 Paperwork & Legal
  "Do you help with paperwork?": [
    "📑 Yes, we guide you through all the required paperwork and documentation.",
    "Absolutely — our team assists with contracts, agreements, and all legal documents."
  ],
  "What documents do I need to buy a property?": [
    "📝 Usually you’ll need an ID, proof of income, and in some cases, a financing approval letter. We’ll guide you step by step.",
    "The documents depend on the property, but generally include ID, proof of funds, and signed agreements."
  ],
  "Do you handle legal documentation?": [
    "⚖️ Yes, we work with trusted legal experts to make sure your paperwork is safe and valid.",
    "We coordinate with lawyers and notaries to ensure all documentation is handled properly."
  ],

  // 📝 Other Practical Questions
  "How long does the buying process take?": [
    "⏳ It depends on the property and paperwork, but most deals close within a few weeks.",
    "On average, the buying/renting process takes a few days to a few weeks depending on requirements."
  ],
  "Do you help first-time buyers?": [
    "🎉 Yes, we provide extra support and guidance for first-time homebuyers.",
    "Buying your first home? Don’t worry — our agents walk you through every step."
  ],

  // 🏠 Renting
  renting: [
    "🏘️ We have plenty of rental options for short-term and long-term stays.",
    "Yes, from budget-friendly rentals to premium apartments — we cover all."
  ],
  "Do you help with furnished apartments?": [
    "🛋️ Yes, we list fully-furnished, semi-furnished, and unfurnished apartments.",
    "We’ve got furnished rentals — perfect for quick move-ins."
  ],

  // 🛒 Buying
  buying: [
    "🏡 You can buy houses, land, and even commercial properties on our platform.",
    "Buying is simple — browse listings, book a viewing, and proceed with secure payments."
  ],

  // 💼 Selling
  selling: [
    "📢 Yes, we help owners list and sell their properties quickly.",
    "Our agents ensure your property gets maximum exposure and the best deal."
  ],
  "Can I list my property with you?": [
    "✅ Absolutely! Property owners can list directly through our platform.",
    "Yes, just head to the 'List Property' section and upload your details."
  ],
  "How fast can you sell my property?": [
    "⏱️ Speed depends on location, pricing, and demand — but we work hard to sell quickly.",
    "Many listings get interest within days thanks to our wide reach."
  ]
};

// --- Synonym & intent normalization ---
function detectIntent(text) {
  text = text.toLowerCase();

  // App synonyms
  if (/app|mobile|application|download/.test(text)) return "Is there a mobile app?";

  // Pricing synonyms
  if (/price|cost|fee|charge|commission/.test(text)) return "What’s the price range of your listings?";

  // Paperwork synonyms
  if (/paperwork|document|docs|agreement|legal/.test(text)) return "Do you help with paperwork?";

  // Location synonyms
  if (/location|where|area|city|site|region/.test(text)) return "Which areas do you cover?";

  // Support synonyms
  if (/support|help|contact|phone|call|customer service/.test(text)) return "How do I contact an agent?";

  // Agent synonyms
  if (/agent|realtor|staff|representative|broker/.test(text)) return "How do I contact an agent?";

  // Renting synonyms
  if (/rent|lease|tenant/.test(text)) return "renting";

  // Buying synonyms
  if (/buy|purchase|acquire|own/.test(text)) return "buying";

  // Selling synonyms
  if (/sell|listing|post property/.test(text)) return "selling";

  return null;
}


const suggestionsBox = document.getElementById("suggestions");
const input = document.getElementById("user-input");
const messages = document.getElementById("chat-messages");

// --- Fuse.js setup ---
const fuse = new Fuse(Object.keys(qaPairs), {
  includeScore: true,
  threshold: 0.4 // lower = stricter matching
});

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

  let reply = null;

  // --- Try regex intent detection first ---
  const intentKey = detectIntent(text);
  if (intentKey && qaPairs[intentKey]) {
    const answers = qaPairs[intentKey];
    reply = Array.isArray(answers)
      ? answers[Math.floor(Math.random() * answers.length)]
      : answers;
  } else {
    // --- Fall back to Fuse.js ---
    const result = fuse.search(text);
    if (result.length > 0) {
      const bestMatch = result[0].item;
      const answers = qaPairs[bestMatch];
      reply = Array.isArray(answers)
        ? answers[Math.floor(Math.random() * answers.length)]
        : answers;
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

  const matches = fuse.search(query).map(r => r.item);

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
