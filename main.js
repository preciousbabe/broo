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
  "🏡 Yes, we do. We regularly list houses for sale in different sizes, styles, and price ranges. Whether you’re looking for a starter home, a family house, or something more upscale, we’ll help you find options that match your budget and preferred location.",
],
"Do you have apartments for rent?": [
  "🏢 Absolutely. We have apartments available for both short-term and long-term rent. Some are fully furnished for quick move-ins, while others are unfurnished so you can set them up to your taste. You can choose based on your budget and the area you prefer.",
],
"What kind of properties do you deal with?": [
  "✨ We handle a wide range of properties — from apartments and houses to land, luxury villas, and even commercial spaces like shops and offices. Basically, if it’s real estate, we can help you buy, rent, or sell it.",
],
"Do you handle commercial properties?": [
  "🏢 Yes, we do. We list commercial spaces such as offices, shops, warehouses, and even larger developments. If you’re looking for a business space, we can match you with locations that suit your type of business and budget.",
],
"Do you offer luxury properties?": [
  "🌟 Yes, we specialize in premium listings as well — including penthouses, villas, beachfront homes, and luxury estates. If you’re looking for something exclusive and high-end, we can connect you with the right properties.",
],
// ➕ Extra likely real-life questions
"Do you have land for sale?": [
  "🌱 Yes, we also list plots of land. Some are residential, some commercial, and we even feature land in developing areas for investment purposes. We’ll guide you on location, pricing, and the right paperwork to ensure it’s a safe purchase.",
],
"Can I find both new and old houses through you?": [
  "🏗️ Definitely. We list brand new builds as well as older, already lived-in houses. Some people prefer new developments, while others like homes with history and character. We make both options available.",
],
"Do you deal with developers directly?": [
  "🤝 Yes, in fact we partner with developers on new projects. That gives our clients early access to off-plan deals and fresh developments that might not yet be available on the open market."
],
  // 📅 Viewings & Tours
"How can I schedule a viewing?": 
  "📅 It’s very simple. Once you see a property you like, just let us know through the listing page or contact our office directly. We’ll arrange a convenient date and time, and one of our agents will personally meet you at the property to give you a tour.",

"Do you offer virtual tours?": 
  "🖥️ Yes, many of our properties now come with 3D virtual tours and video walk-throughs. This is especially helpful if you’re busy or not currently in town — you can explore the property online before deciding whether to book a physical visit.",

"Can I visit multiple properties in one day?": 
  "✔️ Absolutely. If you’d like to see several options in one day, we can arrange back-to-back viewings. Just share the list of properties you’re interested in, and we’ll organize the schedule so it’s smooth and convenient for you.",

// ➕ Extra likely real-life questions
"Do I need to pay before booking a viewing?": [
  "💳 No, viewings are completely free. You don’t need to make any payments before seeing a property. We only discuss fees or agreements after you’ve chosen a property you’re serious about.",
],
"How long does a typical viewing take?": [
  "⏳ On average, a property viewing takes about 20–40 minutes depending on the size of the property. Larger houses or estates may take a little longer because we go through every section carefully.",
],
"Can I bring family or friends to the viewing?": [
  "👨‍👩‍👧‍👦 Yes, of course. Many clients like to bring along family, friends, or even business partners to help with the decision. We actually encourage it so you feel more confident about your choice."
],
  // 💰 Pricing & Costs
"What’s the price range of your listings?": [
  "💰 Our listings cover a wide spectrum. For example, we have starter homes from around ₦20M, mid-range family houses, and luxury estates that go well into the hundreds of millions. It really depends on the location and features you’re looking for.",
  "We cater to every budget — whether you’re a first-time buyer looking for something affordable or an investor going for high-end properties."
],

"Do you charge commission?": [
  "Yes, we do charge commission, but it’s always agreed upon upfront. Typically, commissions in real estate here range between 5–10% depending on the property type and deal structure. We’ll make sure it’s clear before you commit to anything.",
  "✔️ Commission is standard practice, but we don’t spring surprises. Once we discuss the property with you, we’ll outline the exact rate and terms in writing."
],

