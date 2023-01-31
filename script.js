'use strict';
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const section2 = document.querySelector('#section--2');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const header = document.querySelector('.header');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const slides = document.querySelectorAll('.slide');
const dotContainer = document.querySelector('.dots');

///////////////////////////////////////
// Modal window

const openModal = function (e) {
  e.preventDefault(); //html line 36. the default behavior of a link with href = # is to scroll to the top when clicked
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

btnScrollTo.addEventListener('click', function () {
  section1.scrollIntoView({ behavior: 'smooth' });
});

/////////Page Navigation//////////
//will use event delegation
//bad way bc it adds the event listener for every link. very inefficient
// document.querySelectorAll('.nav__link').forEach(link => {
//   link.addEventListener('click', function (e) {
//     e.preventDefault();
//     const id = this.getAttribute('href'); //don't want the absolute URL here so we don't use this.href
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

//good way bc it will add the event listener to a common parent element
document.querySelector('.nav__links').addEventListener('click', function (e) {
  console.log(e.target);

  //matching strategy
  if (e.target.classList.contains('nav__link')) {
    e.preventDefault();
    const id = e.target.getAttribute('href'); //don't want the absolute URL here so we don't use this.href
    console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

//tabbed component
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  //guard clause
  if (!clicked) return;

  //remove active clasess
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  //activate tab
  clicked.classList.add('operations__tab--active');

  //activate content area. the attributes are in the dataset property. we want tab (the part after data)
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

//menu fade animation. we use mouseover, not mouseenter because mouseenter does not bubble
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

//we can use the bind here because it'll create a copy of the handleHover function and we'll use the opacity for the this keyword
nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1));

// //sticky navigation. this way is not good
// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);

// window.addEventListener('scroll', function (e) {
//   if (window.scrollY > initialCoords.top) {
//     nav.classList.add('sticky');
//   } else {
//     nav.classList.remove('sticky');
//   }
// });

// //sticky navigation: intersection observer API
// //this callback function will get called each time the observed element intersects the root element at the defined threshold. entries are the array of threshold entries
// const obsCallback = function (entries, observer) {
//   entries.forEach(entry => {
//     console.log(entry);
//   });
// };

// const obsOptions = {
//   root: null, //root element is the element that we want our target element to intersect. writing null allows us to observe the target element intersecting the entire viewport
//   threshold: [0, 0.2], //threshold is the percentage of intersection at which the obsCallback will be called. the percentage of the target visibile in the viewport
// };
// const observer = new IntersectionObserver(obsCallback, obsOptions);
// observer.observe(section1);

//sticky navigation for the app
const navHeight = nav.getBoundingClientRect().height;
const stickyNav = function (entries) {
  const [entry] = entries; //destructure because entries is an array
  entry.isIntersecting
    ? nav.classList.remove('sticky')
    : nav.classList.add('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0, //when 0 % of the header is intersecting the viewport, stickyNav will be called
  rootMargin: `-${navHeight}px`, //this is to shorten the size of the header, so sticky will be applied 90 pixels before the header leaves the viewport (threshold was reached)
});
headerObserver.observe(header);

//reveal sections
const allSections = document.querySelectorAll('.section');
const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return; //guard condition
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target); //unobserve to prevent unecessary entry generation
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});
allSections.forEach(section => {
  sectionObserver.observe(section);
  //section.classList.add('section--hidden');
});

//lazy loading images. this is really great for performance. good for users who have a slow connection
const imgTargets = document.querySelectorAll('img[data-src]'); //we only want to select images with data-src attribute
const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return; //guard condition

  //replace the src with data-src. this replacement happens behind the scenes. JS will load the image behind the scenes then emit a load event. so we need to add an event listener to the target. we want the blur to be removed once the image has fully loaded.removing the image before will result in a not fully loaded image
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};

const imageObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', //increase the size of the viewport, so when images are 200px away from entering the viewport, they will be loaded, so loading appears seamless to the user
});

imgTargets.forEach(img => imageObserver.observe(img));

