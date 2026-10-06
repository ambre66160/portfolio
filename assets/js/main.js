import './layout.js';
import './smooth-scroll.js';
import './page-transition.js';
import './motion-interactions.js';
import './projects.js';
import './case-study-template.js';
import './contact.js';
const loadExperienceRing = () => {
	if (document.querySelector('[data-experience-ring-canvas]')) import('./experience-ring-carousel.js');
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadExperienceRing, { once: true });
else loadExperienceRing();