"What are your agent fees?": [
  "Agent fees vary slightly depending on the service — for example, buying, renting, or leasing have different structures. But don’t worry, we provide a full breakdown before you sign any papers.",
  "Our fees are competitive compared to the market. For rentals, there’s usually a fixed percentage, and for sales, it’s tied to the property value. Everything is documented."
],

"Do you help with mortgages or financing?": [
  "🏦 Yes, we do. We’ve built relationships with banks and financing partners who help our clients secure mortgages. If you qualify, we’ll guide you step-by-step through the paperwork.",
  "Absolutely. Many of our clients get financing through trusted mortgage providers we recommend. We make introductions and stay with you during the process."
],

"Are there hidden charges?": [
  "❌ No, never. What we tell you upfront is exactly what you’ll pay. If there are taxes, legal fees, or extra costs tied to a property, we explain them before you commit.",
  "We believe in transparency. Every cost is listed in your contract so you’re not caught off guard later."
],

// ⭐ Extra Real-Life Questions
"Do you offer payment plans?": [
  "Yes, some developers we work with provide installment payment options, especially for off-plan projects. We’ll let you know which listings have flexible payment plans.",
  "Not all properties have payment plans, but when available, we’ll present you with the options and terms."
],

"How much do I need for the initial deposit?": [
  "It depends on the property. For rentals, landlords usually request 1–2 years upfront. For purchases, deposits often start from 10–30% of the property value.",
  "Each case is different, but we’ll tell you exactly what the required deposit is for any property you’re considering."
],

"Are there extra costs like legal or survey fees?": [
  "Yes, in addition to the property price, there are usually legal documentation fees, agency fees, and sometimes survey or deed registration costs. We’ll break them down for you.",
  "Think of it this way: apart from the purchase price, you should budget for lawyer’s fees and statutory charges. We’ll connect you with trusted professionals so there are no surprises."
],

// 📍 Location & Availability
"Which areas do you cover?": [
  "🌍 We cover a wide range of neighborhoods and cities. For example, in Lagos we list properties in Lekki, Ajah, Victoria Island, Ikeja, and more. If you’re looking outside Lagos, we also cover Abuja, Port Harcourt, and other major cities. Just let us know your preferred area, and we’ll show you available options.",
  "Our network spans across different regions, so whether you want something in a city center, a quiet suburban area, or a fast-developing community, we can help you find it."
],

"Do you have properties in [city/area]?": [
  "🏠 Most likely, yes. We update our listings regularly and usually have something in popular areas like [city/area]. If you give me the exact location you have in mind, I can quickly check what’s available right now.",
  "We do! You can use the search bar on our platform and filter by location. Even if you don’t see it online immediately, let us know — sometimes we have upcoming properties that aren’t yet published."
],

"Can I buy land through your company?": [
  "🌱 Absolutely. We handle land sales too — from verified residential plots to larger commercial lands. We always confirm ownership documents and make sure everything is properly verified before you commit.",
  "Yes, land sales are part of our services. Many of our clients buy plots either for building their own homes or for investment purposes."
],

"Do you deal with new developments?": [
  "🏗️ Yes. We regularly feature new developments and off-plan projects. These usually come with modern designs and flexible payment options, making them attractive for first-time buyers or investors.",
  "Definitely. We partner directly with trusted developers so we can give you access to brand-new projects, sometimes even before they hit the general market."
],

// ⭐ Extra Real-Life Questions
"Do you help with properties outside Nigeria?": [
  "Yes, we have international partners — especially in markets like Dubai, the UK, and the US. If you’re considering an investment abroad, we can link you to verified developers and agents.",
  "Our main focus is local, but we also list select international properties. Let us know where you’re interested in, and we’ll guide you to the right options."
],

"Can you help me find a property close to specific landmarks (schools, hospitals, transport)?": [
  "Of course. If you tell us your priorities — like being close to a good school, hospital, or public transport — we’ll narrow down the search to properties in that exact area.",
  "Yes. Location convenience is a big part of choosing a home, so we make sure to filter properties based on what matters most to you."
],

"Do you offer serviced apartments or short-let options in prime locations?": [
  "Yes, we list serviced apartments and short-lets, especially in high-demand areas like Victoria Island, Ikoyi, and Lekki Phase 1. They’re fully furnished and move-in ready.",
  "We do. Short-let and serviced apartments are very popular with clients who want flexibility without setting up utilities or furniture. We’ll show you the latest availability."
],

  // 📱 Services & Apps