//slider
const slider = function () {
  let curSlide = 0;
  let maxSlide = slides.length;

  //slider functions
  const createDots = function () {
    slides.forEach((_, i) =>
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      )
    );
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    //utility function
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };
  const nextSlide = function () {
    //utility function
    curSlide === maxSlide - 1 ? (curSlide = 0) : curSlide++;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    curSlide === 0 ? (curSlide = maxSlide - 1) : curSlide--;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    //initialize slide 0, create dots and activate the 0 dot
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  init();

  //event handlers
  //next slide
  btnRight.addEventListener('click', nextSlide);

  //previous slide
  btnLeft.addEventListener('click', prevSlide);

  //arrow key functionality
  document.addEventListener('keydown', function (e) {
    e.key === 'ArrowRight' && nextSlide(); //can use short circuiting here bc next and prevSlide are true functions
    e.key === 'ArrowLeft' && prevSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset; //destructuring. { slide } references the slide key, so it will return that value
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

//lifecycle DOM events. lifecycle means from the moment when the page is first accessed to when the user leaves it
//DOMContentLoaded event is fired by the document after the HTML is parsed, downloaded and converted to the DOM tree - also all scripts must be downloaded and executed. putting the script tag at the end of the body is a good thing to practice because we do not need to wrap all our code in the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built!', e);
});

//load event is fired by the window after the DOM is built and all the images/external resources are loaded. this is going to be fired after the DOMContent
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

// //beforeunload event is fired by the window right before a user leaves the site. so when they click the red X. generally not a good idea to implement unless a user is filling out a form
// window.addEventListener('beforeunload', function (e) {
//   e.preventDefault();
//   console.log(e);
//   e.returnValue = ''; //this line has to be here for historical purposes
// });

/////////LECTURES////////////

// //selecting elements
// console.log(document.documentElement); //this is the entire html
// console.log(document.head); //select html head
// console.log(document.body); //select html body

// const allSections = document.querySelectorAll('.section'); //returns a NodeList. if a node is deleted the NodeList will not change
// console.log(allSections);

// document.getElementById('section--1'); //don't need a selector (.)
// const allButtons = document.getElementsByTagName('button'); //returns a HTML live collection (if HTML changes then the live collection is automatically updated)
// console.log(allButtons);

// console.log(document.getElementsByClassName('btn'));

// //creating and inserting elements
// //.insertAdjacentHTML

// const message = document.createElement('div');
// message.classList.add('cookie-message');
// //message.textContent = 'We use cookies for improved functionality and analytics';
// message.innerHTML =
//   'We use cookies for improved functionality and analytics.<button class="btn btn--close-cookie">Got it!</button>';
// //header.prepend(message); //prepend adds the parameter as the first child to the element it's called on. inserted here

// header.append(message); //append adds the paramter as the last child to the element it's called on. We can use both statements here and only have the message be in one place because 'message' is now a live element. it can't be at multiple places at the same time. moved here

// //header.append(message.cloneNode(true)); //used if we want to copy the element and have it appear twice

// //header.before(message); //inserts the message as a sibling before the header
// //header.after(message); //inserts the message as a sibling after the header

// //delete elements
// document
//   .querySelector('.btn--close-cookie')
//   .addEventListener('click', function () {
//     message.remove();

//     //old way is message.parentElement.removeChild(message)
//   });

// //styles
// //inline styles. styles set in the DOM. the style property only works for inline styles
// message.style.backgroundColor = '#37383d';
// message.style.width = '120%';
// console.log(message.style.backgroundColor);
// console.log(message.style.color); //won't work bc color is set in the stylesheet

// //need to use getComputedStyle() to get styles set in the stylesheet
// console.log(getComputedStyle(message).color);
// console.log(getComputedStyle(message).height);

// //increase message height by 40px
// message.style.height =
//   Number.parseFloat(getComputedStyle(message).height) + 30 + 'px';

// //working with css variables
// //document.documentElement.style works with the :root css element
// document.documentElement.style.setProperty('--color-primary', 'orangered');

// //attributes
// const logo = document.querySelector('.nav__logo');
// console.log(logo.alt);
// console.log(logo.src); ///prints the absolute location
// console.log(logo.getAttribute('src')); //prints the relative location
// console.log(logo.className);

// //set standard attributes
// logo.alt = 'Beautiftul minimalist logo';
// //set nonstandard attributes
// logo.setAttribute('company', 'Bankist');

// //adding a nonstandard HTML property on an object. js will not automatically create a property on that object
// console.log(logo.designer); //prints undefined

// //here's the workaround for that
// console.log(logo.getAttribute('designer'));

// //changing the href attribute
// const link = document.querySelector('.twitter-link');
// console.log(link.href);

// const btnLink = document.querySelector('.nav__link--btn');
// console.log(btnLink.href);
// console.log(btnLink.getAttribute('href'));

// //data attributes
// //version number is always in the dataset. data attribute has to start with data in html
// console.log(logo.dataset.versionNumber);

// //classes
// logo.classList.add('c', 'j');
// logo.classList.remove('c');
// logo.classList.toggle('c');
// logo.classList.contains('c');

// //implement smooth scrolling

// btnScrollTo.addEventListener('click', function (e) {
//   // const s1coords = section1.getBoundingClientRect();
//   // console.log(s1coords);
//   // setTimeout(() => {
//   //   console.log('Current Scroll (X/Y)', window.pageXOffset, window.pageYOffset),
//   //     1000;
//   // }); //how far we scrolled from the origin

//   // console.log(
//   //   'height/width viewport',
//   //   document.documentElement.clientHeight,
//   //   document.documentElement.clientWidth
//   // ); //height and width of the current viewport

//   //scrolling
//   // window.scrollTo(
//   //   s1coords.left + window.pageXOffset,
//   //   s1coords.top + window.pageYOffset
//   // ); //s1coords.top is only the distance from the top of section 1 to the top of the viewport. so it'll only work if we start from the top of the page. if we are scrolled down at all, that distance will be less, so we won't scroll all the way to the section. we need to add the current Y scroll to make it to the top of section 1 from anywhere

//   //there's a better way to scroll. pass in an object
//   // window.scrollTo({
//   //   left: s1coords.left + window.pageXOffset,
//   //   top: s1coords.top + window.pageYOffset,
//   //   behavior: 'smooth',
//   // });

//   //there's an even more modern way
//   section1.scrollIntoView({ behavior: 'smooth' });
// });

// //types of events
// //mouse enter event. first way. this way is better
const h1 = document.querySelector('h1');

// const alertH1 = function (e) {
//   alert('addEventListener: Great! you are reading the heading!');
//   h1.removeEventListener('mouseenter', alertH1); //if we want to remove the handler function we have to externalize it
// };

// h1.addEventListener('mouseenter', alertH1);

// //mouse enter event second way
// h1.onmouseenter = function (e) {
//   alert('onmouseenter: Great! you are reading the heading!');
// };

// //event propagation
// //event listeners, by default, pick up on events during the bubbling phase
// //rgb(255, 255, 255)
// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1) + min);

// const randomColor = () =>
//   `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;

// document.querySelector('.nav__link').addEventListener('click', function (e) {
//   this.style.backgroundColor = randomColor();
//   console.log('LINK', e.target, e.currentTarget);
//   console.log(e.currentTarget === this);

//   //stop event propagation
//   //e.stopPropagation(); usually not a good idea to stop event propagation
// });

// document.querySelector('.nav__links').addEventListener('click', function (e) {
//   this.style.backgroundColor = randomColor();
//   console.log('CONTAINER', e.target, e.currentTarget);
// });

// document.querySelector('.nav').addEventListener(
//   'click',
//   function (e) {
//     this.style.backgroundColor = randomColor();
//     console.log('NAV', e.target, e.currentTarget);
//   }
//   //true //setting this third argument to true will invoke the callback function during the capturing phase
// );

// //DOM traversing
// console.log(h1.querySelectorAll('.highlight')); //would go deep down as necessary in the DOM tree to return all h1 child elements with class highlight

// //going down: direct childern
// console.log(h1.childNodes); //returns every node in h1
// console.log(h1.children); //returns every element in h1

// h1.firstElementChild.style.color = 'white';
// h1.lastElementChild.style.color = 'orangered';

// //going up: parents
// console.log(h1.parentNode); //prints the same thing
// console.log(h1.parentElement); //prints the same thing

// //select far away parents. will find the parent no matter how far in the DOM tree
// h1.closest('.header').style.background = 'var(--gradient-secondary)'; //css variable
// //document.body.style.background = 'var(--gradient-secondary)'; //css variable

// h1.closest('h1').style.background = 'var(--gradient-primary)'; //css variable

// //going laterally: siblings
// console.log(h1.previousElementSibling);
// console.log(h1.nextElementSibling);

// console.log(h1.previousSibling);
// console.log(h1.nextSibling);

// //move up to the parent element then read all the children
// console.log(h1.parentElement.children);

// //we can spread the HTML collection because it's an iterable. let's modify the siblings but not h1 itself
// [...h1.parentElement.children].forEach(e => {
//   if (e !== h1) e.style.transform = 'scale(0.5)'; //css variable
// });