"Is there a mobile app?": [
  "📱 Yes! We’re launching a mobile app very soon for both iOS and Android. The app will make it easier to search, save, and book viewings right from your phone.",
  "🚀 We’re finalizing a user-friendly app designed for convenience — you’ll be able to browse listings, chat with agents, and get instant updates on new properties."
],

"How do I sign up on your platform?": [
  "📝 It’s simple. Just click the ‘Sign Up’ button at the top right of our website, fill in your details, and create your account. Once you’re signed in, you can save favorites, book viewings, and receive updates.",
  "You can also sign up with your email or social accounts — it only takes a minute, and you’ll have full access to all our services."
],

"Can I search properties online?": [
  "🔎 Absolutely. Our website allows you to search and filter properties by type, price range, location, and even features like swimming pool or number of bedrooms.",
  "✔️ Yes, just use the search bar and filters to narrow down to exactly what you’re looking for — whether it’s apartments, houses, or commercial spaces."
],

// ⭐ Extra Real-Life Questions
"Can I save my favorite properties to check later?": [
  "Yes, once you’re signed in, you can bookmark any property and access your saved list anytime.",
  "Definitely. Just click the ‘save’ or ‘favorite’ icon on a property, and it’ll be stored in your personal dashboard."
],

"Will I get notifications when new properties are listed?": [
  "Yes — if you enable alerts, we’ll notify you when new properties that match your preferences are added.",
  "We send instant updates through email and, once the app is live, through push notifications too."
],

"Do you provide customer support through the app or website?": [
  "Of course. You can chat with our agents directly on the website, and once the app is launched, you’ll also have in-app messaging and support.",
  "Yes, customer support is built in. Whether you prefer live chat, email, or phone, you’ll always be able to reach us easily."
],
// 📞 Support & Contact
"How do I contact an agent?": [
  "📞 Every property listing has the agent’s direct contact information. You can call, WhatsApp, or send a quick message right from the property page.",
  "If you prefer, you can also request a callback, and one of our agents will reach out to you."
],

"Do you offer 24/7 support?": [
  "🕑 Yes, our support team is available 24/7. Whether it’s late at night or during weekends, you can always reach us for assistance.",
  "We believe property hunting doesn’t have a closing hour, so our lines and chat support are always open."
],

"Can I talk to someone directly?": [
  "🤝 Absolutely. You can call our customer care line anytime at +224-546-7860, and you’ll be connected to a real person right away.",
  "If you’d rather meet face-to-face, we can schedule an in-office appointment with one of our agents."
],

// ⭐ Extra Real-Life Questions
"Do you have a live chat option?": [
  "Yes, our website includes a live chat feature where you can get instant answers from our support team.",
  "Live chat is available directly on the site and, once the app is launched, it will be available there too."
],

"Can I reach you through WhatsApp or social media?": [
  "Definitely — many clients prefer using WhatsApp, and we’re also active on Facebook and Instagram for quick responses.",
  "Yes, you can message us on WhatsApp or DM us on our official social pages, and our team will respond promptly."
],

"Do you offer in-office consultations?": [
  "Yes, if you’d like to sit down and talk through your needs, you can book an appointment and visit our office.",
  "Of course. We welcome clients in our office where agents can provide tailored property advice in person."
],

 // 📑 Paperwork & Legal
"Do you help with paperwork?": [
  "📑 Yes, we guide you through every step of the paperwork — from initial agreements to final contracts. Our team makes sure you don’t miss any important detail.",
  "We also review documents with you so that everything is clear before you sign."
],

"What documents do I need to buy a property?": [
  "📝 Typically, you’ll need a valid ID, proof of income or financing approval, and proof of funds for the transaction. Depending on the property, we’ll let you know if additional documents are required.",
  "Don’t worry — we provide a checklist and walk you through the requirements step by step."
],

"Do you handle legal documentation?": [
  "⚖️ Yes, we work closely with trusted lawyers and notaries to ensure that all documents — contracts, deeds, and agreements — are valid and legally binding.",
  "This gives you peace of mind that the process is safe and fully compliant."
],

// ⭐ Extra Real-Life Questions
"Do you verify property ownership before I buy?": [
  "Yes, we carry out thorough due diligence to confirm property ownership and ensure there are no disputes or hidden liabilities.",
  "Verification is part of our process — we want you to be 100% confident in your purchase."
],

"Can you help me with title transfer after buying?": [
  "Absolutely. Once the purchase is completed, we assist with the title transfer and make sure your name is properly registered as the new owner.",
  "We work with the appropriate authorities to finalize the title transfer smoothly."
],

"Do you provide legal advice directly?": [
  "While we’re not a law firm, we connect you with qualified property lawyers who give expert legal advice tailored to your situation.",
  "Yes, we arrange for professional legal counsel whenever you need detailed legal guidance."
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
"renting": [
  "🏘️ We have a wide range of rental options — from budget-friendly apartments to premium serviced flats. Whether you’re looking for short-term stays or long-term leases, we’ll match you with the right property.",
  "Our agents also explain rental agreements, deposits, and move-in requirements so the process is smooth and transparent."
],
"Do you help with furnished apartments?": [
  "🛋️ Yes, we list fully-furnished, semi-furnished, and unfurnished apartments. If you’re relocating or want a quick move-in, furnished rentals are perfect.",
  "We also clarify what’s included in the furnishing — from basic appliances to complete setups."
],
"Can you help me find rentals close to my workplace?": [
  "Of course. Just tell us where you work, and we’ll recommend rental options within a convenient distance.",
  "We prioritize rentals that save you commuting time."
],
"Do you assist with rental agreements?": [
  "Yes, we make sure the agreements are clear, fair, and legally valid before you move in.",
  "Our team will walk you through every clause so there are no surprises."
],
"How much deposit do I need for a rental?": [
  "Most rentals require a security deposit, usually 1–3 months’ rent depending on the landlord.",
  "Don’t worry — we explain the terms upfront and advise you on refundable deposits."
],
"Can you help me with short-stay or Airbnb-style rentals?": [
  "Yes, we also have short-term and serviced rental listings for visitors, business trips, or temporary housing.",
  "These flexible rentals are designed for convenience and comfort."
],

// 🛒 Buying
"buying": [
  "🏡 You can buy houses, land, or even commercial properties through our platform. The process is simple: browse listings, book a viewing, and we’ll guide you through secure payment and ownership transfer.",
  "We also connect you with financing options if needed, so the buying journey is straightforward."
],
"Do you assist with mortgage or financing?": [
  "Yes, we connect buyers with trusted banks and mortgage providers for financing support.",
  "We’ll help you understand loan options and guide you through pre-approval."
],
"Can I negotiate property prices?": [
  "Absolutely. Our agents assist with negotiation to help you secure the best deal possible.",
  "We advise you on fair market value so you don’t overpay."
],
"Do you verify if the property is free from disputes?": [
  "Yes, part of our process is due diligence to confirm the property has no disputes, debts, or unpaid taxes.",
  "This ensures you buy with complete confidence and peace of mind."
],

// 💼 Selling
"selling": [
  "📢 Yes, we help property owners list and sell quickly. Our team markets your property across multiple channels to attract serious buyers.",
  "We also guide you on pricing and presentation to maximize your property’s value."
],
"Can I list my property with you?": [
  "✅ Absolutely. Property owners can list directly on our platform — just go to the ‘List Property’ section, upload your details, and our agents will review and publish it.",
  "If you prefer, you can also contact us directly and we’ll handle the listing for you."
],
"How fast can you sell my property?": [
  "⏱️ Speed depends on location, demand, and pricing — but many of our listings get interest within days.",
  "We actively promote new listings to ensure maximum visibility from the start."
],
"Do you help with property valuation before selling?": [
  "Yes, we provide valuation services so you know the fair market value before listing.",
  "Accurate valuation helps your property sell faster and ensures you don’t underprice or overprice it."
],
"Can you market my property to more buyers?": [
  "Definitely. We promote your property through social media, email alerts, and partner platforms.",
  "The goal is to maximize exposure and attract serious buyers quickly."
],
"Do you handle the paperwork after finding a buyer?": [
  "Yes, we assist you from negotiation through to final paperwork and closing.",
  "We also coordinate with lawyers and notaries to ensure everything is legally binding."
],

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
